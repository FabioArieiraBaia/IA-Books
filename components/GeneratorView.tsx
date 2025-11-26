import React, { useEffect, useRef } from 'react';
import { Book, GenerationStatus, Language } from '../types';
import { Activity, Cpu, Image as ImageIcon, CheckCircle, Terminal } from 'lucide-react';

interface GeneratorViewProps {
  book: Book;
  status: GenerationStatus;
  language: Language;
}

export const GeneratorView: React.FC<GeneratorViewProps> = ({ book, status, language }) => {
  const logsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [status.logs]);

  const t = {
    'pt-BR': {
        title: "NÚCLEO IA BOOKS",
        chapter: "Capítulo",
        section: "Seção",
        currentOp: "Operação Atual",
        writing: "ESCREVENDO_TEXTO",
        rendering: "RENDERIZANDO_ARTE",
        thinking: "RACIOCINANDO",
        completion: "CONCLUSÃO TOTAL"
    },
    'en-US': {
        title: "IA BOOKS CORE",
        chapter: "Chapter",
        section: "Section",
        currentOp: "Current Operation",
        writing: "WRITING_TEXT",
        rendering: "RENDERING_ART",
        thinking: "REASONING",
        completion: "TOTAL COMPLETION"
    }
  }[language];

  return (
    <div className="w-full h-full bg-[#0a0a0f] text-cyan-500 font-mono p-8 flex flex-col relative overflow-hidden">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,24,0)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,24,0)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-cyan-900/50 pb-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_#06b6d4]"></div>
          <h2 className="text-xl font-bold tracking-widest text-white">{t.title} <span className="text-xs text-cyan-700 ml-2">v3.0.PRO</span></h2>
        </div>
        <div className="flex gap-6 text-xs text-cyan-700">
           <span>CPU: <span className="text-cyan-400">98%</span></span>
           <span>MEM: <span className="text-cyan-400">64TB</span></span>
           <span>NET: <span className="text-cyan-400">SECURE</span></span>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden z-10">
        
        {/* Left Panel: Status & Activity */}
        <div className="w-1/3 flex flex-col gap-6">
           {/* Current Task Card */}
           <div className="bg-[#11111a] border border-cyan-900/50 p-6 rounded-lg shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                <Cpu size={100} />
              </div>
              <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">{t.currentOp}</h3>
              
              <div className="space-y-4">
                <div>
                    <label className="text-[10px] text-cyan-700 uppercase">{t.chapter}</label>
                    <div className="text-white font-bold text-lg truncate">{status.currentChapterTitle || "Initializing..."}</div>
                </div>
                <div>
                    <label className="text-[10px] text-cyan-700 uppercase">{t.section}</label>
                    <div className="text-cyan-300 text-md truncate">{status.currentSectionTitle || "Loading..."}</div>
                </div>
                
                <div className="flex items-center gap-3 mt-4">
                    {status.activity === 'drafting' && <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded border border-blue-800 animate-pulse">{t.writing}</span>}
                    {status.activity === 'painting' && <span className="px-2 py-1 bg-purple-900/30 text-purple-400 text-xs rounded border border-purple-800 animate-pulse">{t.rendering}</span>}
                    {status.activity === 'thinking' && <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 text-xs rounded border border-yellow-800 animate-pulse">{t.thinking}</span>}
                </div>
              </div>
           </div>

           {/* Progress */}
           <div className="bg-[#11111a] border border-cyan-900/50 p-6 rounded-lg">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-400">{t.completion}</span>
                <span className="text-white">{Math.round(status.progress)}%</span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div 
                    className="bg-cyan-500 h-full shadow-[0_0_10px_#06b6d4] transition-all duration-300" 
                    style={{ width: `${status.progress}%` }}
                />
              </div>
           </div>
        </div>

        {/* Right Panel: Terminal Logs */}
        <div className="flex-1 bg-black border border-gray-800 rounded-lg p-4 font-mono text-sm relative flex flex-col shadow-inner">
            <div className="absolute top-2 right-4 text-[10px] text-gray-600 flex items-center gap-1">
                <Terminal size={10} /> TERMINAL_OUTPUT
            </div>
            <div className="flex-1 overflow-y-auto space-y-1.5 scroll-smooth" ref={logsRef}>
                {status.logs.map((log, idx) => {
                    const isSystem = log.startsWith('>');
                    const isError = log.includes('Error');
                    const isSuccess = log.includes('Completed') || log.includes('Saved') || log.includes('rendered');
                    
                    return (
                        <div key={idx} className={`
                            ${isSystem ? 'text-gray-500' : 'text-cyan-400'}
                            ${isSuccess ? 'text-green-400' : ''}
                            ${isError ? 'text-red-500' : ''}
                            border-l-2 border-transparent pl-2 hover:border-gray-700
                        `}>
                            <span className="opacity-50 mr-2 text-[10px]">{new Date().toLocaleTimeString()}</span>
                            {log}
                        </div>
                    );
                })}
                <div className="animate-pulse text-cyan-500">_</div>
            </div>
        </div>
      </div>
    </div>
  );
};