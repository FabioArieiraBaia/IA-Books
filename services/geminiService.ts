
import { GoogleGenAI, Type } from "@google/genai";
import { BookSize } from "../types";

export type ImageProvider = 'gemini' | 'flux' | 'pollinations';

// Helper to get image URL from Pollinations with Model support
export const getPollinationsUrl = (prompt: string, width = 800, height = 1200, model: string = 'flux'): string => {
  const encodedPrompt = encodeURIComponent(prompt);
  // Pollinations models: 'flux', 'turbo', 'midjourney' (sometimes available)
  // We default to 'flux' as it is the current SOTA there.
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${model}&nologo=true&seed=${Math.floor(Math.random() * 10000)}`;
};

// ---------------------------------------------------------
// CLIENT-SIDE API KEY MANAGEMENT (ROTATION SUPPORT)
// ---------------------------------------------------------

const getApiKeys = (): string[] => {
    const raw = localStorage.getItem('iabooks_api_key');
    if (!raw) return [];
    // Split by comma, trim whitespace, and filter empty strings
    return raw.split(',').map(k => k.trim()).filter(k => k.length > 0);
};

// ---------------------------------------------------------
// ROBUST FALLBACK ENGINE
// ---------------------------------------------------------
// Updated models: Start with 2.5 Pro (Preview), fallback to 2.5 Flash.
const TEXT_MODELS = ['gemini-2.5-pro-preview', 'gemini-2.5-flash'];

async function generateWithFallback<T = string>(
    operation: (ai: GoogleGenAI, model: string) => Promise<T>
): Promise<T> {
    const keys = getApiKeys();
    if (keys.length === 0) throw new Error("API_KEY_MISSING");

    let lastError;

    // Outer Loop: Models (Try best model first)
    for (const model of TEXT_MODELS) {
        // Inner Loop: API Keys (Round-robin / Failover)
        for (const apiKey of keys) {
            try {
                // Instantiate client freshly with current key
                const ai = new GoogleGenAI({ apiKey: apiKey });
                const result = await operation(ai, model);
                if (result) return result;
            } catch (error: any) {
                const errMsg = error.message || '';
                console.warn(`[iabooks] Model ${model} failed with key ending in ...${apiKey.slice(-4)}:`, errMsg);
                lastError = error;
                
                // CRITICAL ERROR HANDLING STRATEGY
                
                // 1. Quota Exceeded (429) -> Try NEXT KEY immediately
                if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('resource_exhausted')) {
                    console.info("Quota exceeded. Switching API Key...");
                    continue; // Moves to next key in inner loop
                }

                // 2. Auth Error (403/400) -> Try NEXT KEY
                if (errMsg.includes('API_KEY') || errMsg.includes('403') || errMsg.includes('permission_denied')) {
                     console.info("Invalid Key. Switching API Key...");
                     continue;
                }

                // 3. Overloaded Model (503) -> Try NEXT KEY (sometimes helps) or BREAK to NEXT MODEL
                if (errMsg.includes('503') || errMsg.includes('overloaded')) {
                    await new Promise(r => setTimeout(r, 1500)); // Slight backoff
                    continue; 
                }

                // 4. Content Blocked/Safety -> Break Key Loop, Try NEXT MODEL (maybe less strict)
                break; // Breaks inner loop, goes to next model
            }
        }
    }
    
    throw lastError || new Error("Falha na geração. Verifique suas chaves API ou tente outro tema.");
}

// ---------------------------------------------------------
// HELPER: ROBUST JSON PARSER & SANITIZER
// ---------------------------------------------------------
function cleanAndParseJSON(text: string | undefined): any {
    if (!text) return {};
    
    // 1. Remove Markdown code blocks if present (Legacy fallback)
    let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // 2. Extract only the JSON object (find first '{' and last '}')
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
        clean = clean.substring(firstBrace, lastBrace + 1);
    }

    try {
        return JSON.parse(clean);
    } catch (e) {
        console.error("JSON Parse Failed. Raw text:", text);
        // Try to recover from common JSON errors if needed, or throw
        throw new Error("Falha ao interpretar resposta da IA. Tente novamente.");
    }
}

// Helper to clean "dirty" titles containing instructions like (Foco no contexto...)
function sanitizeTitle(rawTitle: string): string {
    if (!rawTitle) return "Capítulo Sem Título";

    let clean = rawTitle;

    // 1. Remove parenthetical instructions usually longer than 15 chars or containing keywords
    clean = clean.replace(/\(([^)]+)\)/g, (match, content) => {
        if (content.length > 25 || content.toLowerCase().includes('foco') || content.toLowerCase().includes('instrução') || content.toLowerCase().includes('capítulo')) {
            return ''; 
        }
        return match;
    });

    // 2. Remove instructions after dashes if they are too long
    if (clean.includes(' - ')) {
        const parts = clean.split(' - ');
        if (parts[1] && parts[1].length > 30) {
            clean = parts[0];
        }
    }

    // 3. Remove known AI prefixes (Portuguese & English)
    clean = clean.replace(/^(Capítulo|Chapter) \d+:/i, '').trim();
    clean = clean.replace(/^\d+\./, '').trim();

    // 4. Hard truncation if it's still massive (Safety net)
    if (clean.length > 80) {
        const lastSpace = clean.lastIndexOf(' ', 80);
        clean = clean.substring(0, lastSpace > 0 ? lastSpace : 80) + "...";
    }

    return clean.trim();
}

// Helper to map language codes to full names for Prompting
const getLanguageName = (code: string): string => {
    const languages: {[key: string]: string} = {
        'pt': 'Portuguese (PT-BR)', 'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
        'it': 'Italian', 'ja': 'Japanese', 'ko': 'Korean', 'zh': 'Chinese (Simplified)', 'ru': 'Russian',
        'hi': 'Hindi', 'ar': 'Arabic', 'nl': 'Dutch', 'pl': 'Polish', 'tr': 'Turkish', 'sv': 'Swedish'
    };
    return languages[code] || 'Portuguese (PT-BR)';
};

// ---------------------------------------------------------
// BRANDING INJECTION (HTML Templates)
// ---------------------------------------------------------
const IABOOKS_INTRO_HTML = `
<div style="background-color: #000000; padding: 2.5rem; border: 2px solid #f59e0b; border-radius: 12px; margin-bottom: 2rem; box-shadow: 0 10px 30px rgba(245,158,11,0.2); text-align: center;">
    <h3 style="color: #f59e0b; font-family: 'Merriweather', serif; font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 2px;">
        IABOOKS ORIGINAL
    </h3>
    <hr style="border: 0; border-top: 1px solid #333; margin: 1.5rem auto; width: 50%;">
    <p style="color: #e5e5e5; font-size: 1.1rem; line-height: 1.6; font-family: 'Inter', sans-serif;">
        Esta obra foi arquitetada e escrita em colaboração com <strong>Inteligência Artificial</strong>.
    </p>
    <p style="color: #a3a3a3; font-size: 0.9rem; margin-top: 1rem;">
        Uma produção exclusiva da comunidade.
    </p>
    <div style="margin-top: 2rem;">
        <a href="https://iabooks.com.br" target="_blank" style="display: inline-block; background-color: #f59e0b; color: #000; padding: 10px 20px; font-weight: bold; text-decoration: none; border-radius: 9999px; font-size: 0.9rem;">
            Crie seu eBook Gratuitamente
        </a>
    </div>
</div>
`;

const IABOOKS_OUTRO_HTML = `
<div style="background-color: #1a1a1a; padding: 3rem 2rem; border-top: 4px solid #f59e0b; margin-top: 4rem; text-align: center;">
    <div style="width: 60px; height: 60px; background-color: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem auto;">
        <span style="font-family: 'Merriweather', serif; font-weight: bold; font-size: 1.5rem; color: #000;">ia</span>
    </div>
    <h3 style="color: #fff; font-size: 1.8rem; font-weight: bold; font-family: 'Merriweather', serif; margin-bottom: 1rem;">
        Publique seu Legado
    </h3>
    <p style="color: #a3a3a3; max-width: 600px; margin: 0 auto 2rem auto; line-height: 1.6;">
        Este livro foi gerado pela tecnologia <strong>IABOOKS</strong>. Junte-se à maior biblioteca gratuita de IA do mundo e compartilhe seu conhecimento.
    </p>
    <a href="https://iabooks.com.br" target="_blank" style="color: #f59e0b; font-weight: bold; font-size: 1.2rem; text-decoration: none; border-bottom: 2px solid #f59e0b;">
        iabooks.com.br
    </a>
</div>
`;

// ---------------------------------------------------------
// AGENT: CHAT PERSONA
// ---------------------------------------------------------
export const generateChatResponse = async (roomName: string, roomTopic: string, userMessage: string, history: string[]) => {
    const prompt = `
      Você é um participante ativo e especialista em uma sala de bate-papo literário.
      Sala: "${roomName}" (Tópico: ${roomTopic}).
      Mensagem do usuário: "${userMessage}"
      Seja breve, amigável e interaja diretamente com o usuário.
      Sua resposta (curta, máx 2 frases):
    `;
  
    return generateWithFallback(async (ai, model) => {
        // Chat uses the faster model passed by the loop (Flash usually)
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', 
            contents: prompt,
        });
        return response.text?.trim() || "";
    }).catch(() => "Interessante ponto de vista!");
};

// ---------------------------------------------------------
// AGENT 1: PLANNER (Roteirista/Planejador)
// ---------------------------------------------------------
export const generateBookPlan = async (topic: string, type: BookSize, extraContext: string, language: string = 'pt') => {
  const langName = getLanguageName(language);
  let complexity = "";
  let chapterCountInfo = "";

  switch (type) {
    case 'apostila':
      complexity = "concisa, educativa, focada em aprendizado prático.";
      chapterCountInfo = "3 a 5 módulos fundamentais.";
      break;
    case 'ebook':
      complexity = "narrativa envolvente, informativa.";
      chapterCountInfo = "5 a 8 capítulos.";
      break;
    case 'livro':
      complexity = "profunda, detalhada, literária.";
      chapterCountInfo = "10 a 12 capítulos detalhados.";
      break;
  }

  const prompt = `
    Role: World-Class Book Architect & Editor.
    Task: Create a bestseller outline for a "${type}" about "${topic}".
    Context: "${extraContext}".
    Language: ${langName} (Ensure title and chapters are in this language).
    Style: ${complexity}
    Structure: ${chapterCountInfo}
  `;

  const bookPlanSchema = {
    type: Type.OBJECT,
    properties: {
      title: { 
          type: Type.STRING,
          description: "The main title of the book in the target language."
      },
      description: { 
          type: Type.STRING,
          description: "A compelling summary (max 300 chars)."
      },
      chapters: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING }
          },
          required: ["title", "summary"]
        }
      }
    },
    required: ["title", "description", "chapters"]
  };

  return generateWithFallback(async (ai, model) => {
      const response = await ai.models.generateContent({
        model: model, 
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: bookPlanSchema,
            temperature: 0.7 
        }
      });
      
      const parsed = cleanAndParseJSON(response.text);
      
      if (parsed.chapters) {
          parsed.chapters = parsed.chapters.map((ch: any) => ({
              ...ch,
              title: sanitizeTitle(ch.title),
              summary: ch.summary || "Conteúdo detalhado."
          }));
          
          const introTitle = language === 'pt' ? "Prefácio IABOOKS" : "IABOOKS Preface";
          const outroTitle = language === 'pt' ? "Legado Digital" : "Digital Legacy";
          
          parsed.chapters.unshift({
                title: introTitle,
                summary: "Intro",
                content: IABOOKS_INTRO_HTML,
                imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop",
                imagePrompt: "Futuristic digital library interface"
          });
          parsed.chapters.push({
                title: outroTitle,
                summary: "Outro",
                content: IABOOKS_OUTRO_HTML,
                imagePrompt: ""
          });
      }
      return parsed;
  });
};

// ---------------------------------------------------------
// AGENT 1.5: METADATA SPECIALIST
// ---------------------------------------------------------
export const generateBookMetadata = async (title: string, description: string, language: string = 'pt') => {
    const langName = getLanguageName(language);
    const prompt = `
      Task: Generate metadata for book "${title}".
      Language: ${langName}.
    `;

    const metadataSchema = {
        type: Type.OBJECT,
        properties: {
            tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            },
            category: { type: Type.STRING }
        },
        required: ["tags", "category"]
    };
  
    return generateWithFallback(async (ai, model) => {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: { 
                responseMimeType: "application/json",
                responseSchema: metadataSchema
            }
        });
        return cleanAndParseJSON(response.text);
    }).catch(() => ({ tags: ["Geral"], category: "Outros" }));
};

// ---------------------------------------------------------
// AGENT 2: ART DIRECTOR (Cover)
// ---------------------------------------------------------
export const generateCoverPrompt = async (bookTitle: string, bookDescription: string, type: BookSize) => {
  const prompt = `
    Role: Award-winning Art Director.
    Task: Create a visually stunning, highly detailed image prompt for a book cover.
    Book: "${bookTitle}"
    Type: ${type}
    Synopsis: "${bookDescription}"
    
    Guidelines:
    - Use artistic keywords (e.g., cinematic lighting, 8k, masterpiece, photorealistic or stylized).
    - Focus on the central theme metaphor.
    - OUTPUT: ONLY the English prompt text.
  `;

  return generateWithFallback(async (ai, model) => {
    const response = await ai.models.generateContent({
      model: model, 
      contents: prompt,
    });
    return response.text?.trim() || `Book cover for ${bookTitle}`;
  });
};

// ---------------------------------------------------------
// MANUAL IMAGE GENERATOR (Admin Choice)
// ---------------------------------------------------------
export const generateImageByProvider = async (prompt: string, provider: ImageProvider, width = 800, height = 1200): Promise<string> => {
    
    // 1. GEMINI (Google)
    if (provider === 'gemini') {
        const keys = getApiKeys();
        if (keys.length === 0) throw new Error("API Key ausente para Gemini Image.");

        for (const key of keys) {
            try {
                const ai = new GoogleGenAI({ apiKey: key });
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image', 
                    contents: { parts: [{ text: prompt }] }
                });

                const parts = response.candidates?.[0]?.content?.parts;
                if (parts) {
                    for (const part of parts) {
                        if (part.inlineData && part.inlineData.mimeType.startsWith('image')) {
                            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                        }
                    }
                }
            } catch (e) {
                console.warn(`[iabooks] Gemini Image failed on key ...${key.slice(-4)}`, e);
            }
        }
        throw new Error("Falha ao gerar imagem com Gemini.");
    }

    // 2. POLLINATIONS (Flux or Turbo)
    const model = provider === 'flux' ? 'flux' : 'turbo';
    return getPollinationsUrl(prompt, width, height, model);
};


// ---------------------------------------------------------
// HYBRID IMAGE GENERATOR (Auto Fallback)
// ---------------------------------------------------------
export const generateHybridCover = async (prompt: string): Promise<string> => {
    // Tries Gemini -> Fallbacks to Pollinations Flux
    try {
        return await generateImageByProvider(prompt, 'gemini');
    } catch (e) {
        console.log("[iabooks] Fallback to Pollinations Flux for cover.");
        return getPollinationsUrl(prompt, 800, 1200, 'flux');
    }
};

// ---------------------------------------------------------
// AGENT 3: BESTSELLER WRITER (Content)
// ---------------------------------------------------------
export const writeChapterContent = async (
  bookTitle: string, 
  chapterTitle: string, 
  chapterSummary: string, 
  bookType: BookSize,
  language: string = 'pt'
) => {
  const cleanChapterTitle = sanitizeTitle(chapterTitle);
  const langName = getLanguageName(language);
  
  let styleGuide = "";
  if (bookType === 'apostila') {
      styleGuide = "Didactic, clear, structured with bullet points and 'Key Takeaways' boxes. Educational tone.";
  } else {
      styleGuide = `
        BESTSELLER MODE ACTIVATED.
        - Style: Immersive, engaging, rich in metaphors and sensory details.
        - Technique: "Show, don't tell". Don't say it was scary, describe the cold sweat.
        - Rhythm: Vary sentence length. Use strong verbs. Avoid repetitive AI patterns.
        - Tone: Human, profound, magnetic.
        - Formatting: Use elegant HTML (<h2>, <blockquote>, <p>).
      `;
  }

  const prompt = `
    Role: Elite International Bestselling Author.
    Task: Write the full content for chapter: "${cleanChapterTitle}".
    Book: "${bookTitle}"
    Context: "${chapterSummary}"
    Target Language: ${langName.toUpperCase()}.
    
    ${styleGuide}
    
    IMPORTANT: Return ONLY the HTML body content (no <html> tags, just the inner content).
  `;

  return generateWithFallback(async (ai, model) => {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    let html = response.text || "";
    html = html.replace(/```html/g, '').replace(/```/g, '').trim();
    return html;
  });
};

// ---------------------------------------------------------
// AGENT 4: ILLUSTRATOR (Prompt Only)
// ---------------------------------------------------------
export const generateChapterImagePrompt = async (chapterTitle: string, chapterContent: string) => {
   const cleanTitle = sanitizeTitle(chapterTitle);
   const prompt = `
    Role: Editorial Illustrator.
    Task: Create a short, artistic English image prompt for chapter "${cleanTitle}".
    Excerpt: "${chapterContent.substring(0, 200)}..."
    Style: Digital Art, Cinematic, Evocative.
    Output: Only the prompt text.
  `;
  
  return generateWithFallback(async (ai, model) => {
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });
    return response.text?.trim() || "Abstract artistic illustration";
  });
};
