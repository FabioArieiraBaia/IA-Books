# 📚 IA-Books: Gerador de Ebooks Profissionais

<div align="center">

</div>

## 📖 Descrição do Projeto

O **IA-Books** é uma plataforma inovadora que permite aos usuários criar, ler e compartilhar livros (apostilas, e-books e livros completos) gerados com o auxílio de Inteligência Artificial. O projeto é construído com uma arquitetura **Client-Side Secure**, onde a lógica de geração de conteúdo e a persistência de dados primária são realizadas no lado do cliente (navegador), garantindo a privacidade e o controle do usuário sobre suas criações.

A aplicação utiliza a API do Google Gemini para planejar, escrever e gerar ativos (como prompts de imagem) para os livros, oferecendo uma experiência completa de autoria assistida por IA.

**Acesse a aplicação em produção:** [iabooks.com.br](https://iabooks.com.br)

## ✨ Funcionalidades Principais

- **Criação de Livros por IA:** Geração de livros em três formatos (`apostila`, `ebook`, `livro`) com planejamento de capítulos, escrita de conteúdo e sugestão de imagens de capa/capítulos
- **Agentes de Geração:** Utiliza agentes especializados (Planner, Art Director, Writer) para um processo de criação robusto
- **Leitura Imersiva:** Interface de leitura otimizada para diferentes dispositivos
- **Biblioteca Local:** Armazenamento de livros criados localmente no navegador via **IndexedDB**, permitindo uso offline e garantindo a segurança dos dados
- **Publicação Híbrida:** Opção de publicar livros para uma biblioteca pública (via backend PHP opcional) com sincronização local
- **PWA (Progressive Web App):** Suporte para instalação e uso como aplicativo nativo
- **Internacionalização (i18n):** Suporte a múltiplos idiomas
- **Tema Dinâmico:** Suporte a temas claro e escuro
- **Segurança:** Criptografia client-side e armazenamento local seguro

## 🛠️ Tecnologias Utilizadas

| Categoria              | Tecnologia                       | Descrição                                                                                |
| ---------------------- | -------------------------------- | ---------------------------------------------------------------------------------------- |
| **Frontend**           | React (v19)                      | Biblioteca JavaScript para construção da interface do usuário.                           |
| **Linguagem**          | TypeScript                       | Superset de JavaScript que adiciona tipagem estática.                                    |
| **Build Tool**         | Vite (v6)                        | Empacotador de módulos de próxima geração, rápido e otimizado.                           |
| **Estilização**        | Tailwind CSS                     | Framework CSS utilitário para design rápido e responsivo.                                 |
| **Roteamento**         | React Router DOM (v7)            | Gerenciamento de rotas da aplicação.                                                     |
| **IA**                 | Google GenAI SDK (@google/genai) | Integração com os modelos Gemini para geração de texto e planejamento.                   |
| **Banco de Dados**     | IndexedDB                        | Armazenamento de dados no lado do cliente para persistência local e offline.             |
| **Ícones**             | Lucide React                     | Biblioteca de ícones moderna e leve.                                                     |
| **Backend (Opcional)** | PHP                              | Scripts simples (save_book.php, list_books.php) para sincronização de livros públicos. |

## 🏗️ Arquitetura Client-Side Secure

A arquitetura do IA-Books é notável por sua abordagem "Client-Side Secure":

1. **Geração de Conteúdo:** Toda a comunicação com a API do Gemini é feita diretamente do navegador do usuário. A chave de API é gerenciada localmente (`localStorage`) e não é armazenada no servidor.
2. **Persistência Local:** Os livros são salvos primariamente no **IndexedDB** do navegador, garantindo que o usuário mantenha a posse de seus dados.
3. **Sincronização Híbrida:** O serviço de API (`services/api.ts`) tenta publicar livros para um backend PHP opcional (`save_book.php`) para compartilhamento público, mas o salvamento local é sempre o primeiro passo e o _fallback_ em caso de falha de conexão.

## 📋 Pré-requisitos

Para executar o projeto localmente, você precisará ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** ou **pnpm** (gerenciador de pacotes)
- Uma **Chave de API do Google Gemini** (necessária para a funcionalidade de geração de livros)

## 🚀 Instalação e Execução Local

Siga os passos abaixo para configurar e executar o projeto em seu ambiente local:

### 1. Clonar o Repositório

```bash
git clone https://github.com/FabioArieiraBaia/IA-Books.git
cd IA-Books
```

### 2. Instalar Dependências

Utilize o npm ou pnpm para instalar as dependências do projeto:

```bash
npm install
# ou
pnpm install
```

### 3. Configurar a Chave de API do Gemini

O projeto espera que a chave de API seja fornecida pelo usuário. No ambiente de desenvolvimento, você pode usar o arquivo `.env.local`.

1. Crie um arquivo chamado `.env.local` na raiz do projeto (se ainda não existir).
2. Adicione sua chave de API do Gemini:

```env
# .env.local
GEMINI_API_KEY="SUA_CHAVE_AQUI"
```

> **Nota:** O código (`services/geminiService.ts`) também suporta a leitura de chaves de API armazenadas no `localStorage` do navegador, permitindo que o usuário final insira sua própria chave diretamente na aplicação.

### 4. Executar o Aplicativo

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O aplicativo estará acessível em `http://localhost:3000` (ou a porta indicada pelo Vite).

### 5. Build para Produção

Para criar uma versão otimizada para produção:

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`.

## 📁 Estrutura de Arquivos

A estrutura do projeto segue um padrão modular e limpo:

```
IA-Books/
├── assets/                 # Ativos estáticos (ex: logo.svg)
├── components/             # Componentes reutilizáveis da UI
│   ├── AgentDisplay.tsx
│   ├── DataSafetyModal.tsx
│   ├── InstallPwaNotification.tsx
│   ├── Navbar.tsx
│   └── SEO.tsx
├── context/                # Contextos React (Auth, Book, Theme, Language)
│   ├── AuthContext.tsx
│   ├── BookContext.tsx
│   ├── LanguageContext.tsx
│   └── ThemeContext.tsx
├── locales/                # Arquivos de internacionalização
│   └── translations.ts
├── pages/                  # Páginas principais da aplicação
│   ├── CreateBook.tsx
│   ├── Library.tsx
│   ├── Privacy.tsx
│   ├── Profile.tsx
│   ├── ReadBook.tsx
│   ├── ReadingRoom.tsx
│   └── Terms.tsx
├── services/               # Lógica de negócio e serviços externos
│   ├── analyticsService.ts
│   ├── api.ts              # Serviço de API híbrido (PHP + IndexedDB)
│   ├── cryptoService.ts
│   ├── db.ts               # Funções de manipulação do IndexedDB
│   └── geminiService.ts    # Lógica de interação com a API do Gemini
├── App.tsx                 # Componente principal e roteamento
├── index.tsx               # Ponto de entrada do React
├── index.html              # HTML base
├── index.css               # Estilos globais
├── types.ts                # Definições de tipos TypeScript
├── package.json            # Dependências e scripts
├── tsconfig.json           # Configuração do TypeScript
├── vite.config.ts          # Configuração do Vite
├── manifest.json           # Manifesto PWA
├── sw.js                   # Service Worker para PWA
├── save_book.php           # Script PHP opcional para salvar livros públicos
├── list_books.php          # Script PHP opcional para listar livros públicos
└── README.md               # Este arquivo
```

## 🔐 Segurança e Privacidade

- **Client-Side Secure:** Todos os dados sensíveis permanecem no navegador do usuário
- **Criptografia Local:** Dados são criptografados antes do armazenamento
- **Sem Tracking:** Não há rastreamento de usuários ou coleta de dados pessoais
- **Armazenamento Local:** IndexedDB garante que os dados não saiam do dispositivo

## 🌐 Internacionalização

O projeto suporta múltiplos idiomas através do sistema de traduções em `locales/translations.ts`. Atualmente suporta:
- Português (pt)
- Inglês (en)

## 🎨 Temas

O aplicativo suporta temas claro e escuro, com transições suaves entre os modos. A preferência do usuário é salva localmente.

## 📱 Progressive Web App (PWA)

O IA-Books é uma PWA completa, permitindo:
- Instalação como aplicativo nativo
- Funcionamento offline
- Notificações push (futuro)
- Experiência de aplicativo nativo

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir _issues_ ou enviar _pull requests_.

## 📄 Licença

Este projeto está licenciado sob a Licença MIT.

## 👨‍💻 Desenvolvedor e Créditos

### Desenvolvido por Fábio Arieira

**Fábio Arieira** - Desenvolvedor Full Stack

Este projeto foi completamente desenvolvido, arquitetado e implementado por **Fábio Arieira**, um desenvolvedor Full Stack especializado em aplicações web modernas e seguras.

- 🌐 **Website:** [fabioarieira.com](https://fabioarieira.com)
- 💻 **GitHub:** [@FabioArieiraBaia](https://github.com/FabioArieiraBaia)
- 📚 **Aplicação:** [iabooks.com.br](https://iabooks.com.br)

**Todos os direitos e créditos desta aplicação pertencem a Fábio Arieira.**

## 🙏 Agradecimentos

### Pollinations

Gostaríamos de expressar nossa profunda gratidão à **[Pollinations](https://pollinations.ai)** por disponibilizar gratuitamente sua API de geração de imagens. A generosidade da Pollinations em oferecer acesso gratuito à sua tecnologia de IA foi fundamental para tornar o projeto **IA-Books** possível.

A API da Pollinations permite que o IA-Books gere imagens de capa e ilustrações para os livros criados, enriquecendo significativamente a experiência dos usuários. Sem essa contribuição, muitas das funcionalidades visuais do projeto não seriam viáveis.

**Obrigado, Pollinations, por tornar a criação de conteúdo visual acessível a todos!** 🎨✨

## 🔗 Links Úteis

- [Google Gemini API](https://ai.google.dev/)
- [Pollinations AI](https://pollinations.ai) - API gratuita de geração de imagens
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

---

<div align="center">

**Desenvolvido com ❤️ por [Fábio Arieira](https://fabioarieira.com)**

**Acesse a aplicação:** [iabooks.com.br](https://iabooks.com.br)

**© 2025 Fábio Arieira - Todos os direitos reservados**

</div>
