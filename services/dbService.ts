import { Book } from "../types";

const API_URL = 'http://localhost:3001';

export const dbService = {
    async getBooks() {
        try {
            const response = await fetch(`${API_URL}/books`);
            if (!response.ok) throw new Error('Falha ao buscar livros');
            return await response.json();
        } catch (error) {
            console.error("Erro de conexão com o servidor:", error);
            // Fallback vazio ou erro amigável
            return [];
        }
    },

    async getBookById(id: string) {
        try {
            const response = await fetch(`${API_URL}/books/${id}`);
            if (!response.ok) throw new Error('Livro não encontrado');
            return await response.json();
        } catch (error) {
            console.error("Erro ao buscar livro:", error);
            return null;
        }
    },

    async publishBook(book: Book) {
        try {
            const response = await fetch(`${API_URL}/books`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(book),
            });
            if (!response.ok) throw new Error('Erro ao publicar');
            return await response.json();
        } catch (error) {
            console.error("Erro ao publicar:", error);
            alert("ERRO: Não foi possível conectar ao servidor de Banco de Dados (localhost:3001). Certifique-se de que o 'node server.js' está rodando.");
            return null;
        }
    },

    async likeBook(id: string) {
        try {
            const response = await fetch(`${API_URL}/books/${id}/like`, { method: 'POST' });
            return await response.json();
        } catch (error) {
            console.error(error);
        }
    }
};