
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Book } from '../types';
import { api } from '../services/api';
import { bulkImportBooks, getAllBooksFromDB, saveBookToDB } from '../services/db';

interface BookContextType {
  books: Book[];
  saveLocalBook: (book: Book) => Promise<void>; // Saves to IndexedDB/State only
  publishToLibrary: (book: Book) => Promise<void>; // Sends to Server
  updateBook: (id: string, updates: Partial<Book>) => Promise<void>;
  getBook: (id: string) => Book | undefined;
  exportBackup: () => void;
  importBackup: (file: File) => Promise<void>;
  refreshLibrary: () => Promise<void>;
  isLoading: boolean;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBooks = async () => {
      try {
        setIsLoading(true);
        // Fetch from "Server" (Mock API)
        const library = await api.getPublicLibrary();
        setBooks(library);
      } catch (error) {
        console.error("Failed to load library:", error);
      } finally {
        setIsLoading(false);
      }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  // 1. Save Locally (Draft/Review mode)
  const saveLocalBook = async (book: Book) => {
    const bookPayload: Book = {
        ...book,
        lastModified: Date.now()
    };
    
    // Optimistic UI update
    setBooks(prev => {
        const exists = prev.find(b => b.id === book.id);
        if (exists) return prev.map(b => b.id === book.id ? bookPayload : b);
        return [bookPayload, ...prev];
    });
    
    // Save to IndexedDB
    await saveBookToDB(bookPayload);
  };

  // 2. Publish to Server (Final Step)
  const publishToLibrary = async (book: Book) => {
      const publicBook = {
          ...book,
          isPublic: true,
          status: 'completed' as const,
          lastModified: Date.now()
      };

      // Update Local
      await saveLocalBook(publicBook);

      // Send to PHP Backend
      await api.publishBook(publicBook);
  };

  const updateBook = async (id: string, updates: Partial<Book>) => {
    setBooks(prev => prev.map(book => {
        if (book.id === id) {
            const updatedBook = { ...book, ...updates };
            // Auto-save updates locally
            saveBookToDB(updatedBook);
            
            // If it's already public, sync with server in background
            if (book.isPublic) {
                api.updateBook(updatedBook); 
            }
            return updatedBook;
        }
        return book;
    }));
  };

  const getBook = (id: string) => {
    return books.find(b => b.id === id);
  };

  const exportBackup = () => {
      const data = {
          version: 1,
          timestamp: Date.now(),
          source: "iabooks.com.br",
          books: books
      };
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `iabooks_backup_${new Date().toISOString().slice(0,10)}.iabooks`;
      a.click();
      URL.revokeObjectURL(url);
  };

  const importBackup = async (file: File) => {
      return new Promise<void>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async (e) => {
              try {
                  const content = e.target?.result as string;
                  const data = JSON.parse(content);
                  
                  if (Array.isArray(data.books)) {
                      await bulkImportBooks(data.books);
                      await loadBooks(); // Refresh from DB
                      resolve();
                  } else {
                      reject(new Error("Formato de arquivo inválido"));
                  }
              } catch (err) {
                  reject(err);
              }
          };
          reader.readAsText(file);
      });
  };

  return (
    <BookContext.Provider value={{ books, saveLocalBook, publishToLibrary, updateBook, getBook, exportBackup, importBackup, refreshLibrary: loadBooks, isLoading }}>
      {children}
    </BookContext.Provider>
  );
};

export const useBook = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBook must be used within a BookProvider');
  }
  return context;
};
