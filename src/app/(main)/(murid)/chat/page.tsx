// src/app/(main)/(murid)/chat/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { Input } from "@/components/ui/input";
import { Search, X, FileText, Plus, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import { ChatSidebar } from "../components/ChatSidebar";

// --- CONFIG (UI ONLY) ---
const UI = {
  pageBg: "bg-[#F6F7FB]",
  // Header sudah di layout parent, jadi kita pakai offset standar 64px
  viewportHeight: "h-[calc(100vh-64px)]",

  centerWrap: "max-w-[980px] mx-auto",
  chatMax: "max-w-[820px] mx-auto",

  // Empty state
  greetTitle: "text-[42px] md:text-[54px] font-extrabold tracking-tight text-[#6AAFE8]",
  greetWrap: "flex items-center gap-4 justify-center",

  // Input pill (match screenshot)
  inputPill:
    "w-full max-w-[720px] bg-white rounded-full shadow-[0_18px_45px_rgba(0,0,0,0.12)] border border-white/60",
  inputInner: "h-14 md:h-16 flex items-center gap-3 px-4 md:px-6",
  inputField:
    "flex-1 border-none shadow-none focus-visible:ring-0 bg-transparent font-medium text-[15px] md:text-[16px] placeholder:text-gray-400",
  iconBtn:
    "h-9 w-9 md:h-10 md:w-10 rounded-full flex items-center justify-center hover:bg-gray-100 active:scale-[0.98] transition",
  iconLeft: "text-gray-700",
  iconRight: "text-gray-700",

  // Messages
  msgRow: "w-full flex mb-5",
  bubbleUser:
    "bg-[#DFF2FF] text-gray-900 rounded-2xl rounded-tr-md px-5 py-4 shadow-[0_10px_22px_rgba(0,0,0,0.07)]",
  bubbleBot:
    "bg-white text-gray-900 rounded-2xl rounded-tl-md px-5 py-4 shadow-[0_10px_22px_rgba(0,0,0,0.06)] border border-gray-100",
  prose: "prose prose-sm max-w-none break-words prose-p:my-2 prose-li:my-0.5",

  // PDF card (match screenshot 3)
  fileCard:
    "mt-3 w-full rounded-xl bg-white border border-gray-200 shadow-sm flex items-center gap-3 px-4 py-3",
  fileName: "text-[12px] font-semibold text-gray-900 truncate",
  fileIconBox: "h-9 w-9 rounded-lg bg-[#F2F4F8] flex items-center justify-center border border-gray-200",
  downloadBtn: "h-9 w-9 rounded-lg hover:bg-gray-100 flex items-center justify-center",

  // Footer
  powered: "text-[10px] font-semibold text-[#7FB3E6] tracking-wide",
};

const API_URL = "https://lynx-ai-up.railway.app";

// --- CLOUDINARY CONFIG ---
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

type Message = {
  id?: string;
  role: "user" | "model";
  content: string;
  type?: "text" | "flashcard" | "error";
  data?: any;
  timestamp?: any;
  createdAt?: number;
  imageUrl?: string;
  fileName?: string;
  mimeType?: string;
};

type ChatSession = {
  id: string;
  title: string;
  last_updated: any;
};

type InputAreaProps = {
  input: string;
  setInput: (v: string) => void;
  handleSend: () => void;
  loading: boolean;
  selectedFile: File | null;
  preview: string | null;
  clearFile: () => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  placeholder: string;
  centered?: boolean;
};

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
  placeholder,
  centered,
}: InputAreaProps) => {
  return (
    <div className={cn("w-full flex flex-col items-center", centered ? "gap-3" : "gap-2")}>
      {/* Selected file preview (tidak mengubah logic, cuma dirapihin) */}
      {selectedFile && (
        <div className="w-full max-w-[720px] flex items-center justify-start">
          <div className="relative rounded-xl bg-white border border-gray-200 shadow-sm px-3 py-2 flex items-center gap-3">
            {preview ? (
              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-200">
                <Image src={preview} alt="Preview" fill className="object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-[#F2F4F8] border border-gray-200 flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-700" />
              </div>
            )}

            <div className="flex flex-col min-w-0">
              <div className="text-[12px] font-semibold text-gray-900 truncate max-w-[260px]">{selectedFile.name}</div>
              <div className="text-[10px] text-gray-500">{(selectedFile.size / 1024).toFixed(0)} KB</div>
            </div>

            <button
              onClick={clearFile}
              className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition"
              title="Remove"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main pill input */}
      <div className={cn(UI.inputPill, loading ? "opacity-90" : "")}>
        <div className={UI.inputInner}>
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,application/pdf"
          />

          {/* Plus icon (inside pill) */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className={cn(UI.iconBtn, UI.iconLeft, loading ? "cursor-not-allowed opacity-60" : "")}
            aria-label="Upload"
            title="Upload"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Input */}
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={placeholder}
            className={UI.inputField}
            disabled={loading}
          />

          {/* Right icon: always Search (UI 1:1 screenshot), logic tetap handleSend */}
          <button
            type="button"
            onClick={handleSend}
            disabled={loading || (!input.trim() && !selectedFile)}
            className={cn(
              UI.iconBtn,
              UI.iconRight,
              loading || (!input.trim() && !selectedFile) ? "opacity-50 cursor-not-allowed" : ""
            )}
            aria-label="Send"
            title="Send"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ChatPage() {
  const { user } = useUserProfile();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [history, setHistory] = useState<ChatSession[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionId) setSessionId(uuidv4());
  }, [sessionId]);

  // FETCH HISTORY
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, "chat_rooms"),
      where("user_id", "==", user.uid),
      orderBy("last_updated", "desc"),
      limit(20)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rooms = snapshot.docs.map((docx) => ({
          id: docx.id,
          title: docx.data().title || "Percakapan Baru",
          last_updated: docx.data().last_updated,
        }));
        setHistory(rooms);
      },
      (error) => console.error("History Error:", error)
    );
    return () => unsubscribe();
  }, [user]);

  // FETCH MESSAGES
  useEffect(() => {
    if (!sessionId) return;
    const q = query(collection(db, "chat_rooms", sessionId, "messages"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((docx) => ({ id: docx.id, ...docx.data() })) as Message[];

      msgs.sort((a, b) => {
        const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : a.createdAt || Date.now();
        const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : b.createdAt || Date.now();
        const diff = timeA - timeB;

        // keep original tie-breaker (logic unchanged)
        if (Math.abs(diff) < 1000) {
          if (a.role === "user" && b.role === "model") return -1;
          if (a.role === "model" && b.role === "user") return 1;
        }
        return diff;
      });

      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, preview]);

  const handleDeleteSession = async (idToDelete: string) => {
    if (!confirm("Hapus percakapan ini?")) return;
    try {
      await deleteDoc(doc(db, "chat_rooms", idToDelete));
      if (idToDelete === sessionId) {
        setSessionId(uuidv4());
        setMessages([]);
      }
    } catch (error) {
      console.error("Gagal hapus:", error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Max 5MB");
      return;
    }
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
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

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET || "");
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      return data.secure_url;
    } catch (error) {
      console.error("Upload Error:", error);
      throw error;
    }
  };

  // --- SEND LOGIC (UNCHANGED) ---
  const handleSend = async () => {
    if ((!input.trim() && !selectedFile) || !user) return;

    const userMsg = input;
    const currentFile = selectedFile;
    const isFirstMessage = messages.length === 0;

    // optimistic UI (unchanged)
    const tempFileUrl = currentFile ? (preview || URL.createObjectURL(currentFile)) : undefined;

    const tempUserMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: userMsg,
      type: "text",
      imageUrl: tempFileUrl,
      fileName: currentFile?.name,
      mimeType: currentFile?.type,
      timestamp: null,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, tempUserMessage]);
    setInput("");
    clearFile();
    setLoading(true);

    try {
      if (isFirstMessage) {
        await setDoc(
          doc(db, "chat_rooms", sessionId),
          {
            user_id: user.uid,
            title: "Menulis judul...",
            last_updated: serverTimestamp(),
          },
          { merge: true }
        );
      }

      let fileUrl = "";
      if (currentFile) fileUrl = await uploadToCloudinary(currentFile);

      // payload unchanged
      const payload: any = {
        message: userMsg || (currentFile ? "Lampiran File" : ""),
        session_id: sessionId,
        user_id: user.uid,
        history: [],
        image_url: fileUrl ? fileUrl : null,
        file_url: fileUrl ? fileUrl : null,
        mime_type: currentFile ? currentFile.type : null,
      };

      await axios.post(`${API_URL}/chat/message`, payload);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Gagal mengirim pesan.");
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
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

  const renderMessage = (msg: Message, index: number) => {
    const isUser = msg.role === "user";

    const isPdf =
      (msg.mimeType && msg.mimeType === "application/pdf") ||
      (msg.imageUrl && msg.imageUrl.toLowerCase().endsWith(".pdf")) ||
      (msg.fileName && msg.fileName.toLowerCase().endsWith(".pdf"));

    return (
      <div key={msg.id || index} className={cn(UI.msgRow, isUser ? "justify-end" : "justify-start")}>
        <div className={cn("max-w-[86%] md:max-w-[72%]", isUser ? UI.bubbleUser : UI.bubbleBot)}>
          {/* file/image rendering (UI refined only) */}
          {msg.imageUrl && (
            <div className="mb-2">
              {isPdf ? (
                <div className={UI.fileCard}>
                  <div className={UI.fileIconBox}>
                    <FileText className="w-5 h-5 text-gray-700" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className={UI.fileName}>{msg.fileName || "Dokumen PDF"}</div>
                  </div>

                  <a
                    href={msg.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={UI.downloadBtn}
                    title="Download / Open"
                  >
                    <Download className="w-5 h-5 text-gray-700" />
                  </a>
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={msg.imageUrl} alt="Uploaded content" className="max-w-full h-auto object-cover max-h-[320px]" />
                </div>
              )}
            </div>
          )}

          {msg.type === "flashcard" ? (
            // keep existing flashcard semantics; only presentational tidy
            <div className="space-y-3">
              <div className="font-bold text-sm">📚 Flashcard Set</div>
              <div className="rounded-xl border border-gray-200 bg-[#F8FAFC] p-4">
                <div className="font-extrabold text-base">{msg.data?.topic}</div>
                <div className="text-xs text-gray-500">{msg.data?.cards?.length} Kartu Pembelajaran</div>
              </div>
              {msg.data?.pdf_base64 && (
                <a
                  href={`data:application/pdf;base64,${msg.data.pdf_base64}`}
                  download={`Flashcard-${msg.data.topic}.pdf`}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className={UI.fileIconBox}>
                      <FileText className="w-5 h-5 text-gray-700" />
                    </div>
                    <div className="text-[12px] font-semibold text-gray-900">Download PDF</div>
                  </div>
                  <Download className="w-5 h-5 text-gray-700" />
                </a>
              )}
            </div>
          ) : (
            <div className={UI.prose}>
              <ReactMarkdown
                components={{
                  ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2" {...props} />,
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    );
  };

  const isEmpty = messages.length === 0;

  return (
    <div className={cn("relative w-full overflow-hidden flex", UI.pageBg, UI.viewportHeight)}>
      <ChatSidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        history={history}
        currentSessionId={sessionId}
        onSwitchSession={switchSession}
        onCreateNewSession={createNewSession}
        onDeleteSession={handleDeleteSession}
      />

      {/* MAIN */}
      <section className="flex-1 relative h-full">
        {/* Content area */}
        <div className={cn("h-full", UI.pageBg)}>
          {isEmpty ? (
            // EMPTY STATE (match screenshot 1 & 2)
            <div className="h-full flex flex-col">
              <div className={cn("flex-1 flex items-center justify-center", UI.centerWrap)}>
                <div className="w-full flex flex-col items-center gap-10">
                  <div className={UI.greetWrap}>
                    <div className="relative w-[58px] h-[58px] md:w-[68px] md:h-[68px]">
                      <Image src="/lynx_logo.png" alt="Lynx" fill className="object-contain" priority />
                    </div>
                    <h1 className={UI.greetTitle}>Halo, {user?.nama || "Sobat"}!</h1>
                  </div>

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
                    placeholder="Tanyakan Materimu Di sini!"
                    centered
                  />
                </div>
              </div>

              <div className="pb-6 flex items-center justify-center">
                <div className={UI.powered}>Powered By Lynx</div>
              </div>
            </div>
          ) : (
            // CHAT STATE (match screenshot 3)
            <div className="h-full flex flex-col">
              <div className={cn("flex-1 overflow-y-auto px-4 md:px-8 pt-8", UI.chatMax)}>
                {messages.map((msg, idx) => renderMessage(msg, idx))}

                {loading && (
                  <div className={cn(UI.msgRow, "justify-start")}>
                    <div className={cn("max-w-[72%]", UI.bubbleBot)}>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#6AAFE8] rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-[#6AAFE8] rounded-full animate-bounce [animation-delay:120ms]" />
                        <span className="w-2 h-2 bg-[#6AAFE8] rounded-full animate-bounce [animation-delay:240ms]" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} className="h-8" />
              </div>

              {/* Bottom input */}
              <div className={cn("px-4 md:px-8 pb-8 pt-4", UI.pageBg)}>
                <div className={UI.chatMax}>
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
                    placeholder="Ask Lynx!"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}