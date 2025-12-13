
import React from 'react';
import { Shield, Lock, Database, Server, Cpu, Globe, AlertTriangle } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-skin-base pt-28 pb-12 px-4 transition-colors duration-500 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-block p-3 rounded-full bg-green-500/10 text-green-500 mb-4 border border-green-500/20">
             <Shield size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-skin-text mb-4">Política de Privacidade</h1>
          <p className="text-skin-muted text-lg">Arquitetura Híbrida: Segurança Local e Biblioteca Pública</p>
        </div>

        <div className="space-y-6 animate-slide-up">
          
          <div className="bg-skin-secondary p-8 rounded-2xl border border-skin-border shadow-xl">
             <h2 className="text-xl font-bold text-skin-text mb-4 flex items-center gap-2">
                <Server className="text-brand-500" /> Onde ficam os dados?
             </h2>
             <p className="text-skin-muted leading-relaxed">
               O iabooks opera com uma separação estrita de dados para garantir privacidade e colaboração simultaneamente:
             </p>
             <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-skin-tertiary p-4 rounded-lg border border-skin-border">
                     <h3 className="font-bold text-green-500 mb-2">No seu Navegador (Privado)</h3>
                     <ul className="text-xs text-skin-muted list-disc pl-4 space-y-1">
                         <li>Seu Nome e Email</li>
                         <li>Sua Chave API (Google Gemini)</li>
                         <li>Seu progresso de leitura</li>
                         <li>Favoritos</li>
                     </ul>
                 </div>
                 <div className="bg-skin-tertiary p-4 rounded-lg border border-skin-border">
                     <h3 className="font-bold text-brand-500 mb-2">No Servidor (Público)</h3>
                     <ul className="text-xs text-skin-muted list-disc pl-4 space-y-1">
                         <li>O conteúdo do Livro Gerado</li>
                         <li>Capa e Metadados do Livro</li>
                         <li><strong>Local:</strong> <code>iabooks.com.br/ebooks</code></li>
                     </ul>
                 </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-skin-tertiary p-6 rounded-xl border border-skin-border flex flex-col h-full">
                <div className="flex items-center gap-3 mb-3 text-brand-500">
                   <Database size={24} />
                   <h3 className="font-bold">Backup da Biblioteca</h3>
                </div>
                <p className="text-sm text-skin-muted flex-grow">
                   Não há necessidade de você fazer backup da Biblioteca Global. Como os livros são salvos em nossos servidores em formato JSON, a persistência é garantida pela iabooks. Você só precisa se preocupar com seus dados de acesso locais.
                </p>
             </div>

             <div className="bg-skin-tertiary p-6 rounded-xl border border-skin-border flex flex-col h-full">
                <div className="flex items-center gap-3 mb-3 text-brand-500">
                   <Lock size={24} />
                   <h3 className="font-bold">E minha Chave API?</h3>
                </div>
                <p className="text-sm text-skin-muted flex-grow">
                   Sua Google API Key é criptografada e salva apenas no <strong>LocalStorage</strong> do seu dispositivo. 
                   Ela nunca é enviada para os servidores da iabooks. A comunicação para gerar texto ocorre diretamente entre: 
                   <br/><br/>
                   <code className="bg-black/20 px-1 py-0.5 rounded text-xs">Seu Navegador</code> ↔ <code className="bg-black/20 px-1 py-0.5 rounded text-xs">Google AI</code>
                </p>
             </div>
          </div>

          <div className="bg-red-500/10 p-8 rounded-2xl border border-red-500/20 shadow-xl mt-8">
             <h2 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2">
                <AlertTriangle /> Isenção de Custódia (Non-Custodial)
             </h2>
             <p className="text-skin-text text-sm leading-relaxed">
               Nós não temos acesso, não armazenamos e <strong>não podemos recuperar</strong> suas senhas, chaves de criptografia ou arquivos de identidade (<code>.iabooks</code>). 
             </p>
             <p className="text-skin-muted text-sm mt-2 leading-relaxed">
               Você é o único guardião dos seus dados pessoais. Se você perder seu arquivo de backup ou esquecer sua senha, seus dados pessoais (como histórico de leitura e favoritos) serão perdidos permanentemente. A iabooks se isenta de qualquer responsabilidade por perda de dados decorrente da má gestão das chaves pelo usuário.
             </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Privacy;
