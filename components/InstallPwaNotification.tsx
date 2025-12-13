
import React, { useState, useEffect } from 'react';
import { Download, X, WifiOff, Share } from 'lucide-react';

const InstallPwaNotification: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check online status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Capture install prompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if not already installed (check simple heuristic)
      if (!window.matchMedia('(display-mode: standalone)').matches) {
          setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS Check: If not standalone and is iOS, show hint
    if (isIosDevice && !window.matchMedia('(display-mode: standalone)').matches) {
        // Delay slightly to not annoy user immediately
        setTimeout(() => setIsVisible(true), 3000);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  if (!isVisible && !isOffline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] animate-slide-up flex flex-col gap-2">
      
      {/* Offline Warning */}
      {isOffline && (
         <div className="bg-red-500/90 backdrop-blur text-white p-4 rounded-xl shadow-2xl flex items-center justify-between border border-red-400/50">
            <div className="flex items-center gap-3">
                <WifiOff />
                <div>
                    <h4 className="font-bold text-sm">Você está offline</h4>
                    <p className="text-xs opacity-90">Acesse seus livros salvos na biblioteca.</p>
                </div>
            </div>
         </div>
      )}

      {/* Install Prompt */}
      {isVisible && (
        <div className="bg-skin-secondary/95 backdrop-blur text-skin-text p-4 rounded-xl shadow-2xl border border-brand-500/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {isIOS ? (
                /* iOS Instructions */
                 <div className="flex items-start gap-4 w-full">
                    <div className="bg-brand-500 p-3 rounded-lg text-white shadow-lg shadow-brand-500/30 shrink-0">
                        <Download size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                             <h4 className="font-bold text-base">Instalar no iPhone</h4>
                             <button onClick={() => setIsVisible(false)} className="text-skin-muted hover:text-skin-text"><X size={16}/></button>
                        </div>
                        <p className="text-xs text-skin-muted mb-2">Para instalar o App iabooks:</p>
                        <ol className="text-xs text-skin-text list-decimal pl-4 space-y-1">
                            <li>Toque no botão <span className="inline-flex items-center gap-1 font-bold"><Share size={10} /> Compartilhar</span> abaixo.</li>
                            <li>Role para baixo e toque em <span className="font-bold">"Adicionar à Tela de Início"</span>.</li>
                        </ol>
                    </div>
                </div>
            ) : (
                /* Android/Chrome Button */
                <>
                    <div className="flex items-center gap-4">
                        <div className="bg-brand-500 p-3 rounded-lg text-white shadow-lg shadow-brand-500/30">
                            <Download size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-base">Instale o iabooks App</h4>
                            <p className="text-xs text-skin-muted">Leitura 100% offline e melhor performance.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button 
                            onClick={() => setIsVisible(false)}
                            className="p-2 text-skin-muted hover:text-skin-text transition-colors"
                        >
                            Agora não
                        </button>
                        {deferredPrompt && (
                            <button 
                                onClick={handleInstallClick}
                                className="flex-1 sm:flex-none bg-brand-600 hover:bg-brand-500 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-lg"
                            >
                                Instalar Agora
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
      )}
    </div>
  );
};

export default InstallPwaNotification;
