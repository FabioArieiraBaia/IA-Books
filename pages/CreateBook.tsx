
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBook } from '../context/BookContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Book, BookSize, AgentStatus, Chapter } from '../types';
import { generateBookPlan, generateCoverPrompt, getPollinationsUrl, writeChapterContent, generateChapterImagePrompt, generateBookMetadata, generateHybridCover, generateImageByProvider, ImageProvider } from '../services/geminiService';
import AgentDisplay from '../components/AgentDisplay';
import { Sparkles, Loader2, BookType, Type, MonitorPlay, Key, CheckCircle, AlertTriangle, RefreshCw, Eye, UploadCloud, Image as ImageIcon, Globe, Settings, Wand2 } from 'lucide-react';

const LANGUAGES = [
    { id: 'pt', lang: 'PT', country: 'BR' },
    { id: 'en', lang: 'EN', country: 'US' },
    { id: 'es', lang: 'ES', country: 'ES' },
    { id: 'fr', lang: 'FR', country: 'FR' },
    { id: 'de', lang: 'DE', country: 'DE' },
    { id: 'it', lang: 'IT', country: 'IT' },
    { id: 'ja', lang: 'JA', country: 'JP' },
    { id: 'ko', lang: 'KO', country: 'KR' },
    { id: 'zh', lang: 'ZH', country: 'CN' },
    { id: 'ru', lang: 'RU', country: 'RU' },
    { id: 'hi', lang: 'HI', country: 'IN' },
    { id: 'ar', lang: 'AR', country: 'SA' },
    { id: 'nl', lang: 'NL', country: 'NL' },
    { id: 'pl', lang: 'PL', country: 'PL' },
    { id: 'tr', lang: 'TR', country: 'TR' },
    { id: 'sv', lang: 'SV', country: 'SE' },
];

