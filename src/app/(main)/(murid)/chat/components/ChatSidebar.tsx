'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';


const FIGMA_SIDEBAR = {
  // 1. DIMENSI & LAYOUT
  layout: {
    widthOpen: "md:w-[280px]",       // Lebar Sidebar Desktop (Buka)
    widthClosed: "md:w-[80px]",      // Lebar Sidebar Desktop (Tutup)
    widthMobile: "w-[85vw]",         // Lebar Sidebar Mobile
    paddingOpen: "px-6",             // Padding Kiri-Kanan saat Buka
    paddingClosed: "px-2",           // Padding Kiri-Kanan saat Tutup
    borderRight: "border-r border-gray-200", // Garis Pembatas Kanan
    background: "bg-white",          // Warna Background Utama
  },

  // 2. HEADER (JUDUL & TOGGLE)
  header: {
    titleSize: "text-[18px]",        // Ukuran Font Judul
    titleGradient: "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600", // Warna Gradien Judul
    toggleBtnSize: "w-9 h-9",        // Ukuran Area Tombol Pintu
    toggleBtnHover: "hover:scale-105", // Efek Hover Tombol Pintu
  },

  // 3. TOMBOL NEW CHAT
  newChatBtn: {
    height: "h-10",                  // Tinggi Tombol
    radius: "rounded-[16px]",        // Kelengkungan Sudut
    background: "bg-[#5D87FF]",      // Warna Background
    hover: "hover:bg-[#4570EA]",     // Warna Hover
    text: "text-white font-semibold",// Warna & Berat Font
    shadow: "shadow-sm",             // Efek Bayangan
    iconSize: "w-5 h-5",             // Ukuran Icon Plus
  },

  // 4. HISTORY LIST
  history: {
    headerText: "text-xs font-bold text-black uppercase tracking-wider", // Style Tulisan "HISTORY"
    headerMargin: "mb-3",            // Jarak Header ke List
    itemHeight: "py-2",              // Padding Vertikal per Item
    itemPadding: "px-3",             // Padding Horizontal per Item
    itemRadius: "rounded-lg",        // Radius per Item
    itemTextSize: "text-sm",         // Ukuran Font Item
    // State Colors
    activeText: "text-blue-base font-bold",        // Warna Item Aktif
    inactiveText: "text-blue-40 hover:text-blue-base", // Warna Item Tidak Aktif
  },

  // 5. FOOTER (BACK BUTTON)
  footer: {
    borderTop: "border-t border-gray-100", // Garis Pemisah Footer
    btnText: "text-blue-90 hover:text-blue-base", // Warna Teks Tombol Back
    btnPadding: "pt-3",              // Padding Area Footer
  }
};

type ChatSession = {
  id: string;
  title: string;
  last_updated: any;
};

type ChatSidebarProps = {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  history: ChatSession[];
  currentSessionId: string;
  onSwitchSession: (id: string) => void;
  onCreateNewSession: () => void;
};

