import React, { useEffect, useState } from 'react';
import { dbService } from '../services/dbService';
import { BookOpen, Heart, Calendar, User, Search } from 'lucide-react';

interface LibraryProps {
    onSelectBook: (bookId: string) => void;
    onBack: () => void;
}

export const Library: React.FC<LibraryProps> = ({ onSelectBook, onBack }) => {
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadBooks();
    }, []);

    const loadBooks = async () => {
        const data = await dbService.getBooks();
        setBooks(data);
        setLoading(false);
    };

    const filteredBooks = books.filter(b => 
        b.title.toLowerCase().includes(search.toLowerCase()) || 
        b.author.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 py-6 px-8 sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <BookOpen className="text-indigo-600" size={32} />
                        <div>
                            <h1 className="text-2xl font-serif font-black text-slate-900 tracking-tight">IA BOOKS <span className="text-indigo-600 font-sans text-sm font-normal tracking-widest uppercase ml-2">Biblioteca Pública</span></h1>
                        </div>
                    </div>
                    
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Buscar por título ou autor..." 
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <button onClick={onBack} className="px-6 py-2 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-slate-800 transition-all">
                            Criar Novo
                        </button>
                    </div>
                </div>
            </header>

            {/* Grid */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
                        </div>
                    ) : filteredBooks.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-400 text-xl">Nenhum livro encontrado na biblioteca pública.</p>
                            <p className="text-gray-500 text-sm mt-2">Certifique-se de que o servidor (node server.js) está rodando e publique o primeiro livro!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredBooks.map((book) => (
                                <div 
                                    key={book.id} 
                                    onClick={() => onSelectBook(book.id)}
                                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full"
                                >
                                    {/* Cover */}
                                    <div className="aspect-[2/3] bg-gray-200 relative overflow-hidden">
                                        {book.coverImage ? (
                                            <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-200">
                                                <BookOpen size={64} />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                                        <div className="absolute bottom-4 left-4 right-4 text-white">
                                            <h3 className="font-serif font-bold text-lg leading-tight line-clamp-2">{book.title}</h3>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-5 flex flex-col flex-1">
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{book.subtitle}</p>
                                        
                                        <div className="flex items-center justify-between text-xs text-gray-400 border-t pt-4 mt-auto">
                                            <div className="flex items-center gap-1">
                                                <User size={12} />
                                                <span className="truncate max-w-[100px]">{book.author}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {new Date(book.publishedAt).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1 text-pink-500 font-bold">
                                                    <Heart size={12} fill="currentColor" />
                                                    {book.likes}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            
            <footer className="bg-white border-t py-6 text-center text-xs text-gray-400">
                <p>IA Books Library &copy; 2024</p>
                <p className="mt-1 font-bold text-indigo-900">Powered by Fábio Arieira</p>
            </footer>
        </div>
    );
};