import React, { useState } from 'react';
import { StepWizard } from './components/StepWizard';
import { OutlineEditor } from './components/OutlineEditor';
import { GeneratorView } from './components/GeneratorView';
import { BookPreview } from './components/BookPreview';
import { IntroAnimation } from './components/IntroAnimation';
import { AppStep, Book, BookConfig, Chapter, GenerationStatus, Language } from './types';
import { generateBookOutline, generateSectionContent, generateSectionImage } from './services/geminiService';
import { Book as BookIcon, Globe } from 'lucide-react';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [language, setLanguage] = useState<Language>('pt-BR');
  const [step, setStep] = useState<AppStep>(AppStep.ONBOARDING);
  const [loading, setLoading] = useState(false);
  const [book, setBook] = useState<Book | null>(null);
  
  const [status, setStatus] = useState<GenerationStatus>({
    currentChapterTitle: null,
    currentSectionTitle: null,
    activity: 'thinking',
    logs: [],
    progress: 0
  });

  const addLog = (message: string) => {
    setStatus(prev => ({
        ...prev,
        logs: [...prev.logs, message]
    }));
  };

  // Step 1: Config & Outline
  const handleConfigComplete = async (config: BookConfig) => {
    setLoading(true);
    try {
      const outline = await generateBookOutline(config);
      setBook({
        title: outline.title,
        subtitle: outline.subtitle,
        config: config,
        chapters: outline.chapters,
        isComplete: false
      });
      setStep(AppStep.OUTLINE);
    } catch (error) {
      console.error(error);
      alert('Failed to generate outline. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Start Granular Generation
  const handleOutlineConfirm = async (chapters: Chapter[]) => {
    if (!book) return;
    
    const updatedBook = { ...book, chapters };
    setBook(updatedBook);
    setStep(AppStep.GENERATION);
    
    await generateFullBookGranular(updatedBook);
  };

  // Step 3: Granular Generation Logic
  const generateFullBookGranular = async (currentBook: Book) => {
    const totalSections = currentBook.chapters.reduce((acc, ch) => acc + ch.sections.length, 0);
    const totalOps = totalSections * 2;
    let completedOps = 0;

    const newBook = JSON.parse(JSON.stringify(currentBook)) as Book; // Deep copy

    addLog("> Initializing IA Books Core...");
    addLog(`> Targeted Structure: ${newBook.chapters.length} Chapters, ${totalSections} Sections.`);

    for (let cIdx = 0; cIdx < newBook.chapters.length; cIdx++) {
      const chapter = newBook.chapters[cIdx];
      addLog(`> Processing Chapter ${cIdx + 1}: ${chapter.title}`);

      for (let sIdx = 0; sIdx < chapter.sections.length; sIdx++) {
        const section = chapter.sections[sIdx];
        
        setStatus(prev => ({
            ...prev,
            currentChapterTitle: chapter.title,
            currentSectionTitle: section.title,
            activity: 'drafting',
            progress: (completedOps / totalOps) * 100
        }));

        // 1. Generate Text
        addLog(`  > Drafting section: "${section.title}"...`);
        const content = await generateSectionContent(section, chapter, newBook.title, newBook.config);
        newBook.chapters[cIdx].sections[sIdx].content = content;
        setBook({ ...newBook }); 
        
        completedOps++;
        
        // 2. Generate Image
        setStatus(prev => ({ ...prev, activity: 'painting', progress: (completedOps / totalOps) * 100 }));
        addLog(`  > Rendering illustration: ${section.visualConcept.substring(0, 30)}...`);
        const imageUrl = await generateSectionImage(section);
        
        if (imageUrl) {
            newBook.chapters[cIdx].sections[sIdx].imageUrl = imageUrl;
            addLog(`  > Image rendered successfully.`);
        } else {
            addLog(`  ! Image generation skipped/failed.`);
        }
        setBook({ ...newBook });

        completedOps++;
        await new Promise(r => setTimeout(r, 500));
      }
    }

    addLog("> Compilation finished.");
    addLog("> Finalizing formatting...");
    
    setStatus(prev => ({ ...prev, activity: 'finished', progress: 100 }));
    
    setTimeout(() => {
        setBook({ ...newBook, isComplete: true });
        setStep(AppStep.PREVIEW);
    }, 2000);
  };

  const handleReset = () => {
    setStep(AppStep.ONBOARDING);
    setBook(null);
    setStatus({ 
        currentChapterTitle: null, 
        currentSectionTitle: null, 
        activity: 'thinking', 
        logs: [], 
        progress: 0 
    });
  };

  if (showIntro) {
    return <IntroAnimation onComplete={() => setShowIntro(false)} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 overflow-hidden font-sans">
      {/* Navbar - Only on Onboarding/Outline */}
      {(step === AppStep.ONBOARDING || step === AppStep.OUTLINE) && (
        <nav className="h-16 bg-white border-b border-gray-200 flex items-center px-8 justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-indigo-900">
            <BookIcon size={24} strokeWidth={2.5} />
            <span className="font-serif font-black text-xl tracking-tight">IA BOOKS</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-200 transition-colors"
                 onClick={() => setLanguage(l => l === 'pt-BR' ? 'en-US' : 'pt-BR')}>
                <Globe size={14} className="text-gray-500" />
                <span className="text-xs font-bold text-gray-600 uppercase">{language === 'pt-BR' ? 'PT' : 'EN'}</span>
            </div>
            <div className="text-[10px] font-bold tracking-widest text-indigo-500 uppercase">
               Powered by Fábio Arieira
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {step === AppStep.ONBOARDING && (
          <div className="h-full flex items-center justify-center bg-[#f8fafc]">
            <StepWizard onComplete={handleConfigComplete} isLoading={loading} language={language} />
          </div>
        )}

        {step === AppStep.OUTLINE && book && (
          <OutlineEditor 
            initialBook={book} 
            onConfirm={handleOutlineConfirm} 
            onCancel={() => setStep(AppStep.ONBOARDING)}
            language={language}
          />
        )}

        {step === AppStep.GENERATION && book && (
          <GeneratorView book={book} status={status} language={language} />
        )}

        {step === AppStep.PREVIEW && book && (
          <BookPreview book={book} onReset={handleReset} />
        )}
      </main>
    </div>
  );
}