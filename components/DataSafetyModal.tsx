
import React, { useState, useEffect } from 'react';
import { Globe, Download, ShieldCheck, CheckSquare, Square } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const DataSafetyModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const hasSeenWarning = localStorage.getItem('iabooks_safety_warning');
    if (!hasSeenWarning) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    if (!accepted) return;
    localStorage.setItem('iabooks_safety_warning', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#1a1a1a] w-full max-w-lg rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.2)] border border-[#f59e0b]/30 overflow-hidden animate-slide-up relative">
        
        {/* Header Glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent opacity-70"></div>

        <div className="p-8 text-center">
          <div className="inline-flex p-4 bg-[#f59e0b]/10 rounded-full text-[#f59e0b] mb-4 border border-[#f59e0b]/20 shadow-lg shadow-[#f59e0b]/10">
             <ShieldCheck size={40} />
          </div>
          
          <h2 className="text-2xl font-serif font-bold text-white mb-1">{t('modal.privacy_title')}</h2>
          <p className="text-[#f59e0b] font-bold text-lg mb-6 uppercase tracking-wider text-xs">{t('modal.privacy_subtitle')}</p>
          
          <div className="text-left bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
             <div className="flex gap-3 mb-4">
                <Globe className="text-[#f59e0b] shrink-0" size={20} />
                <p className="text-gray-300 text-sm leading-relaxed">
                   {t('modal.intro')}
                </p>
             </div>
             
             <div className="flex gap-3">
                <Download className="text-[#f59e0b] shrink-0" size={20} />
                <div>
                    <h4 className="text-white text-xs font-bold mb-1">{t('modal.data_safety_title')}</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">
                        {t('modal.data_safety_desc')}
                    </p>
                </div>
             </div>
          </div>

          <div className="text-left mb-6">
              <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">{t('modal.terms_label')}</label>
              <div className="h-24 overflow-y-auto bg-black/30 rounded-lg p-3 border border-white/10 text-xs text-gray-400 font-mono leading-relaxed whitespace-pre-line">
                  {t('modal.terms_content')}
              </div>
          </div>

          <div 
            onClick={() => setAccepted(!accepted)}
            className="flex items-center gap-3 cursor-pointer group mb-6 select-none justify-center"
          >
              {accepted ? (
                  <CheckSquare className="text-[#f59e0b] shrink-0" size={24} />
              ) : (
                  <Square className="text-gray-500 group-hover:text-gray-300 shrink-0" size={24} />
              )}
              <span className={`text-sm ${accepted ? 'text-white font-medium' : 'text-gray-500 group-hover:text-gray-300'}`}>
                  {t('modal.accept_terms')}
              </span>
          </div>

          <button 
            onClick={handleClose}
            disabled={!accepted}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform ${
                accepted 
                ? 'bg-[#f59e0b] text-black hover:bg-[#d97706] hover:scale-[1.02] shadow-xl shadow-[#f59e0b]/20 cursor-pointer' 
                : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
            }`}
          >
            {t('modal.btn_accept')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataSafetyModal;
