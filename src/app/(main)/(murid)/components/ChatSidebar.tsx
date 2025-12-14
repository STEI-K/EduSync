// src/app/(main)/(murid)/chat/components/ChatSidebar.tsx
"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
  onDeleteSession: (id: string) => void;
};

const UI = {
  // match screenshot
  panel: "bg-white border-r border-gray-200",
  openW: "w-[280px]",
  closedW: "w-[72px]",

  topPad: "pt-6",
  sidePadOpen: "px-6",
  sidePadClosed: "px-3",

  title: "text-[14px] font-bold text-[#6AAFE8] leading-snug",
  doorBtn: "h-10 w-10 rounded-xl hover:bg-gray-100 active:scale-[0.98] transition flex items-center justify-center",

  newChat:
    "mt-4 w-full h-10 rounded-xl bg-[#5D87FF] hover:bg-[#4B73E8] text-white font-semibold shadow-sm flex items-center justify-center gap-2",

  sectionLabel: "mt-6 text-[14px] font-bold text-gray-900",
  historyList: "mt-3 space-y-1 overflow-y-auto pr-1",
  historyItem:
    "w-full text-left text-[12px] text-[#3B82F6] hover:bg-[#F3F7FF] rounded-lg px-3 py-2 truncate transition",
  historyActive: "bg-[#EAF3FF] text-[#2563EB]",

  backWrap: "mt-auto pt-6 pb-6",
  backBtn: "w-full justify-start gap-3 text-[#2563EB] hover:bg-[#F3F7FF] rounded-xl px-3",

  // context menu
  menu: "fixed z-[9999] bg-white border border-gray-200 shadow-xl rounded-lg overflow-hidden py-1 w-44 animate-in fade-in zoom-in duration-150",
  menuItem: "w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium transition-colors",
};

export function ChatSidebar({
  isOpen,
  setIsOpen,
  history,
  currentSessionId,
  onSwitchSession,
  onCreateNewSession,
  onDeleteSession,
}: ChatSidebarProps) {
  const [isHovered, setIsHovered] = useState(false);

  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    sessionId: string | null;
  }>({ visible: false, x: 0, y: 0, sessionId: null });

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleContextMenu = (e: React.MouseEvent, sessionId: string) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      sessionId,
    });
  };

  const handleDeleteClick = () => {
    if (contextMenu.sessionId) {
      onDeleteSession(contextMenu.sessionId);
      setContextMenu({ ...contextMenu, visible: false });
    }
  };

  useEffect(() => {
    const handleGlobalClick = () => setContextMenu((p) => ({ ...p, visible: false }));
    window.addEventListener("click", handleGlobalClick);
    window.addEventListener("scroll", handleGlobalClick);
    return () => {
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("scroll", handleGlobalClick);
    };
  }, []);

  return (
    <>
      <aside
        className={cn(
          "h-full flex flex-col shrink-0 transition-all duration-300 ease-in-out",
          UI.panel,
          isOpen ? UI.openW : UI.closedW
        )}
      >
        <div className={cn("h-full flex flex-col", UI.topPad, isOpen ? UI.sidePadOpen : UI.sidePadClosed)}>
          {/* TOP HEADER */}
          <div className={cn("flex items-start justify-between")}>
            {isOpen ? (
              <div className="flex flex-col">
                <div className={UI.title}>Link Your Thoughts</div>
                <div className={UI.title}>With Lynx</div>
              </div>
            ) : (
              <div className="h-[34px]" />
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={UI.doorBtn}
              type="button"
              aria-label="Toggle sidebar"
              title="Toggle"
            >
              <div className="relative w-7 h-7">
                <Image src={isHovered ? "/door_hovered.svg" : "/door.svg"} alt="Toggle" fill className="object-contain" />
              </div>
            </button>
          </div>

          {/* NEW CHAT */}
          {isOpen && (
            <Button onClick={onCreateNewSession} className={UI.newChat}>
              <Plus className="w-5 h-5" />
              New Chat
            </Button>
          )}

          {/* HISTORY */}
          {isOpen && (
            <>
              <div className={UI.sectionLabel}>Chat History</div>
              <div className={cn(UI.historyList, "min-h-0 flex-1 custom-scrollbar")}>
                {history.length === 0 && (
                  <div className="mt-3 text-[12px] text-gray-500 px-2">Belum ada percakapan</div>
                )}

                {history.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => onSwitchSession(session.id)}
                    onContextMenu={(e) => handleContextMenu(e, session.id)}
                    className={cn(
                      UI.historyItem,
                      currentSessionId === session.id && UI.historyActive
                    )}
                    type="button"
                    title={session.title}
                  >
                    {session.title}
                  </button>
                ))}
              </div>

              {/* BACK */}
              <div className={UI.backWrap}>
                <Button
                  variant="ghost"
                  className={UI.backBtn}
                  onClick={() => window.history.back()}
                  type="button"
                >
                  <div className="relative w-5 h-5">
                    <Image src="/back_chat.svg" alt="Back" fill className="object-contain" />
                  </div>
                  Back
                </Button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* CONTEXT MENU (logic tetap) */}
      {mounted &&
        contextMenu.visible &&
        createPortal(
          <div
            className={UI.menu}
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={handleDeleteClick} className={UI.menuItem} type="button">
              <Trash2 className="w-4 h-4" />
              Delete Chat
            </button>
          </div>,
          document.body
        )}
    </>
  );
}