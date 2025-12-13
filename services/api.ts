import { Book } from '../types';
import { initDB, saveBookToDB, getAllBooksFromDB, bulkImportBooks } from './db';

// ------------------------------------------------------------------
// HYBRID API SERVICE
// Connects to PHP Backend (HostGator) + Falls back to IndexedDB
// ------------------------------------------------------------------

// URL Base do seu site onde os arquivos PHP estarão
const BASE_URL = 'https://iabooks.com.br';

export const api = {
    // GET /list_books.php
    getPublicLibrary: async (): Promise<Book[]> => {
        try {
            // 1. Try fetching from Server
            // O arquivo deve ser renomeado para .php no servidor
            const response = await fetch(`${BASE_URL}/list_books.php?nocache=${Date.now()}`);
            if (response.ok) {
                const books = await response.json();
                
                if (Array.isArray(books)) {
                     // 2. Sync Server data to Local DB for offline backup
                     await initDB();
                     if (books.length > 0) {
                        await bulkImportBooks(books);
                     }
                     return books; // Return server data
                }
            }
        } catch (e) {
            console.warn("[API] Server offline or unreachable. Using local cache.", e);
        }

        // 3. Fallback to Local DB
        await initDB();
        const localBooks = await getAllBooksFromDB();
        return localBooks.sort((a, b) => b.createdAt - a.createdAt);
    },

    // POST /save_book.php
    publishBook: async (book: Book): Promise<void> => {
        // 1. Always save locally first (Safety Net)
        await initDB();
        const bookPayload = {
            ...book,
            isPublic: true, 
            lastModified: Date.now(),
            views: book.views || 0,
            likes: book.likes || 0
        };
        await saveBookToDB(bookPayload);

        // 2. Send to PHP Server
        try {
            // O arquivo deve ser renomeado para .php no servidor
            const response = await fetch(`${BASE_URL}/save_book.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookPayload)
            });
            
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Server returned ${response.status}: ${errText}`);
            }
            
            const result = await response.text();
            console.log(`[API] Server Response: ${result}`);
            
        } catch (e) {
            console.error("[API] Failed to save to server (Critical):", e);
            // We do not throw here to prevent the UI from crashing, 
            // since the book is safe in IndexedDB.
        }
    },

    // PUT (Reuses save_book.php logic)
    updateBook: async (book: Book): Promise<void> => {
        return api.publishBook(book);
    },

    // Search (Client-side filtering of the full library)
    searchBooks: async (query: string): Promise<Book[]> => {
        const books = await api.getPublicLibrary();
        const lowerQ = query.toLowerCase();
        return books.filter(b => 
            b.title.toLowerCase().includes(lowerQ) || 
            b.topic.toLowerCase().includes(lowerQ) ||
            b.author.toLowerCase().includes(lowerQ) ||
            (b.tags && b.tags.some(t => t.toLowerCase().includes(lowerQ)))
        );
    },

    // Get User Books (Filter from full library)
    getUserBooks: async (userName: string): Promise<Book[]> => {
        const books = await api.getPublicLibrary();
        return books.filter(b => b.author === userName);
    }
};