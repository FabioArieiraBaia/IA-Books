import React, { useState } from 'react';
import { Book, Chapter, Language } from '../types';
import { Trash2, CheckCircle, Layers, ChevronDown, ChevronRight } from 'lucide-react';

interface OutlineEditorProps {
  initialBook: Book;
  onConfirm: (chapters: Chapter[]) => void;
  onCancel: () => void;
  language: Language;
}

export const OutlineEditor: React.FC<OutlineEditorProps> = ({ initialBook, onConfirm, onCancel, language }) => {
  const [chapters, setChapters] = useState<Chapter[]>(initialBook.chapters);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set(initialBook.chapters.map(c => c.id)));

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedChapters);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedChapters(newSet);
  };

  const removeChapter = (id: string) => {
    setChapters(chapters.filter(c => c.id !== id));
  };

  const t = {
    'pt-BR': {
        planning: "Planejamento Editorial",
        back: "Voltar",
        approve: "Aprovar Produção",
        infoTitle: "Arquitetura do Livro:",
        infoDesc: "A IA estruturou seu livro em Capítulos e Seções. Cada seção será escrita e ilustrada individualmente para máxima profundidade.",
        chapter: "Capítulo",
        sections: "Seções"
    },
    'en-US': {
        planning: "Editorial Planning",
        back: "Back",
        approve: "Approve Production",
        infoTitle: "Book Architecture:",
        infoDesc: "AI has structured your book into Chapters and Sections. Each section will be written and illustrated individually for maximum depth.",
        chapter: "Chapter",
        sections: "Sections"
    }
  }[language];

  return (
    <div className="max-w-5xl mx-auto w-full p-8 h-full flex flex-col bg-gray-50">
      <div className="mb-8 flex justify-between items-end border-b pb-6 border-gray-200">
        <div>
          <span className="text-indigo-600 font-bold tracking-widest text-xs uppercase mb-2 block">{t.planning}</span>
          <h2 className="text-4xl font-serif font-bold text-ink mb-1">{initialBook.title}</h2>
          <p className="text-xl text-gray-500 font-light">{initialBook.subtitle}</p>
        </div>
        <div className="flex gap-3">
             <button onClick={onCancel} className="px-5 py-3 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors">
                {t.back}
            </button>
            <button 
            onClick={() => onConfirm(chapters)}
            className="px-8 py-3 bg-indigo-900 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-800 flex items-center gap-2 transform hover:-translate-y-0.5 transition-all"
            >
            <CheckCircle size={20} /> {t.approve}
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 pb-20 no-scrollbar space-y-6">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
          <p className="text-blue-800 text-sm">
            <strong>{t.infoTitle}</strong> {t.infoDesc}
          </p>
        </div>

        {chapters.map((chapter, idx) => (
          <div key={chapter.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
            {/* Chapter Header */}
            <div 
              className="p-5 flex items-center justify-between cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={() => toggleExpand(chapter.id)}
            >
              <div className="flex items-center gap-4">
                <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                  {expandedChapters.has(chapter.id) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.chapter} {idx + 1}</span>
                  <h3 className="text-lg font-serif font-bold text-gray-800">{chapter.title}</h3>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                    {chapter.sections.length} {t.sections}
                 </span>
                 <button 
                    onClick={(e) => { e.stopPropagation(); removeChapter(chapter.id); }}
                    className="text-gray-300 hover:text-red-500 p-2"
                 >
                    <Trash2 size={18} />
                 </button>
              </div>
            </div>

            {/* Sections List */}
            {expandedChapters.has(chapter.id) && (
              <div className="border-t border-gray-100 divide-y divide-gray-50">
                <div className="p-4 bg-white text-sm text-gray-500 italic border-b border-gray-50">
                   {chapter.description}
                </div>
                {chapter.sections.map((section, sIdx) => (
                  <div key={sIdx} className="p-4 pl-14 flex items-start gap-3 hover:bg-gray-50 transition-colors group">
                    <Layers size={16} className="mt-1 text-gray-300 group-hover:text-indigo-400" />
                    <div>
                      <h4 className="font-medium text-gray-800">{section.title}</h4>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <span className="uppercase font-bold text-[10px] text-gray-300 border border-gray-200 px-1 rounded">Visual</span> 
                        {section.visualConcept}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};