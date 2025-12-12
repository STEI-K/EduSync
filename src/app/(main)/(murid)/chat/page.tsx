'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Send, X, FileText, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import { ChatSidebar } from './components/ChatSidebar';

const FIGMA_CHAT = {
  // 1. HALAMAN UTAMA
  page: {
    background: "bg-[#F8F9FC]",       // Warna Latar Belakang Seluruh Halaman
    containerRadius: "rounded-[20px]", // Radius Sudut Kontainer Utama
    containerMargin: "my-6",          // Margin Vertikal Halaman
    mobileTogglePos: "top-4 left-4",  // Posisi Tombol Menu Mobile
  },

  // 2. WELCOME SCREEN (Saat chat kosong)
  welcome: {
    logoSize: "w-24 h-24 md:w-28 md:h-28", // Ukuran Logo Lynx
    titleSize: "text-3xl md:text-5xl",     // Ukuran Font "Halo, Sobat"
    titleWeight: "font-bold",              // Ketebalan Font
    titleGradient: "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600", // Warna Gradien
  },

  // 3. MESSAGE BUBBLES
  bubbles: {
    radius: "rounded-2xl",            // Radius Bubble
    padding: "p-3.5",                 // Padding Dalam Bubble
    textSize: "text-sm",              // Ukuran Font Teks Chat
    shadow: "shadow-sm",              // Shadow Bubble
    
    // User Bubble
    userBg: "bg-blue-base",           
    userText: "text-white",
    
    // Bot Bubble
    botBg: "bg-white",
    botText: "text-gray-800",
    botBorder: "border border-gray-100",
  },

  // 4. AVATAR
  avatar: {
    size: "w-8 h-8",                  // Ukuran Lingkaran Avatar
    userBg: "bg-blue-base",           // Background Avatar User
    botBg: "bg-gradient-to-br from-blue-400 to-blue-600", // Background Avatar Bot
    botShadow: "shadow-md",
  },

  // 5. INPUT AREA (TYPE BAR)
  input: {
    width: "max-w-3xl",               // Lebar Maksimal Input Bar
    height: "h-12",                   // Tinggi Input Bar (ubah h-10, h-12, h-14 dst)
    background: "bg-white",           // Warna Background
    radius: "rounded-full",           // Radius Sudut
    border: "border border-gray-100", // Garis Tepi
    shadow: "shadow-[0_4px_20px_rgba(0,0,0,0.05)]", // Shadow Custom
    
    // Tombol Kirim/Search
    btnPadding: "p-2",
    btnActiveColor: "text-blue-base hover:bg-blue-50",
    btnInactiveColor: "text-gray-400",
    
    // Font Input
    fontSize: "text-base",
    placeholderColor: "placeholder:text-gray-400",
  },

  // 6. FLASHCARD COMPONENT
  flashcard: {
    containerBg: "bg-white/10",
    borderColor: "border-white/20",
    downloadBtnBg: "bg-white",
    downloadBtnText: "text-blue-base",
  }
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://lynx-ai-production.up.railway.app"; 

// --- TYPES ---
type Message = {
  id?: string;
  role: 'user' | 'model';
  content: string;
  type?: 'text' | 'flashcard' | 'error';
  data?: any; 
  timestamp?: any;
};

type ChatSession = {
  id: string;
  title: string;
  last_updated: any;
};

// --- COMPONENT INPUT AREA ---
const InputArea = ({ 
  input, 
  setInput, 
  handleSend, 
  loading, 
  selectedFile, 
  preview, 
  clearFile, 
  handleFileSelect, 
  fileInputRef,
  isCentered 
}: any) => {
  return (
    <div className={cn(
      "w-full flex flex-col transition-all duration-300 mx-auto",
      FIGMA_CHAT.input.width,
      FIGMA_CHAT.input.background,
      FIGMA_CHAT.input.radius,
      FIGMA_CHAT.input.shadow,
      FIGMA_CHAT.input.border,
      isCentered ? "shadow-md" : ""
    )}>
       {/* Preview File */}
       {selectedFile && (
         <div className="px-6 pt-3 flex items-center gap-2">
             <div className="relative group bg-gray-50 border rounded-lg p-2 pr-8 flex items-center gap-3">
                 {preview ? (
                     <div className="relative w-8 h-8 rounded overflow-hidden border">
                         <Image src={preview} alt="Preview" fill className="object-cover" />
                     </div>
                 ) : (
                     <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-500">
                         <FileText className="w-5 h-5" />
                     </div>
                 )}
                 <div className="flex flex-col">
                     <span className="text-xs font-semibold max-w-[150px] truncate">{selectedFile.name}</span>
                     <span className="text-[10px] text-gray-500">{(selectedFile.size / 1024).toFixed(0)} KB</span>
                 </div>
                 <button 
                     onClick={clearFile}
                     className="absolute top-1 right-1 bg-gray-200 hover:bg-red-100 hover:text-red-500 rounded-full p-0.5 transition"
                 >
                     <X className="w-3 h-3" />
                 </button>
             </div>
         </div>
       )}

       {/* Input Field */}
       <div className="flex items-center px-4 py-2 gap-2">
           <input 
             type="file" 
             ref={fileInputRef} 
             className="hidden" 
             onChange={handleFileSelect}
             accept="image/*,application/pdf"
           />
           
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="p-2 text-gray-500 hover:text-blue-base transition hover:bg-blue-50 rounded-full"
             title="Upload Gambar/PDF"
           >
              <Plus className="w-5 h-5" />
           </button>
           
           <Input 
             value={input}
             onChange={(e) => setInput(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleSend()}
             placeholder={selectedFile ? "Tambahkan keterangan..." : "Tanyakan Materimu Di sini!"}
             className={cn(
               "flex-1 border-none shadow-none focus-visible:ring-0 px-2 bg-transparent font-medium",
               FIGMA_CHAT.input.height,
               FIGMA_CHAT.input.fontSize,
               FIGMA_CHAT.input.placeholderColor
             )}
           />
           
           <button 
             onClick={handleSend}
             disabled={loading || (!input && !selectedFile)}
             className={cn(
                 "rounded-full transition-all duration-200",
                 FIGMA_CHAT.input.btnPadding,
                 (input || selectedFile) ? FIGMA_CHAT.input.btnActiveColor : FIGMA_CHAT.input.btnInactiveColor
             )}
           >
              {input || selectedFile ? <Send className="w-5 h-5" /> : <Search className="w-5 h-5" />}
           </button>
       </div>
    </div>
  );
};

export default function ChatPage() {
  const { user } = useUserProfile();
  
  // -- STATE --
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [history, setHistory] = useState<ChatSession[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // File Upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // INIT
  useEffect(() => {
    if (!sessionId) setSessionId(uuidv4());
  }, [sessionId]);

  // FETCH HISTORY
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

  // FETCH MESSAGES
  useEffect(() => {
    if (!sessionId) return;
    const q = query(
      collection(db, 'chat_rooms', sessionId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];

      msgs.sort((a, b) => {
        const tA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
        const tB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
        if (tA !== tB) return tA - tB;
        if (a.role === 'user' && b.role === 'model') return -1;
        if (a.role === 'model' && b.role === 'user') return 1;
        return 0;
      });

      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, preview]);

  // LOGIC
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB");
      return;
    }
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedFile) || !user) return;
    const userMsg = input;
    const currentFile = selectedFile;
    setInput('');
    clearFile();
    setLoading(true);

    try {
      let payload: any = {
        message: userMsg || (currentFile ? "Lampiran File" : ""),
        session_id: sessionId,
        user_id: user.uid,
        history: []
      };
      if (currentFile) {
        const base64String = await fileToBase64(currentFile);
        payload.file_base64 = base64String;
        payload.mime_type = currentFile.type;
      }
      await axios.post(`${API_URL}/chat/message`, payload);
    } catch (error) {
      console.error("Gagal kirim pesan:", error);
    } finally {
      setLoading(false);
    }
  };

  const switchSession = (id: string) => {
    setSessionId(id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const createNewSession = () => {
    setSessionId(uuidv4());
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  // RENDER MESSAGE
  const renderMessage = (msg: Message, index: number) => {
    const isUser = msg.role === 'user';
    return (
      <div key={msg.id || index} className={cn("flex w-full mb-4", isUser ? "justify-end" : "justify-start")}>
        <div className={cn("flex max-w-[85%] md:max-w-[70%] gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
          <div className="shrink-0 mt-1">
            {isUser ? (
               <div className={cn("rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white", FIGMA_CHAT.avatar.size, FIGMA_CHAT.avatar.userBg)}>
                  {user?.nama?.charAt(0) || "U"}
               </div>
            ) : (
               <div className={cn("rounded-full flex items-center justify-center p-1.5", FIGMA_CHAT.avatar.size, FIGMA_CHAT.avatar.botBg, FIGMA_CHAT.avatar.botShadow)}>
                  <Image src="/lynx_logo.png" width={30} height={30} alt="AI" className="object-contain invert brightness-0" /> 
               </div>
            )}
          </div>
          <div className={cn(
            "leading-relaxed transition-all overflow-hidden",
            FIGMA_CHAT.bubbles.padding,
            FIGMA_CHAT.bubbles.radius,
            FIGMA_CHAT.bubbles.textSize,
            FIGMA_CHAT.bubbles.shadow,
            isUser 
              ? `${FIGMA_CHAT.bubbles.userBg} ${FIGMA_CHAT.bubbles.userText} rounded-tr-none` 
              : `${FIGMA_CHAT.bubbles.botBg} ${FIGMA_CHAT.bubbles.botText} ${FIGMA_CHAT.bubbles.botBorder} rounded-tl-none`
          )}>
            {msg.type === 'flashcard' ? (
               <div className="space-y-3 min-w-[250px]">
                  <div className={cn("flex items-center gap-2 border-b pb-2 mb-2", FIGMA_CHAT.flashcard.borderColor)}>
                    <span className="font-bold">📚 Flashcard Set</span>
                  </div>
                  <div className={cn("p-3 rounded-lg border", FIGMA_CHAT.flashcard.containerBg, FIGMA_CHAT.flashcard.borderColor)}>
                     <p className="font-bold text-lg">{msg.data?.topic}</p>
                     <p className="text-xs opacity-80">{msg.data?.cards?.length} Kartu Pembelajaran</p>
                  </div>
                  {msg.data?.pdf_base64 && (
                    <a 
                      href={`data:application/pdf;base64,${msg.data.pdf_base64}`} 
                      download={`Flashcard-${msg.data.topic}.pdf`}
                      className={cn("flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer font-semibold text-xs", FIGMA_CHAT.flashcard.downloadBtnBg, FIGMA_CHAT.flashcard.downloadBtnText)}
                    >
                       <Image src="/pdf_logo.png" width={16} height={16} alt="PDF" />
                       Download PDF
                    </a>
                  )}
               </div>
            ) : (
               <div className={cn("prose prose-sm max-w-none break-words", isUser ? "prose-invert" : "")}>
                 <ReactMarkdown 
                    components={{
                        ul: ({node, ...props}) => <ul className="list-disc pl-4 my-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-4 my-1" {...props} />,
                        li: ({node, ...props}) => <li className="mb-0.5" {...props} />,
                        strong: ({node, ...props}) => <strong className={cn("font-bold", isUser ? "text-white" : "text-blue-900")} {...props} />
                    }}
                 >
                   {msg.content}
                 </ReactMarkdown>
               </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- RENDER UTAMA ---
  return (
    <div className={cn(
        "relative flex h-[calc(100vh-120px)] w-full overflow-hidden",
        FIGMA_CHAT.page.background,
        FIGMA_CHAT.page.containerRadius,
        FIGMA_CHAT.page.containerMargin
    )}>
      
      {/* SIDEBAR Component */}
      <ChatSidebar 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        history={history}
        currentSessionId={sessionId}
        onSwitchSession={switchSession}
        onCreateNewSession={createNewSession}
      />

      {/* --- MAIN CHAT --- */}
      <section className={cn("flex-1 flex flex-col relative w-full h-full", FIGMA_CHAT.page.background)}>
        {/* Toggle Button MOBILE Only */}
        <div className={cn("absolute z-20 md:hidden", FIGMA_CHAT.page.mobileTogglePos)}>
            <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="bg-white shadow-sm border-gray-200"
            >
               <div className="relative w-6 h-6">
                  <Image src="/door.svg" alt="Toggle" fill className="object-contain" />
               </div>
            </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-8 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 gap-6 animate-in fade-in zoom-in duration-500">
               <div className="flex items-center gap-4 mb-2">
                   <div className={cn("relative shrink-0", FIGMA_CHAT.welcome.logoSize)}>
                      <Image 
                        src="/lynx_logo.png" 
                        fill 
                        alt="Lynx Logo" 
                        className="object-contain" 
                        priority 
                      />
                   </div>
                   <h1 
                     className={cn(
                         "bg-clip-text text-transparent tracking-tight py-2",
                         FIGMA_CHAT.welcome.titleSize,
                         FIGMA_CHAT.welcome.titleWeight,
                         FIGMA_CHAT.welcome.titleGradient
                     )}
                   >
                     Halo, {user?.nama || "Sobat"}!
                   </h1>
               </div>
               
               <div className="w-full max-w-2xl">
                  {/* INPUT AREA */}
                  <InputArea 
                    input={input}
                    setInput={setInput}
                    handleSend={handleSend}
                    loading={loading}
                    selectedFile={selectedFile}
                    preview={preview}
                    clearFile={clearFile}
                    handleFileSelect={handleFileSelect}
                    fileInputRef={fileInputRef}
                    isCentered={true}
                  />
               </div>
            </div>
          ) : (
            <div className="w-full max-w-4xl mx-auto pb-4">
               {messages.map((msg, idx) => renderMessage(msg, idx))}
               {loading && (
                 <div className="flex w-full mb-6 justify-start">
                    <div className="flex gap-3">
                       <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                       <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center gap-1">
                             <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                             <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                             <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                       </div>
                    </div>
                 </div>
               )}
               <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* --- INPUT AREA (BOTTOM) --- */}
        {messages.length > 0 && (
            <div className={cn("p-4 md:p-6 w-full flex justify-center", FIGMA_CHAT.page.background)}>
                <InputArea 
                    input={input}
                    setInput={setInput}
                    handleSend={handleSend}
                    loading={loading}
                    selectedFile={selectedFile}
                    preview={preview}
                    clearFile={clearFile}
                    handleFileSelect={handleFileSelect}
                    fileInputRef={fileInputRef}
                />
            </div>
        )}

      </section>
    </div>
  );
}