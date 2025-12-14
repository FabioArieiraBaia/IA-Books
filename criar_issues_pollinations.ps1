# Script para criar issues no repositório da Pollinations
# Requer: GitHub CLI (gh) ou token de acesso pessoal do GitHub

$repo = "pollinations/pollinations"

# Função para criar issue via API do GitHub
function Create-GitHubIssue {
    param(
        [string]$Title,
        [string]$Body,
        [string]$Repository
    )
    
    # Tenta usar GitHub CLI primeiro
    $ghAvailable = Get-Command gh -ErrorAction SilentlyContinue
    if ($ghAvailable) {
        Write-Host "Usando GitHub CLI (gh)..." -ForegroundColor Green
        $bodyFile = [System.IO.Path]::GetTempFileName()
        $Body | Out-File -FilePath $bodyFile -Encoding UTF8
        gh issue create --repo $Repository --title "$Title" --body-file "$bodyFile"
        Remove-Item $bodyFile
        return $true
    }
    
    # Se não tiver gh CLI, tenta usar token do ambiente ou git config
    $token = $env:GITHUB_TOKEN
    if (-not $token) {
        Write-Host "GitHub CLI não encontrado e GITHUB_TOKEN não configurado." -ForegroundColor Yellow
        Write-Host "Por favor, configure uma das opções:" -ForegroundColor Yellow
        Write-Host "1. Instale GitHub CLI: winget install --id GitHub.cli" -ForegroundColor Cyan
        Write-Host "2. Configure GITHUB_TOKEN: `$env:GITHUB_TOKEN = 'seu_token'" -ForegroundColor Cyan
        Write-Host "3. Ou execute: gh auth login" -ForegroundColor Cyan
        return $false
    }
    
    # Usa API REST do GitHub
    $headers = @{
        "Authorization" = "token $token"
        "Accept" = "application/vnd.github.v3+json"
    }
    
    $bodyJson = @{
        title = $Title
        body = $Body
    } | ConvertTo-Json
    
    $uri = "https://api.github.com/repos/$Repository/issues"
    
    try {
        $response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $bodyJson -ContentType "application/json"
        Write-Host "Issue criada com sucesso!" -ForegroundColor Green
        Write-Host "URL: $($response.html_url)" -ForegroundColor Cyan
        return $true
    }
    catch {
        Write-Host "Erro ao criar issue: $_" -ForegroundColor Red
        return $false
    }
}

# Conteúdo da Issue - IA-Books
$issueIABooksTitle = "Project Submission: IA-Books - Gerador de Ebooks Profissionais"
$issueIABooksBody = @"
## Project Name
**IA-Books: Gerador de Ebooks Profissionais**

## Project Description

**IA-Books** é uma plataforma inovadora e completa que permite aos usuários criar, ler e compartilhar livros (apostilas, e-books e livros completos) gerados com Inteligência Artificial. 

### Características Principais:

✨ **Arquitetura Client-Side Secure** - Todos os dados permanecem no navegador do usuário, garantindo privacidade total
📚 **Geração Completa de Livros** - Planejamento automático de capítulos, escrita de conteúdo e geração de imagens
🎨 **Interface de Leitura Imersiva** - Experiência otimizada para diferentes dispositivos
💾 **PWA (Progressive Web App)** - Funciona offline, pode ser instalado como app nativo
🌐 **Internacionalização** - Suporte a múltiplos idiomas (Português, Inglês)
🔒 **Segurança Total** - Criptografia client-side e armazenamento local seguro

## Project URL
🌐 **Live Demo:** https://iabooks.com.br

## GitHub Repository
🔗 **Repositório:** https://github.com/FabioArieiraBaia/IA-Books

## Category
**Creative 🎨** (ou **Learn 📚** como alternativa)

## How does your project use Pollinations?

A API da Pollinations é **FUNDAMENTAL e INDISPENSÁVEL** para o IA-Books! Sem ela, o projeto não seria viável. Utilizamos a API gratuita da Pollinations de forma extensiva:

### 1. **Geração de Imagens de Capa** 🎨
Cada livro criado recebe uma capa única e profissional gerada via Pollinations usando o modelo **Flux**. As capas são geradas automaticamente com base no tema e título do livro.

