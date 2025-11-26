const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001;
const DB_FILE = path.join(__dirname, 'database.json');

// Aumentar limite para aceitar imagens Base64 pesadas
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors());

// Inicializa o arquivo se não existir
async function initDB() {
    try {
        await fs.access(DB_FILE);
    } catch {
        await fs.writeFile(DB_FILE, JSON.stringify([]));
    }
}

// Ler todos os livros (resumo)
app.get('/books', async (req, res) => {
    try {
        const data = await fs.readFile(DB_FILE, 'utf8');
        const books = JSON.parse(data);
        // Retorna apenas dados leves para a galeria (sem o conteúdo pesado dos capítulos/imagens)
        const summary = books.map(b => ({
            id: b.id,
            title: b.title,
            subtitle: b.subtitle,
            author: b.config.authorName,
            coverImage: b.chapters[0]?.sections[0]?.imageUrl || null, // Pega a primeira imagem como capa
            publishedAt: b.publishedAt,
            likes: b.likes || 0
        }));
        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao ler banco de dados' });
    }
});

// Ler um livro específico (completo)
app.get('/books/:id', async (req, res) => {
    try {
        const data = await fs.readFile(DB_FILE, 'utf8');
        const books = JSON.parse(data);
        const book = books.find(b => b.id === req.params.id);
        if (book) {
            res.json(book);
        } else {
            res.status(404).json({ error: 'Livro não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao ler banco de dados' });
    }
});

// Publicar um livro
app.post('/books', async (req, res) => {
    try {
        const newBook = req.body;
        
        // Validação básica
        if (!newBook.title || !newBook.chapters) {
            return res.status(400).json({ error: 'Dados inválidos' });
        }

        const data = await fs.readFile(DB_FILE, 'utf8');
        const books = JSON.parse(data);

        // Adiciona metadados
        newBook.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        newBook.publishedAt = new Date().toISOString();
        newBook.likes = 0;

        books.unshift(newBook); // Adiciona no topo

        await fs.writeFile(DB_FILE, JSON.stringify(books, null, 2));
        
        res.status(201).json({ success: true, id: newBook.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao salvar livro' });
    }
});

// Dar Like
app.post('/books/:id/like', async (req, res) => {
    try {
        const data = await fs.readFile(DB_FILE, 'utf8');
        const books = JSON.parse(data);
        const bookIndex = books.findIndex(b => b.id === req.params.id);
        
        if (bookIndex >= 0) {
            books[bookIndex].likes = (books[bookIndex].likes || 0) + 1;
            await fs.writeFile(DB_FILE, JSON.stringify(books, null, 2));
            res.json({ success: true, likes: books[bookIndex].likes });
        } else {
            res.status(404).json({ error: 'Livro não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao dar like' });
    }
});

initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`IA Books Database rodando em http://localhost:${PORT}`);
    });
});