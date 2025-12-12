'use client';

import { useState, useEffect, useRef } from 'react';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Send, 
  FileText, 
  Bot, 
  User, 
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';

// Tipe data pesan
type Message = {
  role: 'user' | 'model';
  content: string;
  type?: 'text' | 'flashcard' | 'error';
  data?: any; // Untuk data flashcard json dsb
};

type ChatSession = {
  id: string;
  title: string;
  last_updated: any;
};

// Ganti URL ini dengan URL Backend Railway kamu nanti
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://lynx-ai-production.up.railway.app"; 

export default function ChatPage() {
  const { user } = useUserProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [history, setHistory] = useState<ChatSession[]>([]);
  
  // Ref untuk scroll otomatis ke bawah
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. INIT SESSION
  useEffect(() => {
    // Jika belum ada session ID, buat baru
    if (!sessionId) {
      setSessionId(uuidv4());
    }
  }, [sessionId]);

  // 2. FETCH HISTORY SIDEBAR (Realtime dari Firebase)
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'chat_rooms'),
      where('user_id', '==', user.uid),
      orderBy('last_updated', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rooms = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title || "Percakapan Baru",
        last_updated: doc.data().last_updated
      }));
      setHistory(rooms);
    });

    return () => unsubscribe();
  }, [user]);

  // 3. AUTO SCROLL
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // 4. LOAD CHAT SAAT KLIK HISTORY
  const loadSession = async (id: string) => {
    setSessionId(id);
    setMessages([]); // Kosongkan dulu visualnya
    // Nanti Backend /chat/message dengan session_id akan otomatis 
    // me-load history di sisi server (Python context). 
    // Tapi untuk UI, kita perlu fetch messages dari subcollection firebase:
    // (Logic fetch message detail bisa ditambahkan disini menggunakan onSnapshot ke subcollection 'messages')
    // Untuk simplifikasi, kita anggap user mulai chat baru atau sistem chat realtime.
  };

  // 5. HANDLE SEND MESSAGE
  const handleSend = async () => {
    if (!input.trim() || !user) return;

    const userMsg = input;
    setInput(''); // Clear input
    
    // Optimistic UI Update
    const newMessages = [...messages, { role: 'user', content: userMsg } as Message];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Panggil Python Backend
      const res = await axios.post(`${API_URL}/chat/message`, {
        message: userMsg,
        session_id: sessionId,
        user_id: user.uid,
        history: [] // Kita andalkan backend baca DB, jadi kirim kosong gpp (atau kirim newMessages jika mau stateless)
      });

      const aiResponse = res.data;

      // Masukkan balasan AI ke UI
      setMessages(prev => [...prev, {
        role: 'model',
        content: aiResponse.answer,
        type: aiResponse.type,
        data: aiResponse.data
      }]);

    } catch (error) {
      console.error("Gagal kirim pesan:", error);
      setMessages(prev => [...prev, { role: 'model', content: "Maaf, terjadi kesalahan pada server LYNX." }]);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER HELPERS ---

  // Render Bubble Chat
  const renderMessage = (msg: Message, index: number) => {
    const isUser = msg.role === 'user';
    
    return (
      <div key={index} className={cn("flex w-full mb-6", isUser ? "justify-end" : "justify-start")}>
        <div className={cn("flex max-w-[80%] gap-4", isUser ? "flex-row-reverse" : "flex-row")}>
          {/* Avatar */}
          <div className="shrink-0">
            {isUser ? (
               <div className="w-10 h-10 rounded-full bg-blue-base flex items-center justify-center text-white overflow-hidden">
                  {/* Gambar User atau Inisial */}
                  <span className="font-bold text-lg">{user?.nama?.charAt(0) || "U"}</span>
               </div>
            ) : (
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center p-1">
                  <Image src="/Logo.png" width={30} height={30} alt="Lynx" className="object-contain invert brightness-0" /> 
               </div>
            )}
          </div>

          {/* Bubble Content */}
          <div className={cn(
            "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
            isUser ? "bg-white text-gray-800 rounded-tr-none" : "bg-white/80 text-gray-800 rounded-tl-none border border-gray-100"
          )}>
            {msg.type === 'flashcard' ? (
               // RENDER FLASHCARD SPECIAL UI
               <div className="space-y-3">
                  <p className="font-semibold text-blue-base">✨ Flashcard Generated!</p>
                  <div className="p-4 bg-blue-50 rounded border border-blue-100">
                     <p className="font-bold">{msg.data?.topic}</p>
                     <p className="text-xs text-gray-500">{msg.data?.cards?.length} Kartu</p>
                  </div>
                  {/* Tombol Download PDF jika ada */}
                  {msg.data?.pdf_base64 && (
                    <a 
                      href={`data:application/pdf;base64,${msg.data.pdf_base64}`} 
                      download={`Flashcard-${msg.data.topic}.pdf`}
                      className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:bg-gray-50 transition cursor-pointer"
                    >
                       <Image src="/pdf_logo.png" width={24} height={24} alt="PDF" />
                       <span className="font-medium text-gray-700">Download PDF Siap Cetak</span>
                    </a>
                  )}
               </div>
            ) : (
               // RENDER MARKDOWN TEXT
               <ReactMarkdown 
                  components={{
                    ul: ({node, ...props}) => <ul className="list-disc pl-4 my-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-4 my-2" {...props} />,
                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-blue-900" {...props} />
                  }}
               >
                 {msg.content}
               </ReactMarkdown>
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- MAIN RENDER ---
  return (
    <div className="flex h-[calc(100vh-120px)] w-full bg-[#F8F9FC] px-10 pb-10 gap-6">
      
      {/* --- LEFT SIDEBAR --- */}
      <aside className="w-1/4 min-w-[250px] flex flex-col gap-6">
        {/* Header Sidebar */}
        <div className="bg-white p-6 rounded-[20px] shadow-sm flex items-center justify-between">
           <div>
             <h2 className="text-blue-base font-bold text-lg leading-tight">Link Your Thoughts</h2>
             <h2 className="text-blue-40 font-bold text-lg leading-tight">With Lynx</h2>
           </div>
           <div className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center shadow-md">
              {/* Icon Pintu/Door */}
              <div className="w-4 h-6 border-2 border-white rounded-sm bg-blue-300 relative">
                 <div className="absolute right-0.5 top-2.5 w-1 h-1 bg-white rounded-full"></div>
              </div>
           </div>
        </div>

        {/* New Chat Button */}
        <Button 
          onClick={() => {
            setSessionId(uuidv4());
            setMessages([]);
          }}
          className="w-full bg-[#5D87FF] hover:bg-[#4570EA] text-white rounded-xl h-12 shadow-[0_4px_14px_rgba(93,135,255,0.3)] font-semibold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Chat
        </Button>

        {/* History List */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-1">
           <h3 className="text-sm font-bold text-black mb-3">Chat History</h3>
           {history.length === 0 && <p className="text-xs text-gray-400">Belum ada riwayat.</p>}
           
           {history.map((session) => (
             <button 
               key={session.id}
               onClick={() => loadSession(session.id)}
               className={cn(
                 "w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all truncate",
                 sessionId === session.id 
                   ? "bg-blue-50 text-blue-base border-l-4 border-blue-base" 
                   : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
               )}
             >
               {session.title}
             </button>
           ))}
        </div>

        {/* Back Button */}
        <button 
          onClick={() => window.history.back()} 
          className="flex items-center gap-2 text-gray-500 hover:text-blue-base font-semibold mt-auto"
        >
           <ChevronLeft className="w-5 h-5" />
           Back
        </button>
      </aside>


      {/* --- RIGHT CHAT AREA --- */}
      <section className="flex-1 bg-white rounded-[30px] shadow-[0_0_40px_rgba(0,0,0,0.05)] flex flex-col relative overflow-hidden">
        
        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {messages.length === 0 ? (
            // --- EMPTY STATE (Tampilan Awal) ---
            <div className="h-full flex flex-col items-center justify-center text-center gap-6 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
               <div className="w-24 h-24 relative mb-2">
                  <Image src="/Logo.png" fill alt="Lynx Logo" className="object-contain" />
               </div>
               <h1 className="text-4xl font-bold text-blue-base">
                 Halo, {user?.nama || "Learner"}!
               </h1>
               <p className="text-gray-400 max-w-md">
                 Saya LYNX, asisten belajarmu. Tanyakan apa saja tentang pelajaran, minta buatkan soal, atau ringkas materi.
               </p>
            </div>
          ) : (
            // --- MESSAGE LIST ---
            <div className="flex flex-col pt-4">
               {messages.map((msg, idx) => renderMessage(msg, idx))}
               {loading && (
                 <div className="flex w-full mb-6 justify-start">
                    <div className="flex gap-4">
                       <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                       <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                          <div className="flex gap-1">
                             <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                             <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                             <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                          </div>
                       </div>
                    </div>
                 </div>
               )}
               <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* --- INPUT AREA (Floating) --- */}
        <div className="p-8 pt-0 w-full flex justify-center">
           <div className={cn(
             "w-full max-w-3xl bg-white rounded-full flex items-center px-4 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-100 transition-all",
             messages.length === 0 ? "mb-20 scale-110" : "mb-0" // Efek membesar jika kosong
           )}>
              <button className="p-3 text-gray-400 hover:text-blue-base transition">
                 <Plus className="w-6 h-6" />
              </button>
              
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Tanyakan Materimu Di sini!" 
                className="flex-1 border-none shadow-none focus-visible:ring-0 text-lg px-4 h-14 bg-transparent placeholder:text-gray-400 font-medium"
              />
              
              <button 
                onClick={handleSend}
                disabled={loading || !input}
                className="p-3 text-gray-400 hover:text-blue-base transition disabled:opacity-50"
              >
                 {input ? <Send className="w-6 h-6" /> : <Search className="w-6 h-6" />}
              </button>
           </div>
        </div>

      </section>
    </div>
  );
}