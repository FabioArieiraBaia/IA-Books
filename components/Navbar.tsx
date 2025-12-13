
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User as UserIcon, Layout, Sun, Moon, Sparkles, LogIn, LogOut, ShieldCheck, Key, CheckCircle, ExternalLink, Globe, Users, Palette, Droplets, Trees, Fish, Rocket, Upload, UserPlus, FileKey } from 'lucide-react';
import { useTheme, Theme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getDailyQuote, getLiveUsers, incrementGlobalVisits, Quote } from '../services/analyticsService';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, login, logout, importIdentity } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  
  // Menus
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  
  // Login Modal State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginMode, setLoginMode] = useState<'create' | 'restore'>('create');
  const [loginForm, setLoginForm] = useState({ name: '', email: '' });
  
  // Restore State
  const [restorePassword, setRestorePassword] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API Key Modal State
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [hasKey, setHasKey] = useState(false);

  // Analytics State
  const [quote, setQuote] = useState<Quote | null>(null);
  const [liveUsers, setLiveUsers] = useState(0);
  const [totalVisits, setTotalVisits] = useState("...");

  useEffect(() => {
    // 1. Scroll Handler
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20); 
    };
    window.addEventListener('scroll', handleScroll);
    
    // 2. Initial Data Load
    setHasKey(!!localStorage.getItem('iabooks_api_key'));
    setQuote(getDailyQuote());
    
    // 3. Initialize Visits (Async) - Delayed slightly to prioritize paint
    setTimeout(() => {
        incrementGlobalVisits().then(count => setTotalVisits(count));
    }, 1000);

    // 4. Live Users "Breathing" Interval
    const interval = setInterval(() => {
        setLiveUsers(getLiveUsers());
    }, 3000);
    setLiveUsers(getLiveUsers());

    return () => {
        window.removeEventListener('scroll', handleScroll);
        clearInterval(interval);
    };
  }, []);

  const getThemeIcon = () => {
    switch(theme) {
        case 'light': return <Sun size={20} />;
        case 'dark': return <Moon size={20} />;
        case 'iabooks': return <Sparkles size={20} />;
        case 'water': return <Droplets size={20} />;
        case 'forest': return <Trees size={20} />;
        case 'ocean': return <Fish size={20} />;
        case 'universe': return <Rocket size={20} />;
        default: return <Palette size={20} />;
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.name && loginForm.email) {
      login(loginForm.name, loginForm.email);
      setShowLoginModal(false);
    }
  };

  const handleRestoreSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const file = fileInputRef.current?.files?.[0];
      if (!file || !restorePassword) {
          alert(t('login.error_restore'));
          return;
      }

      setIsRestoring(true);
      try {
          await importIdentity(file, restorePassword);
          setShowLoginModal(false);
          alert(t('login.success_restore'));
          // Reload to apply restored session completely
          window.location.reload();
      } catch (err: any) {
          alert(t('login.error_restore'));
      } finally {
          setIsRestoring(false);
      }
  };

  const handleSaveKey = () => {
      if (!apiKeyInput.trim()) return;
      localStorage.setItem('iabooks_api_key', apiKeyInput.trim());
      setHasKey(true);
      setShowKeyModal(false);
      alert("Chave(s) API salva(s)! O sistema usará as chaves em sequência caso alguma falhe.");
  };

  const handleClearKey = () => {
      if(confirm("Tem certeza que deseja remover sua chave API deste navegador?")) {
          localStorage.removeItem('iabooks_api_key');
          setHasKey(false);
          setApiKeyInput('');
      }
  };

  // Nav Background Logic
  const isTransparentPage = location.pathname === '/' || location.pathname === '/community';
  let navClasses = "";
  if (isTransparentPage && !isScrolled) {
     navClasses = "bg-gradient-to-b from-skin-base/90 to-transparent";
  } else {
     navClasses = "bg-skin-secondary/95 backdrop-blur-md shadow-md border-b border-skin-border";
  }

  const themesList: { id: Theme; icon: any }[] = [
    { id: 'dark', icon: Moon },
    { id: 'light', icon: Sun },
    { id: 'iabooks', icon: Sparkles },
    { id: 'wood', icon: Palette },
    { id: 'water', icon: Droplets },
    { id: 'forest', icon: Trees },
    { id: 'ocean', icon: Fish },
    { id: 'universe', icon: Rocket },
  ];

  return (
    <>
      <div className={`fixed w-full z-50 transition-all duration-500 flex flex-col ${navClasses}`}>
        
        {/* TOP BAR: ANALYTICS & QUOTE */}
        <div className={`w-full bg-brand-950/90 backdrop-blur-sm border-b border-white/5 text-[10px] md:text-xs py-1.5 px-4 md:px-12 flex justify-between items-center transition-all duration-500 overflow-hidden ${isScrolled ? 'h-0 opacity-0 py-0 border-0' : 'h-8 opacity-100'}`}>
            <div className="flex items-center gap-4 text-brand-100/80 overflow-hidden whitespace-nowrap">
                <span className="hidden md:flex items-center gap-1.5" title="Contador Global Real">
                    <CheckCircle size={10} className="text-green-400" />
                    <span className="font-mono">{totalVisits} leitores impactados</span>
                </span>
                <span className="hidden md:inline text-brand-500/30">|</span>
                {quote && (
                    <span className="italic truncate max-w-[200px] md:max-w-none">
                        "{quote.text}" — {quote.author}
                    </span>
                )}
            </div>
            
            <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 text-green-400 font-bold">
                    <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Users size={12} />
                        <span>{liveUsers} online</span>
                    </div>
                 </div>

                 <button 
                    onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
                    className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-colors uppercase"
                    aria-label="Mudar idioma"
                 >
                    <Globe size={10} /> {language === 'pt' ? 'BR' : 'EN'}
                 </button>
            </div>
        </div>

        {/* MAIN NAVBAR */}
        <div className="px-4 md:px-12 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-brand-500 font-serif font-bold text-2xl md:text-3xl tracking-tighter hover:text-brand-400 transition-colors">
              iabooks
            </Link>
            
            <div className="hidden md:flex gap-6 text-sm font-medium text-skin-muted">
              <Link to="/" className={`hover:text-skin-text transition-colors ${location.pathname === '/' ? 'text-skin-text font-bold' : ''}`}>{t('nav.home')}</Link>
              <Link to="/community" className={`hover:text-skin-text transition-colors ${location.pathname === '/community' ? 'text-skin-text font-bold' : ''}`}>{t('nav.library')}</Link>
              <Link to="/create" className={`hover:text-skin-text transition-colors ${location.pathname === '/create' ? 'text-skin-text font-bold' : ''}`}>{t('nav.studio')}</Link>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6 text-skin-text">
            
            {/* API Key Button */}
            <button 
                onClick={() => setShowKeyModal(true)}
                className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded border transition-all ${hasKey ? 'text-green-500 border-green-500/30 bg-green-500/10' : 'text-red-400 border-red-500/30 bg-red-500/10 animate-pulse'}`}
                title="Configurar Chave API"
                aria-label="Configurar Chave API"
            >
                <Key size={14} />
                <span className="hidden sm:inline">{hasKey ? t('nav.apiKeyConnected') : t('nav.apiKey')}</span>
            </button>

            <Link 
              to="/create" 
              className="hidden sm:flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold transition-all shadow-lg hover:shadow-brand-500/20 transform hover:scale-105"
            >
              <Layout size={16} />
              <span>{t('nav.create')}</span>
            </Link>

            {/* THEME TOGGLE */}
            <div className="relative">
                <button 
                    onClick={() => setShowThemeMenu(!showThemeMenu)} 
                    className="hover:text-brand-500 transition-colors p-1" 
                    title="Mudar Tema"
                    aria-label="Mudar Tema"
                >
                    {getThemeIcon()}
                </button>
                {showThemeMenu && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowThemeMenu(false)}></div>
                        <div className="absolute top-full right-0 mt-2 w-48 bg-skin-secondary border border-skin-border rounded-lg shadow-xl z-20 overflow-hidden py-1 animate-fade-in">
                            {themesList.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => { setTheme(item.id); setShowThemeMenu(false); }}
                                    className={`flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-skin-tertiary transition-colors ${theme === item.id ? 'text-brand-500 font-bold bg-skin-tertiary' : 'text-skin-text'}`}
                                >
                                    <item.icon size={16} />
                                    {t(`themes.${item.id}`)}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {user ? (
              <div className="flex items-center gap-3 group cursor-pointer relative">
                 <Link to="/profile" className="flex items-center gap-3" aria-label="Perfil">
                     <div className="text-right hidden md:block">
                        <p className="text-xs font-bold">{user.name}</p>
                        <p className="text-[10px] text-skin-muted">{user.isAdmin ? 'Admin' : 'Membro'}</p>
                     </div>
                     <div className={`w-8 h-8 rounded-full overflow-hidden border border-skin-border group-hover:border-brand-500 transition-colors`}>
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">
                                {user.name.substring(0, 2).toUpperCase()}
                            </div>
                        )}
                     </div>
                 </Link>
                 
                 {/* Dropdown Menu */}
                 <div className="absolute top-full right-0 mt-2 w-48 bg-skin-secondary border border-skin-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link to="/profile" className="flex items-center gap-2 w-full px-4 py-2 text-sm text-skin-text hover:bg-skin-tertiary">
                       <UserIcon size={14} /> {t('nav.profile')}
                    </Link>
                    <button onClick={logout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-skin-tertiary rounded-b-lg">
                       <LogOut size={14} /> {t('nav.logout')}
                    </button>
                 </div>
              </div>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="flex items-center gap-2 text-sm font-medium hover:text-brand-500" aria-label="Login">
                <LogIn size={20} />
                <span className="hidden md:inline">{t('nav.login')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* LOGIN MODAL (Create OR Restore) */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-skin-secondary p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-skin-border relative animate-slide-up">
              <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-skin-muted hover:text-skin-text" aria-label="Fechar">✕</button>
              
              <div className="flex items-center gap-2 mb-2 text-brand-500">
                 <ShieldCheck size={28} />
                 <h2 className="text-2xl font-serif font-bold text-skin-text">{t('login.title')}</h2>
              </div>

              {/* TABS */}
              <div className="flex border-b border-skin-border mb-6">
                  <button 
                    onClick={() => setLoginMode('create')}
                    className={`flex-1 pb-2 text-sm font-bold transition-colors border-b-2 ${loginMode === 'create' ? 'text-brand-500 border-brand-500' : 'text-skin-muted border-transparent hover:text-skin-text'}`}
                  >
                      {t('login.tab_create')}
                  </button>
                  <button 
                    onClick={() => setLoginMode('restore')}
                    className={`flex-1 pb-2 text-sm font-bold transition-colors border-b-2 ${loginMode === 'restore' ? 'text-brand-500 border-brand-500' : 'text-skin-muted border-transparent hover:text-skin-text'}`}
                  >
                      {t('login.tab_restore')}
                  </button>
              </div>

              {loginMode === 'create' ? (
                  /* CREATE FORM */
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                     <div className="bg-skin-tertiary p-3 rounded-lg border border-skin-border mb-4">
                        <div className="flex gap-2 items-start">
                            <UserPlus size={16} className="text-brand-500 mt-1 shrink-0" />
                            <p className="text-skin-muted text-xs leading-relaxed">
                                {t('login.create_desc')}
                            </p>
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold uppercase text-brand-500 mb-1">{t('login.label_name')}</label>
                        <input 
                          type="text" 
                          value={loginForm.name}
                          onChange={e => setLoginForm({...loginForm, name: e.target.value})}
                          className="w-full bg-skin-tertiary border border-skin-border rounded-lg px-4 py-2 text-skin-text focus:border-brand-500 outline-none"
                          required
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold uppercase text-brand-500 mb-1">{t('login.label_email')}</label>
                        <input 
                          type="email" 
                          value={loginForm.email}
                          onChange={e => setLoginForm({...loginForm, email: e.target.value})}
                          className="w-full bg-skin-tertiary border border-skin-border rounded-lg px-4 py-2 text-skin-text focus:border-brand-500 outline-none"
                          required
                        />
                     </div>
                     <button type="submit" className="w-full bg-brand-600 hover:bg-brand-500 text-white py-3 rounded-lg font-bold transition-colors shadow-lg">
                        {t('login.btn_create')}
                     </button>
                  </form>
              ) : (
                  /* RESTORE FORM */
                  <form onSubmit={handleRestoreSubmit} className="space-y-4">
                      <div className="bg-skin-tertiary p-3 rounded-lg border border-skin-border mb-4">
                        <div className="flex gap-2 items-start">
                            <FileKey size={16} className="text-brand-500 mt-1 shrink-0" />
                            <p className="text-skin-muted text-xs leading-relaxed">
                                {t('login.restore_desc')}
                            </p>
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold uppercase text-brand-500 mb-1">{t('login.label_file')}</label>
                        <div className="relative">
                            <input 
                                type="file" 
                                accept=".iabooks" 
                                ref={fileInputRef}
                                className="w-full bg-skin-tertiary border border-skin-border rounded-lg px-4 py-2 text-skin-text text-xs focus:border-brand-500 outline-none file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-brand-500 file:text-white hover:file:bg-brand-600"
                                required
                            />
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold uppercase text-brand-500 mb-1">{t('login.label_pass')}</label>
                        <input 
                          type="password" 
                          value={restorePassword}
                          onChange={e => setRestorePassword(e.target.value)}
                          placeholder={t('login.placeholder_pass')}
                          className="w-full bg-skin-tertiary border border-skin-border rounded-lg px-4 py-2 text-skin-text focus:border-brand-500 outline-none font-mono"
                          required
                        />
                     </div>
                     <button type="submit" disabled={isRestoring} className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold transition-colors shadow-lg flex items-center justify-center gap-2">
                        {isRestoring ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Upload size={18} />}
                        {t('login.btn_restore')}
                     </button>
                  </form>
              )}
           </div>
        </div>
      )}

      {/* API KEY MODAL */}
      {showKeyModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-skin-secondary p-8 rounded-2xl shadow-2xl max-w-md w-full border border-skin-border relative animate-slide-up">
              <button onClick={() => setShowKeyModal(false)} className="absolute top-4 right-4 text-skin-muted hover:text-skin-text" aria-label="Fechar">✕</button>
              
              <div className="flex items-center gap-2 mb-2 text-brand-500">
                 <Key size={28} />
                 <h2 className="text-2xl font-serif font-bold text-skin-text">Configurar IA</h2>
              </div>
              
              <p className="text-skin-muted mb-4">
                Para criar livros com inteligência artificial, você precisa de uma chave gratuita do Google Gemini.
              </p>

              <div className="bg-skin-tertiary p-4 rounded-lg border border-skin-border mb-6">
                 <h3 className="font-bold text-skin-text text-sm mb-2 flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500" /> Como funciona:
                 </h3>
                 <ul className="text-xs text-skin-muted space-y-2 list-disc pl-4">
                    <li>Sua chave fica salva <strong>apenas no seu navegador</strong>.</li>
                    <li>Nós nunca temos acesso a ela.</li>
                    <li>É totalmente gratuito gerar a chave no Google.</li>
                 </ul>
                 <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-4 block w-full text-center bg-skin-base border border-skin-border hover:border-brand-500 text-brand-500 text-xs font-bold py-2 rounded transition-colors flex items-center justify-center gap-2"
                 >
                    Obter Chave no Google AI Studio <ExternalLink size={12} />
                 </a>
              </div>
              
              <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold uppercase text-brand-500 mb-1">Cole suas API Keys aqui</label>
                    <textarea 
                      value={apiKeyInput}
                      onChange={e => setApiKeyInput(e.target.value)}
                      placeholder="AIzaSy..., AIzaSy... (Separe por vírgula para balanceamento)"
                      className="w-full bg-skin-tertiary border border-skin-border rounded-lg px-4 py-2 text-skin-text focus:border-brand-500 outline-none font-mono text-sm h-24 resize-none"
                    />
                    <p className="text-[10px] text-skin-muted mt-1">Dica: Adicione várias chaves separadas por vírgula. Se uma atingir o limite, o sistema usará a próxima automaticamente.</p>
                 </div>
                 
                 <div className="flex gap-2">
                    <button 
                        onClick={handleSaveKey} 
                        className="flex-1 bg-brand-600 hover:bg-brand-500 text-white py-3 rounded-lg font-bold transition-colors shadow-lg"
                    >
                        Salvar Chaves
                    </button>
                    {hasKey && (
                        <button 
                            onClick={handleClearKey} 
                            className="px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg font-bold transition-colors border border-red-500/20"
                            title="Remover Chave"
                            aria-label="Remover Chave"
                        >
                            <LogOut size={20} />
                        </button>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
