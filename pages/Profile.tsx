
import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBook } from '../context/BookContext';
import { useLanguage } from '../context/LanguageContext';
import { Book } from '../types';
import { Link } from 'react-router-dom';
import { BookOpen, Heart, Clock, User, Award, Settings, LogOut, Download, Upload, Lock, ShieldCheck, Key, HelpCircle } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, logout, exportIdentity, importIdentity } = useAuth();
  const { books } = useBook();
  const { t } = useLanguage();
  const [createdBooks, setCreatedBooks] = useState<Book[]>([]);
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>([]);
  const [readingList, setReadingList] = useState<Book[]>([]);

  // Identity Modal State
  const [showVaultModal, setShowVaultModal] = useState<'export' | 'import' | null>(null);
  const [vaultPassword, setVaultPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
        const myBooks = books.filter(b => b.author === user.name);
        const myFavs = books.filter(b => user.favorites.includes(b.id));
        const inProgressIds = user.readingProgress.map(p => p.bookId);
        const myReading = books.filter(b => inProgressIds.includes(b.id));

        setCreatedBooks(myBooks);
        setFavoriteBooks(myFavs);
        setReadingList(myReading);
    }
  }, [user, books]);

  const handleExport = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!vaultPassword) return;
      setIsProcessing(true);
      try {
          await exportIdentity(vaultPassword);
          setShowVaultModal(null);
          setVaultPassword('');
          alert("Identidade exportada com segurança! Guarde este arquivo em um local seguro (Pen Drive, Cloud).");
      } catch (err: any) {
          alert("Erro ao exportar: " + err.message);
      } finally {
          setIsProcessing(false);
      }
  };

  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setShowVaultModal('import');
      }
  };

  const handleImport = async (e: React.FormEvent) => {
      e.preventDefault();
      const file = fileInputRef.current?.files?.[0];
      if(!vaultPassword || !file) return;

      setIsProcessing(true);
      try {
          await importIdentity(file, vaultPassword);
          setShowVaultModal(null);
          setVaultPassword('');
          alert(t('login.success_restore'));
          // CRITICAL FIX: Reload to apply restored session, API key, and theme globally
          window.location.reload();
      } catch (err: any) {
          alert(t('login.error_restore'));
      } finally {
          setIsProcessing(false);
      }
  };

  if (!user) {
      return (
          <div className="min-h-screen pt-24 flex items-center justify-center bg-skin-base text-skin-text px-4">
              <div className="bg-skin-secondary p-8 rounded-2xl shadow-2xl max-w-md w-full border border-skin-border text-center animate-fade-in">
                  <div className="bg-brand-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-500/20">
                      <Lock className="text-brand-500" size={32} />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 font-serif">{t('profile.restore_title')}</h2>
                  <p className="mb-6 text-skin-muted text-sm leading-relaxed">
                      {t('profile.restore_desc')}
                  </p>
                  
                  <input 
                      type="file" 
                      accept=".iabooks" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileSelected} 
                  />
                  
                  <button 
                      onClick={handleImportClick}
                      className="w-full bg-brand-600 hover:bg-brand-500 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 mb-4 transition-colors shadow-lg"
                  >
                      <Upload size={18} /> {t('profile.upload_btn')}
                  </button>
                  
                  <div className="text-xs text-skin-muted border-t border-skin-border pt-4">
                      <p>{t('profile.no_file')} <br/> {t('profile.login_suggest')}</p>
                  </div>
              </div>

              {/* Import Modal Logic */}
              {showVaultModal === 'import' && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                   <div className="bg-skin-secondary p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-skin-border relative animate-slide-up">
                       <button onClick={() => setShowVaultModal(null)} className="absolute top-4 right-4 text-skin-muted hover:text-skin-text">✕</button>
                       <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-brand-500">
                           <Key size={20} /> {t('profile.decrypt_title')}
                       </h3>
                       <p className="text-sm text-skin-muted mb-4">{t('profile.decrypt_desc')}</p>
                       <form onSubmit={handleImport}>
                           <input 
                               type="password" 
                               value={vaultPassword}
                               onChange={e => setVaultPassword(e.target.value)}
                               className="w-full px-4 py-3 rounded-lg bg-skin-tertiary border border-skin-border mb-4 focus:border-brand-500 outline-none text-skin-text"
                               placeholder={t('profile.password_placeholder')}
                               autoFocus
                           />
                           <button type="submit" disabled={isProcessing} className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold">
                               {isProcessing ? t('profile.decrypting') : t('profile.unlock_btn')}
                           </button>
                       </form>
                   </div>
                </div>
              )}
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-skin-base pt-24 pb-12 px-4 transition-colors duration-500">
      <div className="max-w-6xl mx-auto">
        
        {/* Profile Header */}
        <div className="bg-skin-secondary rounded-2xl p-8 border border-skin-border shadow-xl mb-12 flex flex-col md:flex-row items-center gap-8 animate-slide-up relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-brand-500 shadow-2xl overflow-hidden bg-skin-tertiary">
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-0 right-0 bg-skin-base border border-skin-border p-2 rounded-full shadow-lg">
                    <User size={20} className="text-brand-500" />
                </div>
            </div>
            
            <div className="flex-1 text-center md:text-left z-10">
                <h1 className="text-3xl font-serif font-bold text-skin-text mb-2">{user.name}</h1>
                <p className="text-skin-muted mb-4 font-mono text-sm">{user.id}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
                    <div className="flex items-center gap-2 bg-skin-tertiary px-3 py-1.5 rounded-lg border border-skin-border">
                        <BookOpen size={14} className="text-brand-500" />
                        <span className="font-bold text-skin-text text-sm">{createdBooks.length}</span> <span className="text-[10px] text-skin-muted uppercase">{t('profile.works')}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-skin-tertiary px-3 py-1.5 rounded-lg border border-skin-border">
                        <Heart size={14} className="text-red-500" />
                        <span className="font-bold text-skin-text text-sm">{favoriteBooks.length}</span> <span className="text-[10px] text-skin-muted uppercase">{t('profile.favorites')}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/30">
                        <ShieldCheck size={14} className="text-green-500" />
                        <span className="text-[10px] font-bold text-green-500 uppercase">{t('profile.safe_identity')}</span>
                    </div>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                     <button 
                        onClick={() => setShowVaultModal('export')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-500 transition-colors font-bold text-sm shadow-lg shadow-brand-900/20"
                     >
                        <Download size={16} /> {t('profile.backup_btn')}
                     </button>
                     <button onClick={logout} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-skin-tertiary text-red-400 hover:bg-red-500 hover:text-white transition-colors font-bold text-sm border border-skin-border">
                        <LogOut size={16} /> {t('profile.logout_btn')}
                     </button>
                </div>
            </div>
        </div>
        
        {/* IDENTITY GUIDE - NEW SECTION */}
        <div className="mb-12 bg-skin-secondary/50 border border-skin-border rounded-xl p-6 animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <h3 className="text-lg font-bold text-skin-text mb-4 flex items-center gap-2">
                <HelpCircle size={20} className="text-brand-500" /> {t('profile.guide_title')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="bg-skin-tertiary p-4 rounded-lg">
                    <strong className="block text-skin-text mb-2">{t('profile.guide_1_title')}</strong>
                    <p className="text-skin-muted">{t('profile.guide_1_desc')}</p>
                </div>
                <div className="bg-skin-tertiary p-4 rounded-lg">
                    <strong className="block text-skin-text mb-2">{t('profile.guide_2_title')}</strong>
                    <p className="text-skin-muted">{t('profile.guide_2_desc')}</p>
                </div>
                <div className="bg-skin-tertiary p-4 rounded-lg">
                    <strong className="block text-skin-text mb-2">{t('profile.guide_3_title')}</strong>
                    <p className="text-skin-muted">{t('profile.guide_3_desc')}</p>
                </div>
            </div>
        </div>

        {/* VAULT MODALS */}
        {showVaultModal && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                <div className="bg-skin-secondary p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-skin-border relative animate-slide-up">
                    <button onClick={() => setShowVaultModal(null)} className="absolute top-4 right-4 text-skin-muted hover:text-skin-text">✕</button>
                    
                    <div className="flex items-center gap-3 mb-4 text-brand-500">
                        <Lock size={28} />
                        <h3 className="text-xl font-bold text-skin-text">
                            {showVaultModal === 'export' ? t('profile.protect_title') : t('profile.decrypt_title')}
                        </h3>
                    </div>

                    <p className="text-sm text-skin-muted mb-6">
                        {showVaultModal === 'export' 
                            ? t('profile.protect_desc') 
                            : t('profile.decrypt_desc')}
                    </p>

                    <form onSubmit={showVaultModal === 'export' ? handleExport : handleImport}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-brand-500 uppercase mb-1">{t('profile.encrypt_pass_label')}</label>
                                <input 
                                    type="password" 
                                    value={vaultPassword}
                                    onChange={e => setVaultPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-skin-tertiary border border-skin-border focus:border-brand-500 outline-none text-skin-text font-mono"
                                    placeholder="••••••••"
                                    autoFocus
                                    required
                                    minLength={4}
                                />
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={isProcessing}
                                className={`w-full py-3 rounded-lg font-bold text-white transition-colors shadow-lg flex items-center justify-center gap-2 ${showVaultModal === 'export' ? 'bg-brand-600 hover:bg-brand-500' : 'bg-green-600 hover:bg-green-500'}`}
                            >
                                {isProcessing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (showVaultModal === 'export' ? t('profile.download_secure_btn') : t('profile.unlock_btn'))}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* REST OF PROFILE CONTENT (Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Stats & Continuing */}
            <div className="lg:col-span-2 space-y-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                {/* Continue Reading */}
                <div className="bg-skin-secondary rounded-xl p-6 border border-skin-border shadow-lg">
                    <h2 className="text-xl font-bold text-skin-text mb-6 flex items-center gap-2">
                        <Clock className="text-brand-500" /> Continue Lendo
                    </h2>
                    {readingList.length > 0 ? (
                        <div className="space-y-4">
                            {readingList.map(book => {
                                const progress = user.readingProgress.find(p => p.bookId === book.id);
                                return (
                                    <Link key={book.id} to={`/read/${book.id}`} className="flex gap-4 p-4 rounded-lg bg-skin-tertiary hover:bg-skin-base border border-skin-border transition-all group">
                                        <div className="w-16 h-24 bg-skin-base rounded shadow-md flex-shrink-0 overflow-hidden">
                                            {book.coverUrl && <img src={book.coverUrl} className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-skin-text group-hover:text-brand-500 transition-colors">{book.title}</h3>
                                            <div className="w-full bg-skin-border h-2 rounded-full overflow-hidden mt-3">
                                                <div className="bg-brand-500 h-full rounded-full" style={{ width: `${progress?.percentage || 0}%` }}></div>
                                            </div>
                                            <div className="flex justify-between text-[10px] text-skin-muted mt-1">
                                                <span>{Math.round(progress?.percentage || 0)}%</span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-skin-muted text-center py-8">Você ainda não iniciou nenhuma leitura.</p>
                    )}
                </div>

                {/* My Creations */}
                 <div className="bg-skin-secondary rounded-xl p-6 border border-skin-border shadow-lg">
                    <h2 className="text-xl font-bold text-skin-text mb-6 flex items-center gap-2">
                        <BookOpen className="text-brand-500" /> Minhas Obras
                    </h2>
                    {createdBooks.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {createdBooks.map(book => (
                                <Link key={book.id} to={`/read/${book.id}`} className="group relative aspect-[2/3] rounded-lg overflow-hidden border border-skin-border hover:border-brand-500 transition-all">
                                    {book.coverUrl ? (
                                        <img src={book.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full bg-skin-tertiary flex items-center justify-center"><BookOpen className="text-skin-muted" /></div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex flex-col justify-end">
                                        <p className="text-white text-sm font-bold leading-tight">{book.title}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-skin-muted mb-4">Você ainda não publicou nenhum livro.</p>
                            <Link to="/create" className="inline-block px-6 py-2 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-500 transition-colors">
                                Criar meu Primeiro Livro
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Favorites & Meta */}
            <div className="space-y-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                 <div className="bg-skin-secondary rounded-xl p-6 border border-skin-border shadow-lg">
                    <h2 className="text-xl font-bold text-skin-text mb-6 flex items-center gap-2">
                        <Heart className="text-red-500" /> Favoritos
                    </h2>
                    {favoriteBooks.length > 0 ? (
                         <div className="space-y-3">
                             {favoriteBooks.map(book => (
                                 <Link key={book.id} to={`/read/${book.id}`} className="flex items-center gap-3 p-2 rounded hover:bg-skin-tertiary transition-colors group">
                                     <div className="w-10 h-14 bg-skin-tertiary rounded overflow-hidden flex-shrink-0">
                                         {book.coverUrl && <img src={book.coverUrl} className="w-full h-full object-cover" />}
                                     </div>
                                     <div className="flex-1 min-w-0">
                                         <p className="text-sm font-bold text-skin-text truncate group-hover:text-brand-500">{book.title}</p>
                                     </div>
                                 </Link>
                             ))}
                         </div>
                    ) : (
                        <p className="text-skin-muted text-sm">Nenhum favorito ainda.</p>
                    )}
                </div>
            </div>
        </div>
      </div>
      
      {/* Hidden Input for Import */}
      <input 
          type="file" 
          accept=".iabooks" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileSelected} 
      />
    </div>
  );
};

export default Profile;