const CreateBook: React.FC = () => {
  const navigate = useNavigate();
  const { saveLocalBook, publishToLibrary } = useBook();
  const { user } = useAuth();
  const { language, t } = useLanguage();

  // Form State
  const [topic, setTopic] = useState('');
  const [extraContext, setExtraContext] = useState('');
  const [size, setSize] = useState<BookSize>('ebook');
  const [targetLanguage, setTargetLanguage] = useState<string>('pt');
  
  // Image Config State
  const [selectedImageModel, setSelectedImageModel] = useState<ImageProvider>('flux');
  
  // Workflow State
  const [step, setStep] = useState<'input' | 'generating' | 'review'>('input');
  const [currentBook, setCurrentBook] = useState<Book | null>(null);

  // Agent State
  const [agents, setAgents] = useState<AgentStatus[]>([
    { name: 'Arquiteto', role: 'planner', status: 'idle', message: '...' },
    { name: 'Catalogador', role: 'metadata', status: 'idle', message: '...' },
    { name: 'Dir. de Arte', role: 'art_director', status: 'idle', message: '...' },
    { name: 'Escritor', role: 'writer', status: 'idle', message: '...' },
    { name: 'Revisor', role: 'reviewer', status: 'idle', message: '...' },
  ]);

  const updateAgent = (role: AgentStatus['role'], status: AgentStatus['status'], message: string) => {
    setAgents(prev => prev.map(a => a.role === role ? { ...a, status, message } : a));
  };

  // ----------------------------------------------------
  // PHASE 1: GENERATE STRUCTURE & INITIAL ASSETS
  // ----------------------------------------------------
  const handleStartGeneration = async () => {
    if (!topic) return;
    const apiKey = localStorage.getItem('iabooks_api_key');
    if (!apiKey) {
        alert(t('studio.alert_api_missing'));
        return;
    }

    setStep('generating');
    const bookId = crypto.randomUUID();
    const authorName = user ? user.name : 'Autor da Comunidade';

    try {
      // 1. PLANNING
      updateAgent('planner', 'working', t('studio.status.planner'));
      // Use targetLanguage instead of UI language
      const plan = await generateBookPlan(topic, size, extraContext, targetLanguage);
      
      const newBook: Book = {
        id: bookId,
        title: plan.title,
        description: plan.description,
        topic,
        type: size,
        author: authorName,
        chapters: plan.chapters.map((c: any) => ({ ...c, id: crypto.randomUUID() })),
        status: 'generating_assets',
        createdAt: Date.now(),
        progress: 10,
        isPublic: false,
        authorId: user?.email,
        language: targetLanguage
      };
      
      await saveLocalBook(newBook);
      setCurrentBook(newBook);
      updateAgent('planner', 'finished', 'Estrutura concluída.');

      // 2. METADATA
      updateAgent('metadata', 'working', t('studio.status.metadata'));
      const meta = await generateBookMetadata(newBook.title, newBook.description, targetLanguage);
      newBook.tags = meta.tags;
      newBook.category = meta.category;
      await saveLocalBook(newBook);
      updateAgent('metadata', 'finished', `Catalogado: ${meta.category}.`);

      // 3. COVER (HYBRID GOOGLE/POLLINATIONS)
      updateAgent('art_director', 'working', t('studio.status.art'));
      const coverPrompt = await generateCoverPrompt(newBook.title, newBook.description, size);
      newBook.coverImagePrompt = coverPrompt;
      newBook.coverUrl = await generateHybridCover(coverPrompt); // Automatic fallback logic first time
      await saveLocalBook(newBook);
      updateAgent('art_director', 'finished', 'Capa gerada.');

      // 4. GENERATE CHAPTERS (Initial Pass)
      await generateAllChapters(newBook);

    } catch (error: any) {
      console.error(error);
      if (error.message === 'API_KEY_MISSING') {
          alert("Erro: Chave API ausente.");
          setStep('input');
      } else {
          alert("Ocorreu um erro ao gerar. Verifique sua conexão ou tente simplificar o tema.");
          setStep('input');
      }
    }
  };

  const generateAllChapters = async (book: Book) => {
      updateAgent('planner', 'finished', t('studio.status.writer'));
      
      const totalChapters = book.chapters.length;
      let completed = 0;

      for (let i = 0; i < totalChapters; i++) {
        const chapter = book.chapters[i];
        
        // Write Content
        if (!chapter.content || chapter.content === "ERROR_GENERATING_CONTENT") {
            updateAgent('writer', 'working', `Cap. ${i + 1}: ${chapter.title}`);
            // Use the book's saved language preference
            const content = await writeChapterContent(book.title, chapter.title, chapter.summary, size, book.language || 'pt');
            
            if (content === "ERROR_GENERATING_CONTENT") {
                chapter.content = "<p class='text-red-500'>[Erro ao gerar conteúdo. Tente regenerar na revisão.]</p>";
                chapter.hasError = true;
                updateAgent('writer', 'error', `Falha no Cap. ${i + 1}`);
            } else {
                chapter.content = content;
                chapter.hasError = false;
            }
        }

        // Generate Image (Always Pollinations Flux for Chapters for speed/consistency initially)
        if (size !== 'apostila' && !chapter.imageUrl) {
             const chapImgPrompt = await generateChapterImagePrompt(chapter.title, chapter.content || "");
             chapter.imagePrompt = chapImgPrompt;
             chapter.imageUrl = getPollinationsUrl(chapImgPrompt, 800, 400, 'flux');
        }

        // Review
        updateAgent('reviewer', 'working', t('studio.status.reviewer'));
        await new Promise(r => setTimeout(r, 300));
        
        // Update Local State
        completed++;
        book.progress = 20 + ((completed / totalChapters) * 80);
        await saveLocalBook({ ...book });
      }

      updateAgent('writer', 'finished', t('studio.status.finished'));
      updateAgent('reviewer', 'finished', t('studio.status.finished'));
      
      book.status = 'review';
      setCurrentBook({ ...book });
      setStep('review');
  };

  // ----------------------------------------------------
  // PHASE 2: REVIEW & REGENERATE
  // ----------------------------------------------------
  
  const handleRegenerateCover = async () => {
      if (!currentBook) return;
      const confirm = window.confirm(t('studio.confirm_regenerate_cover'));
      if (!confirm) return;

      try {
          // 1. Generate new prompt (Text)
          const newPrompt = await generateCoverPrompt(currentBook.title, currentBook.description, size);
          
          // 2. Generate Image using selected model
          const newUrl = await generateImageByProvider(newPrompt, selectedImageModel, 800, 1200); 
          
          const updated = { ...currentBook, coverImagePrompt: newPrompt, coverUrl: newUrl };
          setCurrentBook(updated);
          await saveLocalBook(updated);
      } catch (e: any) {
          alert("Erro ao regenerar capa: " + e.message);
      }
  };

  const handleRegenerateChapterContent = async (chapterIndex: number) => {
      if (!currentBook) return;
      const chapter = currentBook.chapters[chapterIndex];
      
      // UI Indication
      const originalContent = chapter.content;
      chapter.content = t('studio.regenerating');
      setCurrentBook({ ...currentBook });

      // Use book.language
      const newContent = await writeChapterContent(currentBook.title, chapter.title, chapter.summary, size, currentBook.language || 'pt');
      
      if (newContent !== "ERROR_GENERATING_CONTENT") {
          chapter.content = newContent;
          chapter.hasError = false;
      } else {
          chapter.content = originalContent; // Revert or show error
          alert(t('studio.error_regenerate'));
      }
      setCurrentBook({ ...currentBook });
      await saveLocalBook({ ...currentBook });
  };

  const handleRegenerateChapterImage = async (chapterIndex: number) => {
      if (!currentBook) return;
      const chapter = currentBook.chapters[chapterIndex];
      
      // Temporary placeholder to show something is happening
      const oldUrl = chapter.imageUrl;
      chapter.imageUrl = ""; // Clear to show loading
      setCurrentBook({ ...currentBook });

      try {
        const newPrompt = await generateChapterImagePrompt(chapter.title, chapter.content || "");
        chapter.imagePrompt = newPrompt;
        
        // Use selected model
        chapter.imageUrl = await generateImageByProvider(newPrompt, selectedImageModel, 800, 400);
        
        setCurrentBook({ ...currentBook });
        await saveLocalBook({ ...currentBook });
      } catch (e: any) {
          alert("Erro ao gerar imagem: " + e.message);
          chapter.imageUrl = oldUrl; // Revert
          setCurrentBook({ ...currentBook });
      }
  };

  // ----------------------------------------------------
  // PHASE 3: PUBLISH
  // ----------------------------------------------------
  const handleFinalPublish = async () => {
      if (!currentBook) return;
      
      const confirm = window.confirm(t('studio.confirm_publish'));
      if (!confirm) return;

      setStep('generating'); // Show loading again
      updateAgent('planner', 'working', t('studio.sending_server'));
      
      try {
          await publishToLibrary(currentBook);
          navigate(`/read/${currentBook.id}`);
      } catch (e) {
          alert(t('studio.error_publish'));
          setStep('review');
      }
  };

  // RENDER: GENERATING LOADING SCREEN
  if (step === 'generating') {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 bg-skin-base transition-colors duration-500">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
             <div className="inline-block px-3 py-1 rounded-full bg-brand-500/10 text-brand-500 text-xs font-bold tracking-widest uppercase mb-4 border border-brand-500/20">
              Studio Live
            </div>
            <h2 className="text-4xl font-serif font-bold text-skin-text mb-4">{t('studio.producing_title')}</h2>
            <p className="text-skin-muted">{t('studio.producing_desc')} "{topic}".</p>
          </div>

          <AgentDisplay agents={agents} />

          <div className="bg-skin-secondary p-8 rounded-2xl shadow-xl border border-skin-border text-center mt-8 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50"></div>
              <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
              <p className="text-skin-muted">{t('studio.wait_message')}</p>
          </div>
        </div>
      </div>
    );
  }

  // RENDER: REVIEW DASHBOARD
  if (step === 'review' && currentBook) {
      return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-skin-base transition-colors duration-500">
            <div className="max-w-5xl mx-auto animate-fade-in">
                
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-skin-text">{t('studio.review_title')}</h1>
                        <p className="text-skin-muted">{t('studio.review_desc')}</p>
                    </div>
                    <button 
                        onClick={handleFinalPublish}
                        className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-bold text-lg flex items-center gap-2 shadow-lg hover:shadow-green-500/20 transition-all"
                    >
                        <UploadCloud size={24} /> {t('studio.publish_btn')}
                    </button>
                </div>

                {/* IMAGE CONFIGURATION PANEL */}
                <div className="bg-skin-secondary p-4 rounded-xl border border-skin-border shadow-sm mb-8 flex items-center gap-4 animate-slide-up">
                    <div className="p-2 bg-skin-tertiary rounded-lg border border-skin-border">
                        <Wand2 size={20} className="text-brand-500" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-skin-text">Configuração de Imagem</h4>
                        <p className="text-xs text-skin-muted">Escolha qual IA será usada para regenerar a capa e ilustrações.</p>
                    </div>
                    <select 
                        value={selectedImageModel}
                        onChange={(e) => setSelectedImageModel(e.target.value as any)}
                        className="bg-skin-base border border-skin-border text-skin-text rounded-lg px-4 py-2 text-sm focus:border-brand-500 outline-none"
                    >
                        <option value="flux">Flux Realism (Pollinations)</option>
                        <option value="gemini">Gemini 2.5 (Google)</option>
                        <option value="pollinations">Pollinations Turbo (Rápido)</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT: COVER & META */}
                    <div className="space-y-6">
                        <div className="bg-skin-secondary p-6 rounded-xl border border-skin-border shadow-lg sticky top-24">
                            <h3 className="font-bold text-skin-text mb-4">{t('studio.cover_title')}</h3>
                            <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-skin-tertiary mb-4 group">
                                <img src={currentBook.coverUrl} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <button onClick={handleRegenerateCover} className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                                        <RefreshCw size={14} /> {t('studio.regenerate')}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-brand-500 uppercase">Título</label>
                                <p className="text-skin-text font-serif font-bold text-xl leading-tight">{currentBook.title}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-skin-border">
                                <p className="text-xs text-skin-muted">{currentBook.chapters.length} Capítulos Gerados</p>
                                <p className="text-xs text-skin-muted uppercase mt-1">Idioma: {currentBook.language}</p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: CHAPTERS */}
                    <div className="lg:col-span-2 space-y-6">
                         <div className="bg-skin-secondary p-6 rounded-xl border border-skin-border shadow-lg">
                            <h3 className="font-bold text-skin-text mb-4">{t('studio.chapters_images')}</h3>
                            <div className="space-y-6">
                                {currentBook.chapters.map((chapter, idx) => (
                                    <div key={chapter.id} className={`p-4 rounded-lg border ${chapter.hasError ? 'border-red-500/50 bg-red-500/5' : 'border-skin-border bg-skin-tertiary'}`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="font-bold text-skin-text text-lg">
                                                <span className="text-brand-500 mr-2">#{idx + 1}</span> 
                                                {chapter.title}
                                            </h4>
                                            {chapter.hasError && <AlertTriangle size={16} className="text-red-500" />}
                                        </div>
                                        
                                        {/* IMAGE PREVIEW */}
                                        {chapter.imageUrl && (
                                            <div className="relative w-full aspect-video bg-skin-base rounded-lg overflow-hidden border border-skin-border mb-4 group">
                                                <img 
                                                    src={chapter.imageUrl} 
                                                    alt={`Ilustração Cap ${idx + 1}`}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                     <p className="text-white text-xs px-4 text-center max-w-xs">{chapter.imagePrompt}</p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-skin-border/50">
                                            <button 
                                                onClick={() => handleRegenerateChapterContent(idx)}
                                                className="text-xs flex items-center gap-1 px-3 py-2 rounded bg-skin-base border border-skin-border hover:border-brand-500 hover:text-brand-500 transition-colors"
                                            >
                                                <RefreshCw size={12} /> {chapter.hasError ? t('read.retry') : t('read.regenerate_text')}
                                            </button>
                                            
                                            {size !== 'apostila' && (
                                                <button 
                                                    onClick={() => handleRegenerateChapterImage(idx)}
                                                    className="text-xs flex items-center gap-1 px-3 py-2 rounded bg-skin-base border border-skin-border hover:border-brand-500 hover:text-brand-500 transition-colors"
                                                >
                                                    <ImageIcon size={12} /> {t('read.regenerate_image')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
      );
  }

  // RENDER: INPUT FORM
  return (
    <div className="min-h-screen bg-skin-base pt-28 pb-12 px-4 flex items-center justify-center relative overflow-hidden transition-colors duration-500">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-3xl w-full relative z-10">
        <div className="mb-10 text-center animate-slide-up">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MonitorPlay className="text-brand-500" size={24} />
            <span className="text-brand-500 font-bold tracking-widest uppercase text-sm">iabooks Studio</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-skin-text mb-6 drop-shadow-xl">
             {t('studio.title')}
          </h1>
          <p className="text-skin-muted text-lg max-w-2xl mx-auto">
            {t('studio.subtitle')}
          </p>
        </div>

        <div className="bg-skin-secondary/80 backdrop-blur-xl p-8 md:p-12 rounded-2xl shadow-2xl border border-skin-border animate-slide-up">
          <div className="space-y-8">
            
            {/* TOPIC */}
            <div className="group">
              <label className="block text-sm font-bold text-brand-500 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <Type size={16} /> {t('studio.label_topic')}
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t('studio.placeholder_topic')}
                className="w-full px-6 py-4 rounded-xl bg-skin-tertiary border border-skin-border text-skin-text placeholder-skin-muted focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all text-lg shadow-inner focus:bg-skin-base"
              />
            </div>

            {/* SIZE SELECTOR */}
            <div>
              <label className="block text-sm font-bold text-brand-500 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <BookType size={16} /> {t('studio.label_type')}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { id: 'apostila', title: t('studio.types.apostila.title'), desc: t('studio.types.apostila.desc') },
                    { id: 'ebook', title: t('studio.types.ebook.title'), desc: t('studio.types.ebook.desc') },
                    { id: 'livro', title: t('studio.types.livro.title'), desc: t('studio.types.livro.desc') }
                ].map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => setSize(opt.id as BookSize)}
                        className={`p-4 rounded-xl border text-left transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg ${size === opt.id ? 'border-brand-500 bg-brand-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)]' : 'border-skin-border bg-skin-tertiary hover:border-skin-muted'}`}
                    >
                        <div className={`absolute top-0 right-0 p-2 opacity-0 transition-opacity ${size === opt.id ? 'opacity-100' : ''}`}>
                            <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(245,158,11,1)]"></div>
                        </div>
                        <span className={`block font-bold mb-1 text-lg ${size === opt.id ? 'text-brand-500' : 'text-skin-text'}`}>{opt.title}</span>
                        <span className="text-xs text-skin-muted group-hover:text-skin-text">{opt.desc}</span>
                    </button>
                ))}
              </div>
            </div>

            {/* LANGUAGE SELECTOR */}
            <div>
              <label className="block text-sm font-bold text-brand-500 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <Globe size={16} /> Idioma da Obra
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                  {LANGUAGES.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => setTargetLanguage(lang.id)}
                        className={`
                            flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200 group relative overflow-hidden
                            ${targetLanguage === lang.id 
                                ? 'border-brand-500 bg-brand-500/10 text-brand-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                                : 'border-skin-border bg-skin-tertiary text-skin-muted hover:border-skin-text hover:text-skin-text'
                            }
                        `}
                      >
                          <img 
                            src={`https://flagcdn.com/w80/${lang.country.toLowerCase()}.png`} 
                            alt={lang.country}
                            className="w-8 h-auto mb-2 rounded-sm shadow-md object-cover transform group-hover:scale-110 transition-transform"
                            loading="lazy"
                          />
                          <div className="flex flex-col items-center leading-none">
                              <span className="text-[10px] font-bold opacity-60 mb-0.5">{lang.country}</span>
                              <span className="text-xs font-black tracking-wider">{lang.lang}</span>
                          </div>
                      </button>
                  ))}
              </div>
            </div>

            {/* EXTRA CONTEXT */}
            <div>
              <label className="block text-sm font-bold text-brand-500 mb-3 uppercase tracking-wider">
                {t('studio.label_context')}
              </label>
              <textarea
                value={extraContext}
                onChange={(e) => setExtraContext(e.target.value)}
                placeholder={t('studio.placeholder_context')}
                className="w-full px-6 py-4 rounded-xl bg-skin-tertiary border border-skin-border text-skin-text placeholder-skin-muted focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all h-28 resize-none shadow-inner focus:bg-skin-base"
              />
            </div>

            <button
              onClick={handleStartGeneration}
              disabled={!topic}
              className={`w-full py-5 rounded-xl font-bold text-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] ${!topic ? 'bg-skin-tertiary text-skin-muted cursor-not-allowed' : 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-xl shadow-brand-900/30'}`}
            >
              <Sparkles className="w-6 h-6" />
              {t('studio.btn_generate')}
            </button>
            
            {!localStorage.getItem('iabooks_api_key') && (
                 <div className="text-center text-xs text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                    <Key size={12} className="inline mr-1" />
                    {t('studio.no_key_warning')}
                 </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBook;
