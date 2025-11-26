import React, { useState } from 'react';
import { BookConfig, Language } from '../types';
import { BookOpen, User, Feather, PenTool } from 'lucide-react';

interface StepWizardProps {
  onComplete: (config: BookConfig) => void;
  isLoading: boolean;
  language: Language;
}

export const StepWizard: React.FC<StepWizardProps> = ({ onComplete, isLoading, language }) => {
  const [config, setConfig] = useState<BookConfig>({
    topic: '',
    audience: '',
    tone: language === 'pt-BR' ? 'Profissional e Inspirador' : 'Professional and Inspiring',
    authorName: '',
    language: language
  });

  // Update config language if prop changes
  React.useEffect(() => {
    setConfig(c => ({...c, language}));
  }, [language]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(config);
  };

  const labels = {
    'pt-BR': {
        title: "O que vamos escrever hoje?",
        subtitle: "Defina a base do seu próximo Bestseller.",
        topic: "Tema Principal",
        topicPlace: "Ex: Inteligência Artificial para Pequenos Negócios",
        audience: "Público Alvo",
        audiencePlace: "Ex: Empreendedores iniciantes",
        author: "Nome do Autor",
        authorPlace: "Seu nome ou pseudônimo",
        tone: "Tom de Voz",
        submit: "Gerar Estrutura do Livro",
        loading: "Criando Estrutura...",
        tones: ['Profissional e Inspirador', 'Técnico e Educativo', 'Amigável e Descontraído', 'Persuasivo e Vendas', 'Narrativo e Emocional']
    },
    'en-US': {
        title: "What shall we write today?",
        subtitle: "Define the foundation of your next Bestseller.",
        topic: "Main Topic",
        topicPlace: "Ex: Artificial Intelligence for Small Business",
        audience: "Target Audience",
        audiencePlace: "Ex: Beginner entrepreneurs",
        author: "Author Name",
        authorPlace: "Your name or pseudonym",
        tone: "Tone of Voice",
        submit: "Generate Book Structure",
        loading: "Creating Structure...",
        tones: ['Professional and Inspiring', 'Technical and Educational', 'Friendly and Casual', 'Persuasive and Sales-oriented', 'Narrative and Emotional']
    }
  };

  const t = labels[language];

  return (
    <div className="max-w-2xl mx-auto w-full p-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-serif font-bold text-ink mb-4">{t.title}</h1>
        <p className="text-gray-500 text-lg">{t.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        
        {/* Topic */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <BookOpen size={16} /> {t.topic}
          </label>
          <input
            type="text"
            required
            className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 transition-all outline-none text-lg"
            placeholder={t.topicPlace}
            value={config.topic}
            onChange={(e) => setConfig({ ...config, topic: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Audience */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <User size={16} /> {t.audience}
            </label>
            <input
              type="text"
              required
              className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none"
              placeholder={t.audiencePlace}
              value={config.audience}
              onChange={(e) => setConfig({ ...config, audience: e.target.value })}
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <PenTool size={16} /> {t.author}
            </label>
            <input
              type="text"
              required
              className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none"
              placeholder={t.authorPlace}
              value={config.authorName}
              onChange={(e) => setConfig({ ...config, authorName: e.target.value })}
            />
          </div>
        </div>

        {/* Tone */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Feather size={16} /> {t.tone}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {t.tones.map((toneText) => (
              <button
                key={toneText}
                type="button"
                onClick={() => setConfig({ ...config, tone: toneText })}
                className={`p-3 rounded-lg text-sm font-medium border-2 transition-all text-left ${
                  config.tone === toneText 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                    : 'border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {toneText}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-lg transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              {t.loading}
            </>
          ) : (
            t.submit
          )}
        </button>
      </form>
    </div>
  );
};