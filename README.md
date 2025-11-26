# IA Books 📚✨

> **A Plataforma Definitiva de Publicação Editorial com Inteligência Artificial.**
>
> *Transforme ideias em eBooks profissionais, ilustrados e estruturados em minutos.*

![IA Books Banner](https://via.placeholder.com/1200x400?text=IA+Books+-+Powered+by+Fábio+Arieira)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stack](https://img.shields.io/badge/Stack-React%20|%20Node.js%20|%20Gemini-blue)](https://reactjs.org/)
[![Status](https://img.shields.io/badge/Status-Production-brightgreen)](https://iabooks.com.br)
[![Powered By](https://img.shields.io/badge/Powered%20By-Fábio%20Arieira-indigo)](https://iabooks.com.br)

---

## 🌐 Demonstração

Acesse a aplicação em produção: **[iabooks.com.br](https://iabooks.com.br)**

---

## 📖 Sobre o Projeto

**IA Books** não é apenas um gerador de texto; é um estúdio editorial completo movido por IA Generativa. Diferente de soluções que geram textos genéricos em bloco, o IA Books utiliza uma **Arquitetura Granular de Seções**, onde cada capítulo é planejado, subdividido, escrito e ilustrado individualmente.

O sistema simula o fluxo de trabalho de uma editora humana:
1.  **Editor Chefe (IA):** Planeja a estrutura, capítulos e define o conceito visual.
2.  **Redator Sênior (IA):** Escreve cada seção com profundidade analítica.
3.  **Ilustrador (IA):** Gera imagens contextuais para cada sub-tópico.
4.  **Diagramador (Engine):** Compila tudo em um formato HTML/PDF editorial "Full-Bleed".
5.  **Biblioteca Pública:** Um sistema completo de publicação onde visitantes podem ler as obras criadas.

Desenvolvido com foco em UX Premium, performance e qualidade de saída.

---

## ✨ Funcionalidades Principais

### 🧠 Núcleo de Geração Granular
*   **Deep Outline:** A IA cria uma árvore hierárquica (Livro -> Capítulos -> Seções).
*   **Escrita Contextual:** Cada seção possui entre 400-600 palavras de conteúdo denso, evitando repetições.
*   **Ilustração Dinâmica:** Integração com **Gemini 2.5 Flash Image** para gerar de 15 a 30 ilustrações únicas por livro, baseadas no contexto exato da seção.

### 🎨 Interface & UX
*   **Terminal Sci-Fi:** Visualize o "cérebro" da IA trabalhando em tempo real com logs de sistema, uso de CPU simulado e progresso de renderização.
*   **Intro 3D:** Animação de entrada imersiva com paralaxe CSS e elementos flutuantes.
*   **Leitor Imersivo:** Modo de leitura focado na experiência do usuário final, sem distrações.

### 🏛️ Biblioteca Pública & Backend
*   **Backend Node.js Customizado:** API RESTful própria servindo um banco de dados JSON de alta performance.
*   **Persistência de Dados:** Livros publicados ficam disponíveis para qualquer visitante.
*   **Galeria Social:** Sistema de Likes e visualização de capas geradas.

### 📤 Exportação Profissional
*   **HTML Editorial:** Gera um arquivo HTML único, autocontido, com CSS para impressão (Print CSS) otimizado.
*   **Backup JSON:** Permite salvar a estrutura bruta do livro para regeneração ou edição futura.

---

## 🛠️ Tech Stack

### Frontend (Client)
*   **Framework:** [React 18](https://reactjs.org/)
*   **Estilização:** [Tailwind CSS](https://tailwindcss.com/) + Tailwind Typography (Prose)
*   **Ícones:** [Lucide React](https://lucide.dev/)
*   **IA Client:** Google GenAI SDK (`@google/genai`)

### Backend (Server)
*   **Runtime:** [Node.js](https://nodejs.org/)
*   **Framework:** Express.js
*   **Database:** JSON File System (NoSQL-like local storage)
*   **CORS & BodyParser:** Configurado para suportar payloads grandes (Imagens Base64).

### Inteligência Artificial
*   **Orquestrador:** Google Gemini 2.5 Flash
*   **Visão/Imagem:** Google Gemini 2.5 Flash Image

---

## 🚀 Instalação e Execução

Este projeto opera em uma arquitetura **Client-Server**. Você precisará rodar ambos os terminais.

### Pré-requisitos
*   Node.js (v16 ou superior)
*   NPM ou Yarn
*   Chave de API do Google Gemini (`API_KEY`)

### 1. Configuração do Backend (Banco de Dados)

O backend é responsável por salvar e servir os livros publicados.

```bash
# Entre na pasta do projeto onde está o arquivo server.js
# Instale as dependências do servidor
npm install express cors body-parser

# Inicie o servidor (Rodará na porta 3001)
node server.js
```

*O servidor criará automaticamente um arquivo `database.json` na primeira execução.*

### 2. Configuração do Frontend (Aplicação)

```bash
# Instale as dependências do React
npm install

# Configure sua chave de API
# Crie um arquivo .env na raiz ou configure no seu ambiente
export API_KEY="SUA_CHAVE_GEMINI_AQUI"

# Inicie a aplicação React
npm start
```

Acesse **http://localhost:3000** (ou a porta definida pelo seu bundler).

---

## 📡 Documentação da API (Backend)

O servidor roda em `http://localhost:3001`.

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/books` | Retorna lista resumida de livros (para a Galeria). |
| `GET` | `/books/:id` | Retorna o conteúdo completo de um livro específico. |
| `POST` | `/books` | Publica um novo livro. Requer JSON no corpo. |
| `POST` | `/books/:id/like` | Incrementa o contador de likes de um livro. |

---

## 📂 Estrutura do Projeto

```
/
├── components/          # Componentes React (UI)
│   ├── BookPreview.tsx  # Renderizador final e exportação
│   ├── GeneratorView.tsx# Terminal de visualização da IA
│   ├── IntroAnimation.tsx # Intro 3D
│   ├── Library.tsx      # Galeria pública
│   ├── OutlineEditor.tsx# Editor de estrutura
│   └── Reader.tsx       # Leitor de livros publicados
├── services/
│   ├── dbService.ts     # Cliente HTTP para o Backend Node
│   └── geminiService.ts # Integração com Google AI
├── server.js            # Servidor Node.js (Backend)
├── types.ts             # Definições de Tipos TypeScript
├── App.tsx              # Componente Raiz e Roteamento
├── index.html           # Entry point
└── README.md            # Documentação
```

---

## 🤝 Contribuição

Contribuições são bem-vindas! Se você deseja melhorar o IA Books:

1.  Faça um Fork do projeto.
2.  Crie uma Branch para sua Feature (`git checkout -b feature/IncrivelFeature`).
3.  Commit suas mudanças (`git commit -m 'Add: IncrivelFeature'`).
4.  Push para a Branch (`git push origin feature/IncrivelFeature`).
5.  Abra um Pull Request.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

### Desenvolvido com 💙 e IA por **Fábio Arieira**

[Website](https://iabooks.com.br) • [GitHub](https://github.com/fabioarieira) • [LinkedIn](https://linkedin.com/in/fabioarieira)

</div>
