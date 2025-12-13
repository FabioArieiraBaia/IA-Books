
import React, { useRef, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBook } from '../context/BookContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Download, Share2, BookOpen, ChevronLeft, Type, Volume2, Pause, Play, EyeOff, Eye, Heart, Info, Tag, Facebook, Twitter, Linkedin, Link as LinkIcon, MessageCircle, ZoomIn, ZoomOut, Bookmark, Settings, RefreshCw, Image as ImageIcon, Wand2, Save, X } from 'lucide-react';
import SEO from '../components/SEO';
import { ImageProvider, generateImageByProvider, generateCoverPrompt, generateChapterImagePrompt } from '../services/geminiService';

const ReadBook: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const { getBook, updateBook } = useBook();
  const { user, toggleFavorite, updateReadingProgress } = useAuth();
  const { t } = useLanguage();
  
  // Use local state initialized from book, but keep in sync
  const book = getBook(bookId || '');
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Reader customization state
  const [fontSize, setFontSize] = useState(20);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono'>('serif');
  const [focusMode, setFocusMode] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [bookmarkRestored, setBookmarkRestored] = useState(false);
  
  // Audio State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechInstance, setSpeechInstance] = useState<SpeechSynthesisUtterance | null>(null);
  
  // Reading Progress
  const [scrollProgress, setScrollProgress] = useState(0);

  // ADMIN / EDITOR STATE
  const isAdmin = user?.isAdmin || (user && book && (user.email === book.authorId || user.name === book.author));
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [adminModel, setAdminModel] = useState<ImageProvider>('flux');
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null); // 'cover' or chapterID

  // Restore Bookmark Logic
  useEffect(() => {
    if (user && bookId && !bookmarkRestored) {
        const savedProgress = user.readingProgress.find(p => p.bookId === bookId);
        if (savedProgress && savedProgress.percentage > 0) {
            // Delay slightly to ensure layout rendering
            setTimeout(() => {
                const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
                const targetY = (savedProgress.percentage / 100) * totalHeight;
                window.scrollTo({ top: targetY, behavior: 'smooth' });
                setBookmarkRestored(true);
            }, 500);
        }
    }
  }, [user, bookId, bookmarkRestored]);

  useEffect(() => {
    const handleScroll = () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight <= 0) return;
        
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
        
        // Update user progress if meaningful change (Auto-Bookmark)
        if (user && bookId && Math.abs(progress % 2) < 0.5) {
             updateReadingProgress(bookId, progress, 'unknown');
        }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
        window.removeEventListener('scroll', handleScroll);
        window.speechSynthesis.cancel();
    };
  }, [bookId, user]);

  if (!book) {
    return (
      <div className="min-h-screen bg-skin-base flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-skin-text mb-4">{t('read.unavailable_title')}</h2>
          <Link to="/" className="text-brand-500 hover:text-brand-400 font-medium">{t('read.back_library')}</Link>
        </div>
      </div>
    );
  }

  const isFavorited = user?.favorites.includes(book.id);

  // ----------------------------------------------------------------
  // ADMIN FUNCTIONS
  // ----------------------------------------------------------------
  
  const handleRegenerateCover = async () => {
      if (!book) return;
      const confirm = window.confirm(`Regenerar CAPA usando modelo ${adminModel.toUpperCase()}?`);
      if (!confirm) return;

      setRegeneratingId('cover');
      try {
          // If no prompt exists, generate one
          let prompt = book.coverImagePrompt;
          if (!prompt) {
             prompt = await generateCoverPrompt(book.title, book.description, book.type);
          }

          // Generate Image
          const newUrl = await generateImageByProvider(prompt, adminModel, 800, 1200);
          
          // Update Book
          await updateBook(book.id, {
              coverUrl: newUrl,
              coverImagePrompt: prompt,
              lastModified: Date.now()
          });
      } catch (error: any) {
          alert("Erro ao gerar capa: " + error.message);
      } finally {
          setRegeneratingId(null);
      }
  };

  const handleRegenerateChapterImage = async (chapterIndex: number) => {
      if (!book) return;
      const chapter = book.chapters[chapterIndex];
      const confirm = window.confirm(`Regenerar imagem do CAPÍTULO ${chapterIndex + 1} usando ${adminModel.toUpperCase()}?`);
      if (!confirm) return;

      setRegeneratingId(chapter.id);
      try {
          // If no prompt exists, generate one
          let prompt = chapter.imagePrompt;
          if (!prompt) {
              prompt = await generateChapterImagePrompt(chapter.title, chapter.content || "");
          }

          // Generate Image (Landscape)
          const newUrl = await generateImageByProvider(prompt, adminModel, 800, 450);

          // Update Chapter inside Book
          const updatedChapters = [...book.chapters];
          updatedChapters[chapterIndex] = {
              ...chapter,
              imageUrl: newUrl,
              imagePrompt: prompt
          };

          await updateBook(book.id, {
              chapters: updatedChapters,
              lastModified: Date.now()
          });

      } catch (error: any) {
           alert("Erro ao gerar imagem: " + error.message);
      } finally {
          setRegeneratingId(null);
      }
  };


  // ----------------------------------------------------------------
  // NORMAL FUNCTIONS
  // ----------------------------------------------------------------

  const handleDownload = () => {
    if (!contentRef.current) return;
    // HTML Export with improved styles
    const content = `
      <html>
        <head>
          <title>${book.title}</title>
          <style>
             body { font-family: 'Georgia', serif; line-height: 1.8; color: #111; max-width: 800px; margin: 0 auto; padding: 60px 40px; background: #fff; }
             h1 { text-align: center; color: #000; font-size: 3em; margin-bottom: 0.5em; }
             h2 { border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; margin-top: 40px; color: #333; }
             .callout { background: #f9f9f9; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0; font-style: italic; }
             blockquote { font-size: 1.2em; color: #555; border-left: 2px solid #ccc; padding-left: 20px; margin: 30px 0; }
             img { max-width: 100%; border-radius: 8px; margin: 30px auto; display: block; }
             .meta { text-align: center; color: #777; font-size: 0.9em; margin-bottom: 40px; }
          </style>
        </head>
        <body>
          <h1>${book.title}</h1>
          <div class="meta">por ${book.author} • Gerado via iabooks.com.br</div>
          <p><em>${book.description}</em></p>
          <hr style="margin: 40px 0; border: 0; border-top: 1px solid #eee;" />
          ${book.chapters.map(c => `
             <article>
                <h2>${c.title}</h2>
                ${c.imageUrl ? `<img src="${c.imageUrl}" />` : ''}
                ${c.content}
             </article>
          `).join('')}
        </body>
      </html>
    `;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title.replace(/\s+/g, '_')}.html`;
    a.click();
  };

   const handleJsonDownload = () => {
    const jsonString = JSON.stringify(book, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleAudio = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeechInstance(null);
    } else {
      const fullText = `${book.title}. ${book.description}. ` + book.chapters.map(c => `${c.title}. ${c.content?.replace(/<[^>]*>/g, '')}`).join(' ');
      
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      
      setSpeechInstance(utterance);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // SOCIAL SHARING LOGIC
  const getShareUrl = () => window.location.href;
  const getShareText = () => `Estou lendo "${book.title}" na iabooks.com.br - A Maior Biblioteca de IA do Mundo.`;

  const handleShare = async () => {
    const shareData = {
        title: book.title,
        text: getShareText(),
        url: getShareUrl()
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            setShowShareModal(true); // Fallback if user cancels or error
        }
    } else {
        setShowShareModal(true);
    }
  };

  const handleCopyLink = () => {
      navigator.clipboard.writeText(getShareUrl());
      alert("Link copiado para a área de transferência!");
      setShowShareModal(false);
  };

  const openSocial = (platform: string) => {
      const url = encodeURIComponent(getShareUrl());
      const text = encodeURIComponent(getShareText());
      let target = "";

      switch(platform) {
          case 'whatsapp': target = `https://api.whatsapp.com/send?text=${text}%20${url}`; break;
          case 'facebook': target = `https://www.facebook.com/sharer/sharer.php?u=${url}`; break;
          case 'twitter': target = `https://twitter.com/intent/tweet?text=${text}&url=${url}`; break;
          case 'linkedin': target = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`; break;
      }
      
      window.open(target, '_blank');
      setShowShareModal(false);
  };

  const getFontFamilyClass = () => {
      switch(fontFamily) {
          case 'mono': return 'font-mono';
          case 'sans': return 'font-sans';
          default: return 'font-serif';
      }
  };

  return (
    <div className={`min-h-screen bg-skin-base text-skin-muted transition-colors duration-500 ${focusMode ? 'cursor-none' : ''}`} onMouseMove={() => focusMode && document.body.style.cursor !== 'auto' && (document.body.style.cursor = 'auto')}>
      
      {/* DYNAMIC SEO for this specific book */}
      <SEO 
        title={book.title}
        description={book.description}
        image={book.coverUrl}
        type="book"
        author={book.author}
        publishedTime={new Date(book.createdAt).toISOString()}
      />

      {/* ADMIN CONTROL PANEL - FLOATING & VISIBLE */}
      {isAdmin && showAdminPanel && (
        <div className="fixed top-20 right-4 z-50 bg-skin-secondary p-4 rounded-xl border border-skin-border shadow-2xl animate-fade-in w-72">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-brand-500 flex items-center gap-2"><Settings size={16}/> Ferramentas Admin</h3>
                <button onClick={() => setShowAdminPanel(false)} className="text-skin-muted hover:text-skin-text"><X size={16}/></button>
            </div>
            
            <div className="space-y-4">
                {/* Mode Toggle */}
                <div className="flex items-center justify-between bg-skin-tertiary p-2 rounded-lg">
                    <span className="text-sm font-medium text-skin-text">Modo Editor</span>
                    <button 
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${isEditMode ? 'bg-brand-500' : 'bg-gray-600'}`}
                    >
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isEditMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                </div>

                {/* Model Selector */}
                <div>
                    <label className="block text-xs font-bold text-skin-muted uppercase mb-1">Modelo de Imagem</label>
                    <select 
                        value={adminModel}
                        onChange={(e) => setAdminModel(e.target.value as ImageProvider)}
                        className="w-full bg-skin-base text-skin-text border border-skin-border rounded p-2 text-sm focus:border-brand-500 outline-none"
                    >
                        <option value="flux">Flux Realism (Pollinations)</option>
                        <option value="gemini">Gemini 2.5 (Google)</option>
                        <option value="pollinations">Pollinations Turbo (Rápido)</option>
                    </select>
                </div>

                <div className="pt-2 border-t border-skin-border">
                    <button 
                        onClick={handleRegenerateCover}
                        className="w-full bg-skin-base hover:bg-brand-600 hover:text-white text-skin-text border border-skin-border rounded py-2 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                        <RefreshCw size={14} /> Regenerar Capa Agora
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-skin-border z-[60]">
          <div className="h-full bg-brand-500 transition-all duration-300" style={{ width: `${scrollProgress}%` }}></div>
      </div>

      {/* Bookmark Toast */}
      {bookmarkRestored && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[55] bg-brand-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold animate-fade-in pointer-events-none opacity-80">
              <Bookmark size={16} fill="currentColor" /> {t('read.read_restored')}
          </div>
      )}

      {/* FLOATING ZOOM CONTROLS (Persistent) */}
      <div className={`fixed bottom-24 right-6 z-40 flex flex-col items-center gap-3 transition-all duration-500 ${focusMode ? 'translate-x-40 opacity-0' : 'translate-x-0 opacity-100'}`}>
          <button 
              onClick={() => setFontSize(s => Math.min(48, s + 2))}
              className="w-12 h-12 bg-skin-secondary/90 backdrop-blur-md rounded-full shadow-xl border border-skin-border flex items-center justify-center text-skin-text hover:text-brand-500 hover:border-brand-500 hover:scale-110 active:scale-95 transition-all"
              aria-label="Aumentar Texto"
              title="Aumentar Zoom"
          >
              <ZoomIn size={22} />
          </button>
          <div className="bg-skin-base/80 backdrop-blur px-2 py-1 rounded-md border border-skin-border text-[10px] font-mono font-bold text-skin-muted shadow-sm select-none">
              {fontSize}px
          </div>
          <button 
              onClick={() => setFontSize(s => Math.max(14, s - 2))}
              className="w-12 h-12 bg-skin-secondary/90 backdrop-blur-md rounded-full shadow-xl border border-skin-border flex items-center justify-center text-skin-text hover:text-brand-500 hover:border-brand-500 hover:scale-110 active:scale-95 transition-all"
              aria-label="Diminuir Texto"
              title="Diminuir Zoom"
          >
              <ZoomOut size={22} />
          </button>
      </div>

      {/* Reader Toolbar */}
      <div className={`fixed top-0 left-0 w-full h-16 bg-skin-secondary/95 backdrop-blur border-b border-skin-border flex justify-between items-center px-4 md:px-6 z-40 shadow-xl transition-all duration-500 ${focusMode ? '-translate-y-full hover:translate-y-0' : 'translate-y-0'}`}>
        <div className="flex items-center gap-4">
             <Link to="/" className="text-skin-muted hover:text-skin-text flex items-center gap-2 transition-colors">
                <ChevronLeft size={24} />
             </Link>
             
             <div className="flex flex-col">
                 <span className="text-skin-text font-bold text-sm truncate max-w-[150px] md:max-w-xs">{book.title}</span>
                 <span className="text-[10px] text-skin-muted uppercase tracking-widest">{book.author}</span>
             </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
           {/* Favorites */}
           {user && (
               <button onClick={() => toggleFavorite(book.id)} className={`transition-colors ${isFavorited ? 'text-red-500' : 'text-skin-muted hover:text-red-400'}`}>
                   <Heart size={20} fill={isFavorited ? "currentColor" : "none"} />
               </button>
           )}

           <div className="h-6 w-px bg-skin-border mx-1 hidden sm:block"></div>
           
           {/* SHARE BUTTON TOP */}
           <button onClick={handleShare} className="text-skin-muted hover:text-brand-500 transition-colors" title="Compartilhar">
               <Share2 size={20} />
           </button>

           {/* ADMIN TRIGGER BUTTON */}
           {isAdmin && (
               <>
                <div className="h-6 w-px bg-skin-border mx-1"></div>
                <button 
                    onClick={() => setShowAdminPanel(!showAdminPanel)} 
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full border transition-all ${showAdminPanel || isEditMode ? 'bg-brand-500 text-white border-brand-400' : 'bg-skin-tertiary text-skin-muted border-skin-border hover:text-skin-text'}`}
                    title="Painel do Administrador"
                >
                    <Wand2 size={16} />
                    <span className="text-xs font-bold hidden md:inline">Editor</span>
                </button>
               </>
           )}

           <div className="h-6 w-px bg-skin-border mx-1"></div>

           {/* Audio Control */}
           <button onClick={toggleAudio} className={`flex items-center gap-2 px-3 py-1 rounded-full border border-skin-border ${isSpeaking ? 'bg-brand-500 text-white animate-pulse' : 'bg-skin-tertiary hover:bg-skin-secondary'}`}>
               {isSpeaking ? <Pause size={16} /> : <Volume2 size={16} />}
               <span className="text-xs font-bold hidden md:inline">{isSpeaking ? 'Parar' : 'Ouvir'}</span>
           </button>

           {/* Font Family (Serif/Sans) */}
           <div className="hidden md:flex gap-1 bg-skin-tertiary rounded-lg p-1 border border-skin-border">
               <button onClick={() => setFontFamily('serif')} className={`p-1 rounded w-8 h-8 flex items-center justify-center transition-colors ${fontFamily === 'serif' ? 'bg-skin-secondary text-brand-500 shadow-sm' : 'text-skin-muted hover:text-skin-text'}`} title="Serifa"><span className="font-serif font-bold text-lg">T</span></button>
               <button onClick={() => setFontFamily('sans')} className={`p-1 rounded w-8 h-8 flex items-center justify-center transition-colors ${fontFamily === 'sans' ? 'bg-skin-secondary text-brand-500 shadow-sm' : 'text-skin-muted hover:text-skin-text'}`} title="Sem Serifa"><span className="font-sans font-bold text-lg">T</span></button>
           </div>
           
           <button onClick={() => setFocusMode(!focusMode)} className={`transition-colors ${focusMode ? 'text-brand-500' : 'text-skin-muted hover:text-skin-text'}`} title="Modo Foco">
              {focusMode ? <Eye size={20} /> : <EyeOff size={20} />}
           </button>
           
           <button onClick={() => setShowDetails(true)} className="text-skin-muted hover:text-brand-500 transition-colors">
               <Info size={20} />
           </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`transition-all duration-500 ${focusMode ? 'pt-8 pb-8' : 'pt-24 pb-20'} px-4 md:px-0`}>
         <div 
           ref={contentRef}
           className={`max-w-3xl mx-auto bg-skin-secondary rounded-lg shadow-2xl overflow-hidden min-h-[80vh] border border-skin-border transition-colors duration-500 ${focusMode ? 'shadow-none border-none bg-transparent' : ''}`}
         >
            {/* Book Cover / Intro */}
            {!focusMode && (
                <div className="relative h-[500px] w-full overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-skin-secondary via-transparent to-transparent z-10 transition-colors duration-500"></div>
                    {book.coverUrl && (
                    <>
                        <img src={book.coverUrl} className="w-full h-full object-cover opacity-30 blur-md absolute scale-110" />
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8">
                             <div className="relative shadow-2xl rounded-lg overflow-hidden transform transition-transform group-hover:scale-105 duration-700">
                                {regeneratingId === 'cover' && (
                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-30">
                                        <Wand2 className="text-brand-500 animate-spin mb-2" />
                                        <span className="text-white text-xs font-bold">Gerando...</span>
                                    </div>
                                )}
                                <img src={book.coverUrl} className="h-80 w-auto object-contain" />
                                
                                {/* ADMIN COVER EDIT OVERLAY */}
                                {isEditMode && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <button 
                                            onClick={handleRegenerateCover}
                                            className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 transform hover:scale-105 transition-all"
                                        >
                                            <RefreshCw size={16} /> Regenerar Capa
                                        </button>
                                    </div>
                                )}
                                
                                <div className="absolute inset-0 ring-1 ring-white/20 rounded-lg pointer-events-none"></div>
                             </div>
                             <div className="mt-8 text-center max-w-lg">
                                 {book.tags && (
                                     <div className="flex gap-2 justify-center mb-4">
                                         {book.tags.map(t => (
                                             <span key={t} className="px-2 py-0.5 bg-black/50 backdrop-blur text-white text-[10px] uppercase tracking-wider rounded border border-white/20">{t}</span>
                                         ))}
                                     </div>
                                 )}
                             </div>
                        </div>
                    </>
                    )}
                </div>
            )}

            <div className={`px-6 md:px-20 py-12 ${focusMode ? 'bg-skin-base' : ''}`}>
                <h1 className="text-4xl md:text-6xl font-serif font-bold text-center text-skin-text mb-6 leading-tight tracking-tight">{book.title}</h1>
                
                <div className="flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-widest text-brand-500 mb-12">
                     <span>{book.type}</span>
                     <span>•</span>
                     <span>{book.category || 'Geral'}</span>
                </div>

                <blockquote className="text-center text-lg md:text-xl text-skin-muted italic mb-16 border-y border-skin-border py-8 px-4 font-serif relative">
                    <span className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 text-6xl text-skin-border opacity-30">“</span>
                    {book.description}
                </blockquote>

                {/* Chapters */}
                <div className="space-y-24">
                   {book.chapters.map((chapter, idx) => (
                     <article key={chapter.id} className="animate-fade-in chapter-content">
                        <header className="mb-10 text-center">
                           <span className="block text-8xl font-serif text-brand-500/10 font-bold mb-[-40px] select-none">{idx + 1}</span>
                           <h2 className="relative text-3xl md:text-4xl font-serif font-bold text-brand-500 z-10">{chapter.title}</h2>
                        </header>
                        
                        {/* CHAPTER IMAGE LOGIC */}
                        {(chapter.imageUrl || isEditMode) && !focusMode && (
                           <figure className={`my-10 rounded-xl overflow-hidden shadow-xl border border-skin-border group relative bg-skin-tertiary ${isEditMode ? 'ring-2 ring-brand-500/50 cursor-pointer' : ''}`}>
                             {regeneratingId === chapter.id && (
                                 <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-30">
                                     <Wand2 className="text-brand-500 animate-spin mb-2" />
                                     <span className="text-white text-xs font-bold">Gerando...</span>
                                 </div>
                             )}
                             
                             {chapter.imageUrl ? (
                                 <img src={chapter.imageUrl} alt={chapter.title} className="w-full object-cover transform transition-transform duration-1000 group-hover:scale-105" />
                             ) : (
                                 <div className="w-full aspect-video flex flex-col items-center justify-center text-skin-muted">
                                     <ImageIcon size={32} className="mb-2 opacity-50" />
                                     <span className="text-xs">Sem imagem</span>
                                 </div>
                             )}

                             {/* ADMIN EDIT BUTTON */}
                             {isEditMode && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <button 
                                        onClick={() => handleRegenerateChapterImage(idx)}
                                        className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 transform hover:scale-105 transition-all"
                                    >
                                        <RefreshCw size={16} /> {chapter.imageUrl ? 'Regenerar Imagem' : 'Criar Imagem'}
                                    </button>
                                </div>
                             )}
                             
                             {chapter.imagePrompt && !isEditMode && <figcaption className="text-center text-[10px] text-skin-muted mt-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity">Prompt IA: {chapter.imagePrompt}</figcaption>}
                           </figure>
                        )}

                        <div 
                          className={`
                             prose prose-invert prose-lg max-w-none leading-relaxed text-skin-text ${getFontFamilyClass()}
                             prose-headings:font-serif prose-headings:text-brand-500
                             prose-blockquote:border-l-4 prose-blockquote:border-brand-500 prose-blockquote:bg-skin-tertiary/50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:italic
                             prose-strong:text-brand-400
                             prose-img:rounded-xl prose-img:shadow-lg
                          `}
                          style={{ fontSize: `${fontSize}px` }}
                          dangerouslySetInnerHTML={{ __html: chapter.content || '' }}
                        />
                        
                        <div className="flex justify-center mt-16">
                            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-skin-border to-transparent"></div>
                        </div>
                     </article>
                   ))}
                </div>

                <div className="mt-20 pt-10 border-t border-skin-border text-center text-skin-muted text-sm">
                   <BookOpen className="mx-auto mb-2 text-skin-border" />
                   <p className="mb-8">{t('read.end_of_book')}</p>
                   
                   {/* SOCIAL SHARE FOOTER */}
                   <div className="mb-10 bg-skin-tertiary p-6 rounded-xl border border-skin-border">
                        <h4 className="text-lg font-bold text-skin-text mb-4 flex items-center justify-center gap-2">
                            <Share2 size={20} className="text-brand-500" /> {t('read.share_title')}
                        </h4>
                        <div className="flex flex-wrap justify-center gap-4">
                            <button onClick={() => openSocial('whatsapp')} className="p-3 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors flex items-center gap-2">
                                <MessageCircle size={18} /> <span className="hidden sm:inline">WhatsApp</span>
                            </button>
                            <button onClick={() => openSocial('facebook')} className="p-3 bg-blue-700 hover:bg-blue-600 text-white rounded-lg transition-colors">
                                <Facebook size={18} />
                            </button>
                            <button onClick={() => openSocial('twitter')} className="p-3 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors border border-gray-700">
                                <Twitter size={18} />
                            </button>
                            <button onClick={() => openSocial('linkedin')} className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
                                <Linkedin size={18} />
                            </button>
                            <button onClick={handleCopyLink} className="p-3 bg-skin-base hover:bg-skin-border text-skin-text rounded-lg transition-colors border border-skin-border">
                                <LinkIcon size={18} />
                            </button>
                        </div>
                   </div>

                   <div className="flex justify-center gap-4 opacity-70 hover:opacity-100 transition-opacity">
                       <button onClick={handleJsonDownload} className="text-xs hover:text-brand-500 flex items-center gap-1"><Download size={12}/> {t('read.backup_json')}</button>
                       <button onClick={handleDownload} className="text-xs hover:text-brand-500 flex items-center gap-1"><Download size={12}/> {t('read.download_html')}</button>
                   </div>
                </div>
            </div>
         </div>
      </div>

      {/* SHARE MODAL (Fallback) */}
      {showShareModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowShareModal(false)}>
              <div className="bg-skin-secondary p-6 rounded-2xl shadow-2xl max-w-sm w-full border border-skin-border text-center" onClick={e => e.stopPropagation()}>
                   <h2 className="text-xl font-serif font-bold text-skin-text mb-6">{t('read.share_modal_title')}</h2>
                   <div className="grid grid-cols-2 gap-4 mb-6">
                        <button onClick={() => openSocial('whatsapp')} className="flex flex-col items-center gap-2 p-4 bg-skin-tertiary rounded-lg hover:bg-skin-base border border-skin-border">
                            <MessageCircle size={24} className="text-green-500" /> <span className="text-xs text-skin-text">WhatsApp</span>
                        </button>
                        <button onClick={() => openSocial('facebook')} className="flex flex-col items-center gap-2 p-4 bg-skin-tertiary rounded-lg hover:bg-skin-base border border-skin-border">
                            <Facebook size={24} className="text-blue-600" /> <span className="text-xs text-skin-text">Facebook</span>
                        </button>
                        <button onClick={() => openSocial('twitter')} className="flex flex-col items-center gap-2 p-4 bg-skin-tertiary rounded-lg hover:bg-skin-base border border-skin-border">
                            <Twitter size={24} className="text-white" /> <span className="text-xs text-skin-text">X (Twitter)</span>
                        </button>
                        <button onClick={() => openSocial('linkedin')} className="flex flex-col items-center gap-2 p-4 bg-skin-tertiary rounded-lg hover:bg-skin-base border border-skin-border">
                            <Linkedin size={24} className="text-blue-500" /> <span className="text-xs text-skin-text">LinkedIn</span>
                        </button>
                   </div>
                   <button onClick={handleCopyLink} className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold mb-3 flex items-center justify-center gap-2">
                       <LinkIcon size={18} /> {t('read.copy_link')}
                   </button>
                   <button onClick={() => setShowShareModal(false)} className="text-sm text-skin-muted hover:text-skin-text">
                       {t('read.cancel')}
                   </button>
              </div>
          </div>
      )}

      {/* Details Modal */}
      {showDetails && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowDetails(false)}>
              <div className="bg-skin-secondary p-8 rounded-2xl shadow-2xl max-w-md w-full border border-skin-border relative" onClick={e => e.stopPropagation()}>
                   <h2 className="text-2xl font-serif font-bold text-skin-text mb-6">{t('read.tech_sheet')}</h2>
                   
                   <div className="space-y-4 text-sm">
                       <div className="flex justify-between border-b border-skin-border pb-2">
                           <span className="text-skin-muted">{t('read.author')}</span>
                           <span className="font-bold text-skin-text">{book.author}</span>
                       </div>
                       <div className="flex justify-between border-b border-skin-border pb-2">
                           <span className="text-skin-muted">{t('read.format')}</span>
                           <span className="font-bold text-skin-text uppercase">{book.type}</span>
                       </div>
                       <div className="flex justify-between border-b border-skin-border pb-2">
                           <span className="text-skin-muted">{t('read.category')}</span>
                           <span className="font-bold text-brand-500">{book.category || 'Não classificado'}</span>
                       </div>
                       <div className="flex justify-between border-b border-skin-border pb-2">
                           <span className="text-skin-muted">{t('read.chapters')}</span>
                           <span className="font-bold text-skin-text">{book.chapters.length}</span>
                       </div>
                       <div className="flex justify-between border-b border-skin-border pb-2">
                           <span className="text-skin-muted">{t('read.published')}</span>
                           <span className="font-bold text-skin-text">{new Date(book.createdAt).toLocaleDateString()}</span>
                       </div>
                   </div>

                   {book.tags && (
                       <div className="mt-6">
                           <h4 className="text-xs font-bold text-skin-muted uppercase mb-2 flex items-center gap-1"><Tag size={12}/> {t('read.tags')}</h4>
                           <div className="flex flex-wrap gap-2">
                               {book.tags.map(t => (
                                   <span key={t} className="px-2 py-1 bg-skin-tertiary rounded border border-skin-border text-xs text-skin-text">{t}</span>
                               ))}
                           </div>
                       </div>
                   )}
                   
                   <button onClick={() => setShowDetails(false)} className="mt-8 w-full bg-skin-tertiary hover:bg-skin-base text-skin-text py-3 rounded-lg font-bold border border-skin-border transition-colors">
                       {t('read.close')}
                   </button>
              </div>
          </div>
      )}

    </div>
  );
};

export default ReadBook;
