
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useBook } from '../context/BookContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Play, Plus, ChevronRight, ChevronLeft, BookOpen, Library as LibraryIcon, User, Heart, Globe, Loader2, Search, X, Sparkles, ShieldCheck, Database, Lock, Share2 } from 'lucide-react';
import { Book } from '../types';
import SEO from '../components/SEO';

const Library: React.FC = () => {
  const { books, isLoading, refreshLibrary } = useBook();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Carousel State
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [isHoveringHero, setIsHoveringHero] = useState(false);
  
  useEffect(() => {
     refreshLibrary();
  }, []);

  const baseBooks = user && activeTab === 'mine' ? books.filter(b => b.author === user.name) : books;

  const filteredBooks = searchQuery.trim() 
    ? baseBooks.filter(b => 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.tags && b.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        (b.category && b.category.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : baseBooks;

  // Hero Carousel Logic: Get top 10 newest books or default if empty
  const heroBooks = books.length > 0 ? books.slice(0, 10) : [];
  const activeHeroBook = heroBooks.length > 0 ? heroBooks[currentHeroIndex] : null;
  const latestBookImage = activeHeroBook?.coverUrl || 'https://iabooks.com.br/assets/logo.svg';

  // Auto-rotate hero
  useEffect(() => {
    if (heroBooks.length <= 1 || isHoveringHero) return;
    
    const interval = setInterval(() => {
        setCurrentHeroIndex(prev => (prev + 1) % heroBooks.length);
    }, 6000); // 6 seconds per slide

    return () => clearInterval(interval);
  }, [heroBooks.length, isHoveringHero]);

  const nextHero = (e?: React.MouseEvent) => {
      e?.preventDefault();
      setCurrentHeroIndex(prev => (prev + 1) % heroBooks.length);
  };

  const prevHero = (e?: React.MouseEvent) => {
      e?.preventDefault();
      setCurrentHeroIndex(prev => (prev - 1 + heroBooks.length) % heroBooks.length);
  };

  // Categories logic
  const recentBooks = baseBooks.slice(0, 10);
  const ptBooks = baseBooks.filter(b => b.language === 'pt' || !b.language); 
  const enBooks = baseBooks.filter(b => b.language === 'en');
  
  const educationalBooks = baseBooks.filter(b => b.type === 'apostila');
  const storyBooks = baseBooks.filter(b => b.type === 'ebook' || b.type === 'livro');
  const recommendedBooks = [...baseBooks].sort(() => 0.5 - Math.random()).slice(0, 5);

  const handleDonateClick = () => {
      const message = encodeURIComponent("Quero apoiar o projeto IABOOKS");
      window.open(`https://wa.me/5524993050256?text=${message}`, '_blank');
  };

  if (isLoading && books.length === 0) {
      return (
          <div className="min-h-screen bg-skin-base flex items-center justify-center">
              <div className="flex flex-col items-center">
                 <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
                 <p className="text-skin-muted animate-pulse">Conectando à Biblioteca Global...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen pb-20 transition-colors duration-500">
      
      <SEO 
        title={t('hero.title')}
        description={t('hero.subtitle')}
        image={latestBookImage}
      />

      {/* HERO CAROUSEL SECTION */}
      <div 
        className="relative h-[85vh] w-full overflow-hidden group/hero"
        onMouseEnter={() => setIsHoveringHero(true)}
        onMouseLeave={() => setIsHoveringHero(false)}
      >
        {/* CAROUSEL ITEMS */}
        {heroBooks.length > 0 ? (
            heroBooks.map((book, index) => {
                const isActive = index === currentHeroIndex;
                return (
                    <div 
                        key={book.id} 
                        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                    >
                        {/* Background Image - LCP Optimized with fetchPriority */}
                        <div className="absolute inset-0">
                            {book.coverUrl ? (
                                <img 
                                    src={book.coverUrl} 
                                    alt={book.title} 
                                    className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-linear ${isActive ? 'scale-110' : 'scale-100'}`}
                                    fetchPriority={isActive ? "high" : "low"}
                                    loading={isActive ? "eager" : "lazy"}
                                />
                            ) : (
                                <div className="w-full h-full bg-skin-secondary"></div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-skin-base via-skin-base/80 to-transparent"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-skin-base/95 via-skin-base/40 to-transparent"></div>
                        </div>

                        {/* Content */}
                        <div className="absolute top-0 left-0 w-full h-full px-4 md:px-12 flex flex-col justify-center pt-16">
                            <div className={`max-w-3xl transition-all duration-700 delay-300 transform ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                                <div className="flex items-center gap-2 mb-4 text-brand-500 font-bold tracking-widest uppercase text-sm">
                                    <span className="bg-brand-600 text-white px-2 py-0.5 rounded text-xs">{t('hero.new_badge')}</span>
                                    <span>#{book.type}</span>
                                    <span className="bg-skin-tertiary px-2 py-0.5 rounded text-[10px] text-skin-muted flex items-center gap-1 border border-skin-border">
                                        <Globe size={10} /> {book.language === 'en' ? 'Inglês' : 'Português'}
                                    </span>
                                </div>
                                <h1 className="text-4xl md:text-7xl font-bold text-skin-text mb-4 drop-shadow-lg leading-tight font-serif line-clamp-2 md:line-clamp-3">
                                    {book.title}
                                </h1>
                                <p className="text-lg text-skin-muted mb-8 line-clamp-3 drop-shadow-md max-w-xl">
                                    {book.description}
                                </p>
                                <div className="flex gap-4">
                                    <Link 
                                        to={`/read/${book.id}`}
                                        className="flex items-center gap-3 bg-skin-text text-skin-base px-6 py-3 md:px-8 md:py-3 rounded hover:bg-opacity-90 transition-colors font-bold text-base md:text-lg shadow-lg hover:shadow-xl"
                                        aria-label={`Ler ${book.title}`}
                                    >
                                        <Play fill="currentColor" size={24} />
                                        {t('hero.read_now')}
                                    </Link>
                                    <button 
                                        onClick={handleDonateClick}
                                        className="hidden md:flex items-center gap-3 bg-skin-secondary/30 backdrop-blur-md text-skin-text px-8 py-3 rounded hover:bg-green-600 hover:text-white transition-colors font-bold text-lg border border-skin-border/50 group"
                                        aria-label="Fazer doação"
                                    >
                                        <Heart size={24} className="group-hover:fill-current" />
                                        {t('hero.donate')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })
        ) : (
            // EMPTY STATE HERO
            <div className="absolute inset-0 w-full h-full z-10">
                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-skin-base via-skin-base/60 to-transparent"></div>
                
                <div className="absolute top-0 left-0 w-full h-full px-4 md:px-12 flex flex-col justify-center">
                    <div className="max-w-2xl animate-slide-up">
                        <h1 className="text-4xl md:text-7xl font-bold text-skin-text mb-6 drop-shadow-lg leading-tight font-serif">
                            {t('hero.title')}
                        </h1>
                        <p className="text-lg md:text-xl text-skin-muted mb-8 max-w-xl drop-shadow-md">
                            {t('hero.subtitle')}
                        </p>
                        <div className="flex gap-4">
                            <Link 
                                to="/create"
                                className="flex items-center gap-3 bg-brand-600 text-white px-6 py-3 md:px-8 md:py-4 rounded hover:bg-brand-700 transition-colors font-bold text-lg md:text-xl inline-flex shadow-lg shadow-brand-900/50"
                            >
                                <Plus size={24} />
                                {t('hero.publish_btn')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* CAROUSEL CONTROLS */}
        {heroBooks.length > 1 && (
            <>
                <button 
                    onClick={prevHero}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/20 text-white backdrop-blur hover:bg-brand-500 hover:text-white transition-all opacity-0 group-hover/hero:opacity-100 hidden md:block"
                    aria-label="Livro Anterior"
                >
                    <ChevronLeft size={32} />
                </button>
                <button 
                    onClick={nextHero}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/20 text-white backdrop-blur hover:bg-brand-500 hover:text-white transition-all opacity-0 group-hover/hero:opacity-100 hidden md:block"
                    aria-label="Próximo Livro"
                >
                    <ChevronRight size={32} />
                </button>

                {/* Indicators */}
                <div className="absolute bottom-24 md:bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                    {heroBooks.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentHeroIndex(idx)}
                            className={`h-1 rounded-full transition-all duration-300 ${
                                idx === currentHeroIndex ? 'w-8 bg-brand-500' : 'w-2 bg-skin-muted/50 hover:bg-skin-text'
                            }`}
                            aria-label={`Ir para slide ${idx + 1}`}
                        />
                    ))}
                </div>
            </>
        )}
      </div>

      {/* SEARCH & FILTER SECTION */}
      <div className="relative z-30 px-4 md:px-12 -mt-10">
         
         <div className="max-w-4xl mx-auto mb-12 animate-fade-in">
             <div className="relative group bg-skin-secondary/90 backdrop-blur-xl border border-skin-border rounded-full shadow-2xl shadow-black/50 hover:shadow-brand-900/10 hover:border-brand-500/50 transition-all duration-300 p-2 flex items-center">
                 <div className="pl-4 pr-3 text-skin-muted group-focus-within:text-brand-500 transition-colors">
                    <Search size={24} />
                 </div>
                 <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('library.search_placeholder')}
                    className="flex-1 bg-transparent border-none outline-none text-skin-text placeholder-skin-muted h-12 text-lg w-full"
                    aria-label="Campo de busca"
                 />
                 <div className="flex items-center gap-2 pr-2">
                     {searchQuery && (
                         <button 
                            onClick={() => setSearchQuery('')}
                            className="p-2 rounded-full hover:bg-skin-tertiary text-skin-muted hover:text-red-400 transition-colors"
                            aria-label="Limpar busca"
                         >
                             <X size={20} />
                         </button>
                     )}
                     <button className="bg-brand-600 hover:bg-brand-500 text-white rounded-full px-6 py-3 font-bold text-sm shadow-lg flex items-center gap-2 transition-all transform active:scale-95">
                         <span className="hidden md:inline">{t('library.search_btn')}</span>
                         <span className="md:hidden"><Search size={20}/></span>
                     </button>
                 </div>
             </div>
         </div>

         {!searchQuery && (
            <div className="flex items-center justify-center gap-8 overflow-x-auto hide-scrollbar mb-10 border-b border-skin-border/30 pb-4 max-w-4xl mx-auto">
                <button 
                    onClick={() => setActiveTab('all')}
                    className={`pb-2 text-lg font-bold transition-all flex items-center gap-2 whitespace-nowrap px-4 border-b-2 ${activeTab === 'all' ? 'text-brand-500 border-brand-500' : 'text-skin-muted border-transparent hover:text-skin-text'}`}
                >
                    <LibraryIcon size={20} /> {t('library.tab_global')}
                </button>
                {user && (
                    <button 
                        onClick={() => setActiveTab('mine')}
                        className={`pb-2 text-lg font-bold transition-all flex items-center gap-2 whitespace-nowrap px-4 border-b-2 ${activeTab === 'mine' ? 'text-brand-500 border-brand-500' : 'text-skin-muted border-transparent hover:text-skin-text'}`}
                    >
                        <User size={20} /> {t('library.tab_mine')}
                    </button>
                )}
            </div>
         )}
      </div>

      {!searchQuery && (
        <div className="px-4 md:px-12 mb-16 max-w-[1600px] mx-auto animate-fade-in">
           <div className="bg-gradient-to-br from-skin-secondary to-skin-tertiary border border-skin-border p-8 md:p-12 rounded-2xl relative overflow-hidden">
               <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                   <div className="flex-1">
                       <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-green-500/20">
                           <ShieldCheck size={14} /> {t('privacy_banner.badge')}
                       </div>
                       <h2 className="text-3xl md:text-4xl font-serif font-bold text-skin-text mb-4">{t('privacy_banner.title')}</h2>
                       <p className="text-skin-muted text-lg mb-6 leading-relaxed">
                           {t('privacy_banner.description')}
                       </p>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="flex items-start gap-3">
                               <div className="p-2 bg-skin-base rounded border border-skin-border text-brand-500"><Lock size={18}/></div>
                               <div>
                                   <h4 className="font-bold text-skin-text text-sm">{t('privacy_banner.local_data_title')}</h4>
                                   <p className="text-xs text-skin-muted">{t('privacy_banner.local_data_desc')}</p>
                               </div>
                           </div>
                           <div className="flex items-start gap-3">
                               <div className="p-2 bg-skin-base rounded border border-skin-border text-brand-500"><Database size={18}/></div>
                               <div>
                                   <h4 className="font-bold text-skin-text text-sm">{t('privacy_banner.public_data_title')}</h4>
                                   <p className="text-xs text-skin-muted">{t('privacy_banner.public_data_desc')}</p>
                               </div>
                           </div>
                       </div>
                   </div>
                   <div className="hidden md:block w-px h-40 bg-skin-border mx-4"></div>
                   <div className="flex-1 max-w-sm">
                       <div className="bg-skin-base p-6 rounded-xl border border-skin-border shadow-lg">
                           <h4 className="font-bold text-skin-text mb-2">{t('privacy_banner.save_account_title')}</h4>
                           <p className="text-sm text-skin-muted mb-4">
                               {t('privacy_banner.save_account_desc')}
                           </p>
                           <Link to="/profile" className="block w-full text-center py-2 bg-skin-secondary hover:bg-skin-tertiary border border-skin-border rounded text-sm font-bold text-brand-500 transition-colors">
                               {t('privacy_banner.manage_identity_btn')}
                           </Link>
                       </div>
                   </div>
               </div>
               
               <div className="absolute -right-20 -top-20 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none"></div>
               <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-green-500/5 rounded-full blur-3xl pointer-events-none"></div>
           </div>
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="px-4 md:px-12 relative z-20 space-y-12 max-w-[1600px] mx-auto">
        {searchQuery ? (
            <div className="animate-fade-in">
                <h2 className="text-xl font-bold text-skin-text mb-6 flex items-center gap-2">
                    <Sparkles size={20} className="text-brand-500" />
                    {t('library.results')} "{searchQuery}"
                    <span className="text-sm font-normal text-skin-muted ml-2">({filteredBooks.length})</span>
                </h2>
                
                {filteredBooks.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {filteredBooks.map(book => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-skin-secondary/30 rounded-xl border border-skin-border border-dashed">
                        <BookOpen size={48} className="mx-auto text-skin-muted mb-4 opacity-50" />
                        <h3 className="text-lg font-bold text-skin-text mb-2">{t('library.no_results')}</h3>
                        <p className="text-skin-muted">Tente buscar por outros termos ou crie este livro agora mesmo.</p>
                        <Link to="/create" className="inline-block mt-4 text-brand-500 font-bold hover:underline">
                            Criar "{searchQuery}" com IA
                        </Link>
                    </div>
                )}
            </div>
        ) : (
            baseBooks.length > 0 ? (
              <>
                <Shelf title={t('library.shelf_community')} books={recentBooks} />
                {enBooks.length > 0 && <Shelf title={t('library.shelf_en')} books={enBooks} />}
                {ptBooks.length > 0 && <Shelf title={t('library.shelf_pt')} books={ptBooks} />}
                {educationalBooks.length > 0 && <Shelf title={t('library.shelf_edu')} books={educationalBooks} />}
                {storyBooks.length > 0 && <Shelf title={t('library.shelf_fiction')} books={storyBooks} />}
                {activeTab === 'all' && <Shelf title={t('library.shelf_rec')} books={recommendedBooks} />}
              </>
            ) : (
               <div className="text-center py-20 animate-fade-in bg-skin-secondary/50 rounded-xl border border-skin-border">
                  <h2 className="text-2xl text-skin-text mb-2">
                      {activeTab === 'mine' ? t('library.empty_mine') : t('library.empty_global')}
                  </h2>
                  <p className="text-skin-muted mb-6">Seja o primeiro a contribuir com conhecimento.</p>
                  <Link to="/create" className="text-brand-500 font-bold hover:underline">{t('nav.studio')}</Link>
               </div>
            )
        )}
      </div>
    </div>
  );
};

const Shelf: React.FC<{ title: string; books: Book[] }> = ({ title, books }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (books.length === 0) return null;

  const scroll = (offset: number) => {
    if (scrollRef.current) {
        scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="group/shelf relative">
      <h2 className="text-xl md:text-2xl font-bold text-skin-text mb-4 flex items-center gap-2 transition-colors">
        {title} 
      </h2>
      
      <div className="relative">
        {/* Left Arrow */}
        <button 
            onClick={() => scroll(-300)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 bg-skin-base/80 backdrop-blur-md rounded-full shadow-lg text-skin-text hover:text-brand-500 hover:bg-skin-base border border-skin-border opacity-0 group-hover/shelf:opacity-100 transition-opacity disabled:opacity-0 -ml-4"
            aria-label="Rolar para esquerda"
        >
            <ChevronLeft size={24} />
        </button>

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto hide-scrollbar py-4 px-2 snap-x snap-mandatory scroll-smooth">
          {books.map((book) => (
            <div key={book.id + title} className="flex-none w-[160px] md:w-[220px] snap-start">
               <BookCard book={book} />
            </div>
          ))}
          <Link to="/create" className="flex-none w-[160px] md:w-[220px] aspect-[2/3] bg-skin-secondary rounded-md border border-skin-border flex flex-col items-center justify-center text-skin-muted hover:bg-skin-tertiary hover:text-skin-text transition-all snap-start cursor-pointer group">
             <div className="w-12 h-12 rounded-full border-2 border-skin-border flex items-center justify-center mb-2 group-hover:border-skin-text group-hover:scale-110 transition-all">
                <Plus size={24} />
             </div>
             <span className="font-medium text-sm">Publicar Novo</span>
          </Link>
        </div>

        {/* Right Arrow */}
        <button 
            onClick={() => scroll(300)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 bg-skin-base/80 backdrop-blur-md rounded-full shadow-lg text-skin-text hover:text-brand-500 hover:bg-skin-base border border-skin-border opacity-0 group-hover/shelf:opacity-100 transition-opacity -mr-4"
            aria-label="Rolar para direita"
        >
            <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

const BookCard: React.FC<{ book: Book }> = ({ book }) => {
  const handleShare = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const url = `${window.location.origin}/#/read/${book.id}`;
      if (navigator.share) {
          navigator.share({
              title: book.title,
              text: `Leia "${book.title}" no iabooks.`,
              url: url
          }).catch(console.error);
      } else {
          navigator.clipboard.writeText(url);
          alert("Link copiado!");
      }
  };

  return (
    <Link 
      to={`/read/${book.id}`}
      className="block w-full aspect-[2/3] relative rounded-md overflow-hidden bg-skin-secondary transition-all duration-300 hover:scale-105 hover:z-30 shadow-lg group ring-1 ring-skin-border hover:ring-brand-500 book-card"
    >
      {book.coverUrl ? (
        <img 
          src={book.coverUrl} 
          alt={book.title} 
          className="w-full h-full object-cover"
          loading="lazy"
          width="300" 
          height="450"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-brand-900/20 to-skin-secondary">
           <BookOpen className="text-brand-500 mb-2" size={32} />
           <span className="text-skin-text font-serif font-bold text-center leading-tight line-clamp-3">{book.title}</span>
        </div>
      )}
      
      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
        <h3 className="text-white font-bold text-sm leading-tight mb-1">{book.title}</h3>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="text-brand-400 font-medium">{book.chapters.length} Caps</span>
          <span>{book.author}</span>
        </div>
        <div className="mt-3 flex gap-2">
            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-brand-500 transition-colors">
                <Play size={12} fill="currentColor" />
            </div>
            <button 
                onClick={handleShare}
                className="w-8 h-8 rounded-full bg-skin-tertiary text-white flex items-center justify-center hover:bg-skin-base border border-white/20 transition-colors"
                title="Compartilhar"
                aria-label="Compartilhar livro"
            >
                <Share2 size={12} />
            </button>
        </div>
      </div>
    </Link>
  );
};

export default Library;
