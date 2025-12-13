
import React, { useState, useEffect, useRef } from 'react';
import { useBook } from '../context/BookContext';
import { Send, BookOpen, ArrowLeft, PlusCircle, User, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { generateChatResponse } from '../services/geminiService';

interface Message {
  id: string;
  user: string;
  text: string;
  isMe: boolean;
  timestamp: string; // Changed to string for serialization
  role?: string;
}

interface Room {
  id: string;
  name: string;
  topic: string;
  activeUsers: number;
  imageUrl: string;
  description: string;
}

// Initial placeholder rooms
const INITIAL_ROOMS: Room[] = [
  { 
    id: 'ficcao', 
    name: 'Clube da Ficção', 
    topic: 'Ficção & Fantasia', 
    activeUsers: 42,
    imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e63?q=80&w=2000&auto=format&fit=crop',
    description: 'Discutindo novos mundos, dragões e IAs rebeldes.'
  },
  { 
    id: 'tech', 
    name: 'Tech & Futuro', 
    topic: 'Tecnologia', 
    activeUsers: 128,
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000&auto=format&fit=crop',
    description: 'Onde devs e futuristas estudam as próximas tendências.'
  },
];

const ReadingRoom: React.FC = () => {
  const { books } = useBook();
  const { user } = useAuth();
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleJoinRoom = (room: Room) => {
    setActiveRoom(room);
    
    // Load chat history from LocalStorage
    const storedHistory = localStorage.getItem(`chat_history_${room.id}`);
    if (storedHistory) {
        setMessages(JSON.parse(storedHistory));
    } else {
        // Default welcome if no history
        const welcome: Message[] = [
          { 
            id: 'welcome', 
            user: 'Sistema', 
            text: `Bem-vindo ao ${room.name}.`, 
            isMe: false, 
            timestamp: new Date().toISOString(),
            role: 'Admin'
          },
          {
             id: 'bot_intro',
             user: 'Guardião da Sala',
             text: `Olá! Eu sou a IA que modera esta sala. Vamos falar sobre ${room.topic}?`,
             isMe: false,
             timestamp: new Date().toISOString(),
             role: 'AI Host'
          }
        ];
        setMessages(welcome);
        localStorage.setItem(`chat_history_${room.id}`, JSON.stringify(welcome));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom) return;

    const currentMsgText = newMessage;
    setNewMessage(''); // Clear input immediately

    const msg: Message = {
      id: crypto.randomUUID(),
      user: user?.name || 'Visitante',
      text: currentMsgText,
      isMe: true,
      timestamp: new Date().toISOString()
    };

    // Update UI immediately
    const updatedMessages = [...messages, msg];
    setMessages(updatedMessages);
    localStorage.setItem(`chat_history_${activeRoom.id}`, JSON.stringify(updatedMessages));

    // TRIGGER AI RESPONSE (Since we have no backend, we use AI to simulate a live room)
    setIsTyping(true);
    
    try {
        const aiResponseText = await generateChatResponse(
            activeRoom.name,
            activeRoom.topic,
            currentMsgText,
            updatedMessages.map(m => `${m.user}: ${m.text}`)
        );

        const aiMsg: Message = {
            id: crypto.randomUUID(),
            user: 'Guardião da Sala',
            text: aiResponseText,
            isMe: false,
            timestamp: new Date().toISOString(),
            role: 'AI Host'
        };

        const finalMessages = [...updatedMessages, aiMsg];
        setMessages(finalMessages);
        localStorage.setItem(`chat_history_${activeRoom.id}`, JSON.stringify(finalMessages));

    } catch (err) {
        console.error("AI Chat Error", err);
    } finally {
        setIsTyping(false);
    }
  };

  const handleCreateRoom = () => {
    const name = prompt("Nome da nova sala:");
    if(name) {
        const newRoom: Room = {
            id: crypto.randomUUID(),
            name,
            topic: 'Geral',
            activeUsers: 1,
            imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2000&auto=format&fit=crop',
            description: 'Nova sala criada pelo administrador.'
        };
        setRooms([...rooms, newRoom]);
    }
  };

  if (!activeRoom) {
    return (
      <div className="min-h-screen bg-skin-base pt-24 pb-12 px-4 md:px-12 transition-colors duration-500">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-skin-text mb-4">Salas de Leitura</h1>
            <p className="text-skin-muted text-lg max-w-2xl mx-auto">
              Conecte-se com nossa Inteligência Coletiva. Debata e compartilhe suas descobertas em tempo real.
            </p>
            {user?.isAdmin && (
                <button 
                    onClick={handleCreateRoom}
                    className="mt-6 flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-full mx-auto hover:bg-brand-500 transition-colors"
                >
                    <PlusCircle size={20} /> Criar Nova Sala (Admin)
                </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {rooms.map(room => (
              <div 
                key={room.id}
                onClick={() => handleJoinRoom(room)}
                className="group relative h-64 md:h-80 rounded-2xl overflow-hidden cursor-pointer shadow-2xl transition-all hover:scale-[1.02] hover:shadow-brand-900/20 ring-1 ring-white/10"
              >
                <div className="absolute inset-0">
                  <img src={room.imageUrl} alt={room.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-skin-base via-skin-base/60 to-transparent"></div>
                </div>
                
                <div className="absolute bottom-0 left-0 w-full p-8 z-10">
                  <span className="inline-block px-3 py-1 bg-brand-600 text-white text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                    {room.topic}
                  </span>
                  <h3 className="text-3xl font-bold text-white mb-2">{room.name}</h3>
                  <p className="text-gray-300 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0 duration-300">
                    {room.description}
                  </p>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <div className="flex -space-x-2">
                       <div className="w-6 h-6 rounded-full bg-green-500 border border-skin-secondary animate-pulse"></div>
                    </div>
                    <span className="font-medium text-brand-400">{room.activeUsers} conectados</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-skin-base flex flex-col pt-20 overflow-hidden transition-colors duration-500">
      
      {/* HEADER */}
      <div className="h-16 border-b border-skin-border bg-skin-secondary/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 transition-colors duration-500 z-30">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveRoom(null)} 
            className="text-skin-muted hover:text-skin-text transition-colors"
          >
            <ArrowLeft />
          </button>
          <div>
            <h2 className="text-skin-text font-bold text-lg leading-tight">{activeRoom.name}</h2>
            <div className="flex items-center gap-2 text-xs text-brand-500">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               {activeRoom.activeUsers} participantes • IA Ativa
            </div>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex-grow flex overflow-hidden">
        
        {/* LEFT: CONTENT / BOOKSHELF */}
        <div className="flex-1 bg-skin-base p-8 overflow-y-auto hidden md:block relative transition-colors duration-500">
           {/* Decorative BG */}
           <div className="absolute inset-0 opacity-10 pointer-events-none">
              <img src={activeRoom.imageUrl} className="w-full h-full object-cover blur-3xl" />
           </div>

           <div className="relative z-10 max-w-4xl mx-auto">
              <div className="mb-8 p-6 bg-skin-secondary/80 border border-skin-border rounded-xl backdrop-blur-sm transition-colors duration-500">
                 <h3 className="text-xl font-bold text-skin-text mb-2 flex items-center gap-2">
                    <BookOpen className="text-brand-500" size={20} />
                    Acervo do Clube
                 </h3>
                 <p className="text-skin-muted mb-6">Compartilhe conhecimentos e referências com o grupo.</p>
                 
                 <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                    {books.length > 0 ? books.map(book => (
                        <Link key={book.id} to={`/read/${book.id}`} className="flex-none w-32 group cursor-pointer">
                            <div className="aspect-[2/3] bg-skin-tertiary rounded-lg overflow-hidden mb-2 shadow-lg group-hover:scale-105 transition-transform">
                                {book.coverUrl ? (
                                    <img src={book.coverUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-skin-tertiary text-skin-muted">
                                        <BookOpen />
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-skin-muted font-medium truncate">{book.title}</p>
                        </Link>
                    )) : (
                        <div className="text-skin-muted italic text-sm">Nenhum livro criado recentemente.</div>
                    )}
                 </div>
              </div>
           </div>
        </div>

        {/* RIGHT: CHAT PANEL */}
        <div className="w-full md:w-[400px] bg-skin-secondary border-l border-skin-border flex flex-col shadow-2xl z-20 transition-colors duration-500">
          
          {/* MESSAGES LIST */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${msg.isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                   
                   {!msg.isMe && (
                     <span className="text-xs text-skin-muted ml-1 mb-1 flex items-center gap-1">
                        {msg.role === 'AI Host' ? <Bot size={12} className="text-brand-500" /> : <User size={12} />}
                        {msg.user}
                        {msg.role && <span className={`text-[10px] px-1.5 rounded uppercase font-bold ${msg.role === 'AI Host' ? 'bg-brand-900 text-brand-400' : 'bg-gray-700 text-gray-300'}`}>{msg.role}</span>}
                     </span>
                   )}

                   <div 
                     className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                       msg.isMe 
                       ? 'bg-brand-600 text-white rounded-br-none' 
                       : 'bg-skin-tertiary text-skin-text rounded-bl-none border border-skin-border'
                     }`}
                   >
                     {msg.text}
                   </div>
                   <span className="text-[10px] text-skin-muted mt-1 mx-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                </div>
              </div>
            ))}
            
            {isTyping && (
                <div className="flex justify-start animate-fade-in">
                    <div className="bg-skin-tertiary px-4 py-3 rounded-2xl rounded-bl-none border border-skin-border flex items-center gap-1">
                        <span className="w-2 h-2 bg-brand-500/50 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                        <span className="w-2 h-2 bg-brand-500/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-2 h-2 bg-brand-500/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* INPUT AREA */}
          <div className="p-4 bg-skin-secondary border-t border-skin-border">
            <form onSubmit={handleSendMessage} className="relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={user ? "Digite sua mensagem..." : "Faça login para participar"}
                disabled={!user || isTyping}
                className="w-full bg-skin-tertiary text-skin-text placeholder-skin-muted rounded-full pl-5 pr-12 py-3 border border-skin-border focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button 
                type="submit"
                disabled={!user || !newMessage.trim() || isTyping}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-brand-600 hover:bg-brand-500 text-white rounded-full transition-colors shadow-lg disabled:bg-gray-500"
              >
                <Send size={16} />
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ReadingRoom;
