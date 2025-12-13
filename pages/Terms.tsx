
import React from 'react';
import { Scale, FileText, AlertTriangle, Copyright, Server, Key } from 'lucide-react';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-skin-base pt-28 pb-12 px-4 transition-colors duration-500 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-block p-3 rounded-full bg-brand-500/10 text-brand-500 mb-4 border border-brand-500/20">
             <Scale size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-skin-text mb-4">Termos de Uso</h1>
          <p className="text-skin-muted text-lg">Última atualização: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-8 animate-slide-up bg-skin-secondary p-8 md:p-12 rounded-2xl border border-skin-border shadow-2xl">
          
          <section>
            <h2 className="text-2xl font-bold text-brand-500 mb-4 flex items-center gap-2">
              <Copyright size={24} /> 1. Propriedade e Armazenamento
            </h2>
            <div className="bg-skin-tertiary p-6 rounded-xl border border-skin-border">
              <p className="text-skin-text leading-relaxed mb-4">
                <strong>Importante:</strong> Ao utilizar o iabooks, você concorda que:
              </p>
              <ul className="list-disc pl-5 mt-4 space-y-2 text-skin-muted text-sm">
                <li><strong>Propriedade dos Ebooks:</strong> Todos os ebooks, apostilas e livros gerados nesta plataforma são de propriedade exclusiva da <strong>iabooks</strong>.</li>
                <li><strong>Armazenamento Público:</strong> Os arquivos dos livros gerados (formato JSON) ficam salvos e disponíveis publicamente em nossos servidores, acessíveis através de <code>https://iabooks.com.br/ebooks</code> ou pela interface da Biblioteca Global.</li>
                <li><strong>Conteúdo da Comunidade:</strong> Todo o conteúdo pertence à comunidade global. Nenhuma obra gerada aqui é privada ou exclusiva do usuário que solicitou a geração.</li>
                <li><strong>Direitos de Modificação:</strong> Somente a iabooks detém os direitos de modificar estas regras, remover conteúdos ou alterar a estrutura da biblioteca.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-500 mb-4 flex items-center gap-2">
              <Server size={24} /> 2. Dados do Usuário vs. Dados Públicos
            </h2>
            <p className="text-skin-muted leading-relaxed mb-4">
              Nossa arquitetura diferencia o que é seu (local) do que é da plataforma (público):
            </p>
            <ul className="space-y-3 text-skin-muted">
               <li className="flex gap-3">
                 <span className="text-brand-500 font-bold">•</span>
                 <span><strong>Dados Locais (Seu Navegador):</strong> Seu nome de usuário, sua Chave API (Google Gemini), seu histórico de leitura e preferências ficam salvos <strong>apenas no cache do seu navegador</strong>. Nada disso é enviado para nossos servidores.</span>
              </li>
              <li className="flex gap-3">
                 <span className="text-brand-500 font-bold">•</span>
                 <span><strong>Dados Públicos (Servidor):</strong> Apenas o resultado final da geração (O Livro) é enviado e persistido em nossos servidores para compor a Biblioteca Global.</span>
              </li>
            </ul>
          </section>

          <section>
             <h2 className="text-2xl font-bold text-brand-500 mb-4 flex items-center gap-2">
               <Key size={24} /> 3. Responsabilidade pelo Arquivo de Identidade
             </h2>
             <div className="bg-red-500/5 p-6 rounded-xl border border-red-500/20">
                 <p className="text-skin-muted leading-relaxed mb-4">
                   O recurso de "Identidade Segura" (arquivo <code>.iabooks</code>) é de responsabilidade exclusiva do usuário.
                 </p>
                 <ul className="space-y-2 text-skin-muted text-sm">
                    <li>• A iabooks <strong>não armazena senhas</strong> ou chaves de descriptografia.</li>
                    <li>• Se você perder seu arquivo ou esquecer sua senha, seus dados pessoais serão irrecuperáveis.</li>
                    <li>• Não nos responsabilizamos por perdas de dados causadas por limpeza de cache, formatação de dispositivos ou perda de arquivos de backup.</li>
                 </ul>
             </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-500 mb-4 flex items-center gap-2">
              <AlertTriangle size={24} /> 4. Uso da Inteligência Artificial
            </h2>
            <p className="text-skin-muted leading-relaxed mb-4">
              Esta plataforma utiliza a API Google Gemini. Ao usar o serviço, você reconhece que:
            </p>
            <ul className="space-y-3 text-skin-muted">
              <li className="flex gap-3">
                 <span className="text-brand-500 font-bold">•</span>
                 <span><strong>Alucinações:</strong> A IA pode gerar informações imprecisas. Recomendamos revisão.</span>
              </li>
              <li className="flex gap-3">
                 <span className="text-brand-500 font-bold">•</span>
                 <span><strong>Responsabilidade:</strong> Você é responsável pelos "prompts" enviados. É proibido gerar conteúdo ilegal ou violento.</span>
              </li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Terms;