### 2. **Ilustrações de Capítulos** 📖
Capítulos de ebooks e livros completos recebem ilustrações personalizadas e contextuais, geradas pela Pollinations com base no conteúdo de cada capítulo. Isso enriquece significativamente a experiência de leitura.

### 3. **Sistema de Fallback Inteligente** 🔄
Implementamos um sistema híbrido onde:
- Tentamos primeiro gerar imagens via Google Gemini Image API
- Se falhar ou não estiver disponível, fazemos **fallback automático para Pollinations Flux**
- Isso garante que os usuários sempre recebam imagens de alta qualidade

### 4. **Modelos Utilizados** 🚀
- **Flux** (padrão para capas e ilustrações principais)
- **Turbo** (alternativa para geração mais rápida quando necessário)

### 5. **Integração Técnica** 💻

**Código de integração principal:**
````typescript
// services/geminiService.ts
export const getPollinationsUrl = (prompt: string, width = 800, height = 1200, model: string = 'flux'): string => {
  const encodedPrompt = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${model}&nologo=true&seed=${Math.floor(Math.random() * 10000)}`;
};
````

**Uso no fluxo de criação:**
- Geração automática de prompts otimizados para cada capítulo
- Integração seamless no processo de criação de livros
- Cache inteligente para melhor performance

### 6. **Impacto Real** 📊

**Estatísticas de uso:**
- ✅ Projeto em **produção ativa** desde 2025
- ✅ URL pública funcionando: https://iabooks.com.br
- ✅ Centenas de livros já criados usando Pollinations
- ✅ Milhares de imagens geradas via API Pollinations

**Impacto econômico:**
Sem a API gratuita da Pollinations, o IA-Books não seria viável economicamente. A generosidade da Pollinations em oferecer acesso gratuito à tecnologia de IA de alta qualidade tornou possível criar uma plataforma completa e profissional de geração de livros.

## Additional Information

### Tecnologias Utilizadas:
- **Frontend:** React 19, TypeScript, Vite
- **IA:** Google Gemini API (texto) + **Pollinations API (imagens)** ⭐
- **Armazenamento:** IndexedDB (client-side)
- **Estilização:** Tailwind CSS
- **PWA:** Service Worker, Manifest

### Desenvolvedor:
- **Nome:** Fábio Arieira
- **Título:** Full Stack Developer
- **Website:** https://fabioarieira.com
- **GitHub:** https://github.com/FabioArieiraBaia

### Status do Projeto:
- ✅ **Em produção e ativo**
- ✅ **URL pública funcionando**
- ✅ **Código open-source no GitHub**
- ✅ **Bem documentado**

### Agradecimento Especial:
O README do projeto inclui uma **seção dedicada de agradecimento à Pollinations**, reconhecendo publicamente a importância da API gratuita para o sucesso do projeto.

## Screenshots/Demo

### Exemplo de Uso:
1. Usuário cria um novo livro sobre "Inteligência Artificial"
2. Sistema gera automaticamente capa via Pollinations Flux
3. Para cada capítulo, gera ilustração contextual via Pollinations
4. Resultado: Livro completo com imagens profissionais

### Links para Verificação:
- **Live Demo:** https://iabooks.com.br
- **Código de Integração:** https://github.com/FabioArieiraBaia/IA-Books/blob/main/services/geminiService.ts
- **Agradecimento no README:** https://github.com/FabioArieiraBaia/IA-Books#-agradecimentos

---

## Personal Note

Gostaria de expressar minha **profunda gratidão** à equipe da Pollinations por disponibilizar uma API gratuita de alta qualidade. Isso tornou possível criar o IA-Books, uma plataforma profissional de geração de livros com IA.

A generosidade da Pollinations em oferecer acesso gratuito à tecnologia de IA está **democratizando a criação de conteúdo** e permitindo que desenvolvedores independentes como eu criem ferramentas inovadoras que de outra forma não seriam viáveis.

**Obrigado por tornar isso possível!** 🙏✨

O IA-Books é um exemplo real de como a API gratuita da Pollinations está sendo usada para criar valor e impacto positivo. Espero que este projeto possa inspirar outros desenvolvedores e demonstrar o potencial da tecnologia da Pollinations.

---

**Desenvolvido com ❤️ por Fábio Arieira**  
https://fabioarieira.com
"@

# Conteúdo da Issue - ViralFlow
$issueViralFlowTitle = "Project Submission: ViralFlow AI - Automatic Video Editor For YouTube"
$issueViralFlowBody = @"
## Project Name
**ViralFlow AI: Automatic Video Editor For YouTube**

## Project Description

**ViralFlow AI** é um gerador automático de vídeos virais alimentado pelos modelos **Gemini 2.5** da Google. Orquestra Geração de Scripts, Text-to-Speech (TTS), Geração de Imagens e Renderização de Vídeo em um fluxo de trabalho perfeito, rodando localmente no navegador ou via Electron.

### Características Principais:

🤖 **Geração de Scripts com IA** - Scripts envolventes baseados em tópicos, estilos e ritmo usando Gemini 2.5 Flash
🎙️ **TTS Cinematográfico** - Usa Gemini 2.5 Flash Native Audio para narrações realistas com múltiplos falantes
🎨 **Geração Visual Avançada** - Múltiplas fontes de imagens (Gemini, Pollinations, Pexels)
🎬 **Renderização de Vídeo** - Renderização em tempo real com canvas, efeitos de partículas, overlays, transições e legendas
🔒 **Local e Seguro** - Todas as chaves de API são armazenadas localmente
💻 **Multiplataforma** - Funciona no navegador e como app desktop via Electron

## Project URL
🌐 **Live Demo:** https://fabioarieira.com/viralflow

## GitHub Repository
🔗 **Repositório:** https://github.com/FabioArieiraBaia/ViralFlow

## Category
**Creative 🎨**

## How does your project use Pollinations?

A Pollinations é uma das **PRINCIPAIS FONTES DE GERAÇÃO VISUAL** do ViralFlow e é essencial para o funcionamento da plataforma:

### 1. **Geração de Imagens para Vídeos** 🎨
Utilizamos **Pollinations.ai (Flux/SD)** para criar imagens de alta qualidade que são integradas nos vídeos gerados. Essas imagens são fundamentais para criar conteúdo visual atraente e profissional.

### 2. **Integração com Múltiplas Fontes** 🔄
O ViralFlow utiliza um sistema híbrido de geração visual:
- **Gemini 2.5 Flash Image** (primeira opção)
- **Pollinations.ai (Flux/SD)** ⭐ (fonte principal alternativa)
- **Pexels Stock Video** (vídeos de apoio)

### 3. **Workflow Completo** 🚀
1. **Script Generation** → Gera roteiro com IA
2. **Text-to-Speech** → Cria narração profissional
3. **Image Generation** → **Pollinations gera imagens contextuais** ⭐
4. **Video Rendering** → Combina tudo em vídeo final

### 4. **Qualidade Profissional** ✨
A API da Pollinations permite que o ViralFlow gere vídeos com qualidade profissional sem custos adicionais de geração de imagens. Isso torna a ferramenta acessível para criadores de conteúdo independentes.

### 5. **Impacto no Produto Final** 📊
- Imagens geradas pela Pollinations são integradas diretamente nos vídeos
- Suporte a diferentes estilos e modelos (Flux, SD)
- Geração rápida e confiável
- Qualidade consistente para produção em escala

### 6. **Integração Técnica** 💻

O ViralFlow integra a Pollinations de forma seamless no pipeline de geração de vídeos, garantindo que cada vídeo tenha imagens visuais atraentes e contextuais.

**Impacto:**
A API gratuita da Pollinations permite que o ViralFlow gere vídeos profissionais sem custos adicionais de geração de imagens, tornando a ferramenta acessível para criadores de conteúdo e YouTubers.

## Additional Information

### Tecnologias Utilizadas:
- **Frontend:** React 19, TypeScript, Vite
- **Desktop:** Electron
- **IA:** Google Gemini 2.5 (texto, TTS) + **Pollinations API (imagens)** ⭐
- **Estilização:** Tailwind CSS
- **Video:** Canvas API, Web APIs

### Desenvolvedor:
- **Nome:** Fábio Arieira
- **Título:** Full Stack Developer
- **Website:** https://fabioarieira.com
- **GitHub:** https://github.com/FabioArieiraBaia

### Status do Projeto:
- ✅ **Em produção e ativo**
- ✅ **URL pública funcionando**
- ✅ **Código open-source no GitHub**
- ✅ **Bem documentado**

### Casos de Uso:
- Criação automática de vídeos para YouTube
- Geração de conteúdo viral
- Produção de vídeos educacionais
- Criação de vídeos promocionais

## Screenshots/Demo

### Exemplo de Uso:
1. Usuário insere tópico: "10 Dicas de Programação"
2. Sistema gera script com IA
3. Cria narração com TTS
4. **Pollinations gera imagens contextuais** para cada seção
5. Sistema renderiza vídeo final com todas as imagens integradas

### Links para Verificação:
- **Live Demo:** https://fabioarieira.com/viralflow
- **Repositório:** https://github.com/FabioArieiraBaia/ViralFlow
- **Documentação:** Disponível no README do repositório

---

## Personal Note

Gostaria de expressar minha **profunda gratidão** à equipe da Pollinations por disponibilizar uma API gratuita de alta qualidade. A Pollinations é uma peça fundamental do ViralFlow, permitindo que a plataforma gere vídeos profissionais com imagens de alta qualidade.

A generosidade da Pollinations em oferecer acesso gratuito à tecnologia de IA está **democratizando a criação de conteúdo visual** e permitindo que desenvolvedores independentes como eu criem ferramentas inovadoras que de outra forma não seriam viáveis.

**Obrigado por tornar isso possível!** 🙏✨

O ViralFlow é um exemplo real de como a API gratuita da Pollinations está sendo usada para criar valor e impacto positivo na comunidade de criadores de conteúdo.

---

**Desenvolvido com ❤️ por Fábio Arieira**  
https://fabioarieira.com
"@

# Execução
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Submissão de Projetos para Pollinations" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verifica se gh CLI está disponível ou se precisa de token
$ghAvailable = Get-Command gh -ErrorAction SilentlyContinue

if (-not $ghAvailable -and -not $env:GITHUB_TOKEN) {
    Write-Host "GitHub CLI não encontrado. Tentando instalar ou configurar..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Opções:" -ForegroundColor Yellow
    Write-Host "1. Instalar GitHub CLI: winget install --id GitHub.cli" -ForegroundColor Cyan
    Write-Host "2. Ou configurar token: `$env:GITHUB_TOKEN = 'seu_token'" -ForegroundColor Cyan
    Write-Host ""
    
    $install = Read-Host "Deseja tentar instalar GitHub CLI agora? (S/N)"
    if ($install -eq "S" -or $install -eq "s") {
        winget install --id GitHub.cli
        Write-Host "Após instalar, execute: gh auth login" -ForegroundColor Yellow
        Write-Host "Depois execute este script novamente." -ForegroundColor Yellow
        exit
    }
}

Write-Host "Criando issue para IA-Books..." -ForegroundColor Green
$success1 = Create-GitHubIssue -Title $issueIABooksTitle -Body $issueIABooksBody -Repository $repo

if ($success1) {
    Write-Host ""
    Write-Host "✅ Issue do IA-Books criada com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Aguardando 2 segundos antes de criar a próxima issue..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
    
    Write-Host "Criando issue para ViralFlow..." -ForegroundColor Green
    $success2 = Create-GitHubIssue -Title $issueViralFlowTitle -Body $issueViralFlowBody -Repository $repo
    
    if ($success2) {
        Write-Host ""
        Write-Host "✅ Issue do ViralFlow criada com sucesso!" -ForegroundColor Green
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  ✅ Ambas as issues foram criadas!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Acesse: https://github.com/pollinations/pollinations/issues" -ForegroundColor Cyan
        Write-Host "para ver suas submissões." -ForegroundColor Cyan
    }
} else {
    Write-Host ""
    Write-Host "❌ Erro ao criar as issues." -ForegroundColor Red
    Write-Host "Verifique sua autenticação no GitHub." -ForegroundColor Yellow
}
