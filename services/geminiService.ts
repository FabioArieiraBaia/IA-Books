import { GoogleGenAI, Type } from "@google/genai";
import { BookConfig, Chapter, Section, Language } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Limpeza robusta de resposta
const cleanTextResponse = (text: string | undefined): string => {
  if (!text) return "";
  const match = text.match(/```(?:html)?\s*([\s\S]*?)\s*```/i);
  if (match && match[1]) return match[1].trim();
  return text.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
};

const getLanguageInstruction = (lang: Language) => {
  return lang === 'pt-BR' 
    ? "Escreva estritamente em Português do Brasil." 
    : "Write strictly in English.";
};

// 1. Gerar Outline Profundo (Capítulos + Seções)
export const generateBookOutline = async (config: BookConfig): Promise<{ title: string; subtitle: string; chapters: Chapter[] }> => {
  const ai = getAI();
  
  const langInstr = getLanguageInstruction(config.language);

  const prompt = `Você é um Editor Chefe da editora IA Books. Sua tarefa é planejar um livro Bestseller sobre "${config.topic}".
  ${langInstr}
  Público: ${config.audience}.
  Tom: ${config.tone}.
  Autor: ${config.authorName}.
  
  Crie uma estrutura JSON complexa e detalhada.
  O livro deve ter um Título cativante e um Subtítulo promissor (no idioma solicitado).
  Crie entre 4 a 6 Capítulos.
  CRUCIAL: Cada Capítulo deve ter entre 3 a 5 "Seções" (subtópicos) detalhados.
  Para cada Seção, forneça um título e um "visualConcept" (uma descrição artística em INGLÊS para uma ilustração que acompanharia esse texto).`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          subtitle: { type: Type.STRING },
          chapters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                sections: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      visualConcept: { type: Type.STRING, description: "Descrição visual da cena para IA de imagem (Sempre em Inglês)" }
                    },
                    required: ["title", "visualConcept"]
                  }
                }
              },
              required: ["title", "description", "sections"]
            }
          }
        },
        required: ["title", "subtitle", "chapters"]
      }
    }
  });

  const data = JSON.parse(response.text || "{}");
  
  return {
    title: data.title,
    subtitle: data.subtitle,
    chapters: data.chapters.map((c: any, index: number) => ({
      id: `ch-${index + 1}`,
      title: c.title,
      description: c.description,
      sections: c.sections
    }))
  };
};

// 2. Gerar Conteúdo da Seção (Granular)
export const generateSectionContent = async (
  section: Section,
  chapter: Chapter,
  bookTitle: string, 
  config: BookConfig
): Promise<string> => {
  const ai = getAI();
  const langInstr = getLanguageInstruction(config.language);
  
  const prompt = `Escreva o conteúdo para a seção "${section.title}" que faz parte do capítulo "${chapter.title}" no livro "${bookTitle}".
  
  Contexto do Livro:
  - Público: ${config.audience}
  - Tom: ${config.tone}
  
  Instruções Editoriais:
  - ${langInstr}
  - Escreva texto profundo, analítico e envolvente.
  - Não faça introduções repetitivas como "Nesta seção...". Vá direto ao ponto.
  - Use formatação HTML semântica: <p>, <blockquote> (para destaques), <ul>/<li> (para listas).
  - NÃO use tags <h1> ou <h2>. Use <h3> se precisar de subtítulos internos.
  - Escreva cerca de 400-600 palavras de altíssima qualidade.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return cleanTextResponse(response.text);
};

// 3. Gerar Ilustração da Seção (Ultra Realista/Estilizada)
export const generateSectionImage = async (
  section: Section,
  style: string = "Cinematic lighting, hyper-detailed, editorial illustration, masterpiece, 8k"
): Promise<string | null> => {
  const ai = getAI();
  
  // O prompt de imagem combina o conceito da seção com um estilo premium
  const prompt = `Editorial book illustration. ${section.visualConcept}. Style: ${style}. 
  Avoid text inside the image. High contrast, professional color grading.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Image gen error:", error);
    // Em produção, poderíamos retornar uma imagem de placeholder elegante
    return null;
  }
};