export function ChatSidebar({
  isOpen,
  setIsOpen,
  history,
  currentSessionId,
  onSwitchSession,
  onCreateNewSession
}: ChatSidebarProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <aside 
      className={cn(
          "flex flex-col transition-all duration-300 ease-in-out h-full z-30 absolute md:static",
          FIGMA_SIDEBAR.layout.background,
          FIGMA_SIDEBAR.layout.borderRight,
          isOpen 
            ? `${FIGMA_SIDEBAR.layout.widthMobile} ${FIGMA_SIDEBAR.layout.widthOpen} translate-x-0` 
            : `-translate-x-full md:translate-x-0 ${FIGMA_SIDEBAR.layout.widthClosed}`
      )}
    >
      <div className={cn(
          "flex flex-col gap-4 h-full py-6 transition-all duration-300",
          isOpen ? FIGMA_SIDEBAR.layout.paddingOpen : `${FIGMA_SIDEBAR.layout.paddingClosed} items-center`
      )}>
          
          {/* HEADER & TOGGLE */}
          <div className={cn(
              "flex items-center w-full mb-2 transition-all shrink-0",
              isOpen ? "justify-between" : "justify-center"
          )}>
              {/* Judul Aplikasi */}
              <div className={cn(
                  "flex flex-col overflow-hidden transition-all duration-300",
                  isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 h-0 hidden"
              )}>
                  <h2 className={cn("font-bold leading-tight bg-clip-text text-transparent", FIGMA_SIDEBAR.header.titleSize, FIGMA_SIDEBAR.header.titleGradient)}>
                    Link Your Thoughts
                  </h2>
                  <h2 className={cn("font-bold leading-tight bg-clip-text text-transparent", FIGMA_SIDEBAR.header.titleSize, FIGMA_SIDEBAR.header.titleGradient)}>
                    With Lynx
                  </h2>
              </div>

              {/* Tombol Pintu */}
              <button 
                  onClick={() => setIsOpen(!isOpen)}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className={cn("relative shrink-0 transition-transform", FIGMA_SIDEBAR.header.toggleBtnHover)}
                  title="Toggle Sidebar"
              >
                  <div className={cn("relative transition-all", FIGMA_SIDEBAR.header.toggleBtnSize)}>
                      <Image 
                          src={isHovered ? "/door_hovered.svg" : "/door.svg"} 
                          alt="Toggle Sidebar" 
                          fill 
                          className="object-contain"
                      />
                  </div>
              </button>
          </div>

          {/* NEW CHAT BUTTON */}
          {isOpen && (
              <div className="shrink-0 w-full animate-in fade-in zoom-in duration-300">
                  <Button 
                      onClick={onCreateNewSession}
                      className={cn(
                          "w-full flex items-center gap-2 justify-center transition-colors",
                          FIGMA_SIDEBAR.newChatBtn.height,
                          FIGMA_SIDEBAR.newChatBtn.radius,
                          FIGMA_SIDEBAR.newChatBtn.background,
                          FIGMA_SIDEBAR.newChatBtn.hover,
                          FIGMA_SIDEBAR.newChatBtn.text,
                          FIGMA_SIDEBAR.newChatBtn.shadow
                      )}
                  >
                      <Plus className={FIGMA_SIDEBAR.newChatBtn.iconSize} />
                      <span>New Chat</span>
                  </Button>
              </div>
          )}

          {/* HISTORY LIST */}
          <div className={cn(
              "flex-1 overflow-y-auto pr-1 space-y-1 mt-2 custom-scrollbar w-full transition-all min-h-0",
              isOpen ? "opacity-100" : "opacity-0 hidden"
          )}>
              <h3 className={cn("sticky top-0 bg-white pb-2 z-10", FIGMA_SIDEBAR.history.headerText, FIGMA_SIDEBAR.history.headerMargin)}>History</h3>
              
              {history.length === 0 && <p className="text-xs text-gray-400 italic px-2">Belum ada riwayat.</p>}
              
              {history.map((session) => (
                  <button 
                      key={session.id}
                      onClick={() => onSwitchSession(session.id)}
                      className={cn(
                          "w-full text-left font-medium transition-all truncate",
                          FIGMA_SIDEBAR.history.itemPadding,
                          FIGMA_SIDEBAR.history.itemHeight,
                          FIGMA_SIDEBAR.history.itemRadius,
                          FIGMA_SIDEBAR.history.itemTextSize,
                          currentSessionId === session.id 
                            ? `bg-transparent ${FIGMA_SIDEBAR.history.activeText}` 
                            : FIGMA_SIDEBAR.history.inactiveText
                      )}
                  >
                      {session.title}
                  </button>
              ))}
          </div>

          {/* FOOTER BACK */}
          {isOpen && (
              <div className={cn("w-full shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-300", FIGMA_SIDEBAR.footer.borderTop, FIGMA_SIDEBAR.footer.btnPadding)}>
                  <Button 
                      variant="ghost" 
                      className={cn("w-full justify-start gap-2 px-0", FIGMA_SIDEBAR.footer.btnText)}
                      onClick={() => window.history.back()}
                  >
                      <ChevronLeft className="w-5 h-5" />
                      Back
                  </Button>
              </div>
          )}
      </div>
    </aside>
  );
}