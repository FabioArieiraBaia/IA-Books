import React, { useEffect, useState } from 'react';
import { dbService } from '../services/dbService';
import { Book } from '../types';
import { ArrowLeft, Heart, Share2 } from 'lucide-react';

interface ReaderProps {
    bookId: string;
    onBack: () => void;
}

export const Reader: React.FC<ReaderProps> = ({ bookId, onBack }) => {
    const [book, setBook] = useState<Book | null>(null);
    const [likes, setLikes] = useState(0);

    useEffect(() => {
        const load = async () => {
            const data = await dbService.getBookById(bookId);
            if (data) {
                setBook(data);
                setLikes(data.likes || 0);
            }
        };
        load();
    }, [bookId]);

    const handleLike = async () => {
        if (!book) return;
        const res = await dbService.likeBook(bookId);
        if (res && res.success) {
            setLikes(res.likes);
        }
    };

    if (!book) return <div className="h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-indigo-600 rounded-full border-t-transparent"></div></div>;

    return (
        <div className="h-screen flex flex-col bg-[#fdfbf7] font-serif text-slate-800 overflow-hidden">
             {/* Navbar */}
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-20 flex-shrink-0 font-sans">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="font-bold text-gray-800 truncate max-w-xs md:max-w-md text-sm md:text-base">{book.title}</h1>
                        <p className="text-xs text-gray-500">por {book.config.authorName}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                     <button onClick={handleLike} className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-600 hover:bg-pink-100 rounded-full font-bold transition-all">
                        <Heart size={18} className={likes > (book.likes || 0) ? "fill-current" : ""} /> {likes}
                    </button>
                </div>
            </header>

            {/* Reading Area */}
            <div className="flex-1 overflow-y-auto scroll-smooth">
                <div className="max-w-3xl mx-auto bg-white shadow-lg min-h-screen my-8 md:my-12 px-8 py-16 md:p-24">
                    {/* Title Page */}
                    <div className="text-center mb-32 border-b-2 border-slate-100 pb-16">
                        <h1 className="text-5xl md:text-6xl font-black mb-6 text-slate-900 leading-tight">{book.title}</h1>
                        <p className="text-2xl text-slate-500 font-light italic mb-8">{book.subtitle}</p>
                        <div className="w-16 h-1 bg-indigo-900 mx-auto my-8"></div>
                        <p className="text-sm font-sans uppercase tracking-widest text-slate-400">Escrito por</p>
                        <p className="text-lg font-bold mt-2">{book.config.authorName}</p>
                    </div>

                    {/* Content */}
                    <div className="space-y-24">
                        {book.chapters.map((chapter, i) => (
                            <section key={chapter.id}>
                                <div className="mb-12">
                                    <span className="font-sans text-xs font-bold text-slate-300 uppercase tracking-widest block mb-4">Capítulo {i + 1}</span>
                                    <h2 className="text-4xl font-bold text-slate-900 mb-6">{chapter.title}</h2>
                                </div>
                                
                                <div className="space-y-16">
                                    {chapter.sections.map((section, sIdx) => (
                                        <div key={sIdx}>
                                            <h3 className="font-sans text-xl font-bold text-slate-700 mb-6 flex items-center gap-3">
                                                {section.title}
                                            </h3>
                                            
                                            {section.imageUrl && (
                                                <figure className="mb-8">
                                                    <img src={section.imageUrl} alt={section.title} className="w-full rounded-lg shadow-md" />
                                                </figure>
                                            )}

                                            <div 
                                                className="prose prose-lg prose-slate max-w-none text-justify leading-loose text-slate-700 font-serif"
                                                dangerouslySetInnerHTML={{ __html: section.content || '' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="my-16 flex justify-center text-slate-300">***</div>
                            </section>
                        ))}
                    </div>
                </div>
                
                <footer className="max-w-3xl mx-auto text-center py-12 text-gray-400 font-sans text-xs pb-24">
                    <p>Publicado via IA Books</p>
                    <p className="mt-2 font-bold">Powered by Fábio Arieira</p>
                </footer>
            </div>
        </div>
    );
};