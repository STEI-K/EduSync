"use client";

import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Search, Bell, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";

// ============ TYPES ============
type SubjectTab = "Matematika Diskret" | "Kalkulus 1" | "Dasar-Dasar Pemrograman";

type GradeCardData = {
  id: string;
  subject: SubjectTab;
  score: number;
  title: string;
  deadlineText: string;
  expanded: boolean;
  feedback: {
    analysisTitle: string;
    analysisBullets: string[];
    mistakesTitle: string;
    mistakesBullets: string[];
    fixTitle: string;
    fixBullets: string[];
  };
  table: {
    gradingStatus: string;
    finishedOn: string;
  };
};

// ============ EXACT COLOR TOKENS (LOCKED) ============
const C = {
  bg: "#F6F7FB",
  hero: "#B8B6FF",
  blue: "#3D5AFE",
  purple: "#6C63FF",
  olive: "#80711A",
  borderGrey: "#E7E7E7",
  tableBorder: "rgba(156,163,175,0.70)", // gray-400-ish but fixed alpha
};

// Desktop width 1:1 (ubah kalau screenshot kamu 1440)
const CANVAS_W = "w-[1366px]";

// Shadows dibuat fix supaya konsisten
const SOFT_SHADOW = "shadow-[0_18px_40px_rgba(0,0,0,0.10)]";
const CARD_SHADOW = "shadow-[0_18px_40px_rgba(0,0,0,0.08)]";

function tabStyle(label: SubjectTab, active: boolean) {
  if (label === "Matematika Diskret") {
    return cn(
      "px-6 py-3 rounded-xl font-extrabold text-[14px] transition",
      "text-white hover:brightness-95",
      SOFT_SHADOW,
      active && "ring-2 ring-black/5"
    );
  }
  if (label === "Kalkulus 1") {
    return cn(
      "px-6 py-3 rounded-xl font-extrabold text-[14px] transition border",
      "bg-white hover:bg-[#FAFAFA]",
      SOFT_SHADOW,
      active && "ring-2 ring-black/5"
    );
  }
  return cn(
    "px-6 py-3 rounded-xl font-extrabold text-[14px] transition",
    "text-white hover:brightness-95",
    SOFT_SHADOW,
    active && "ring-2 ring-black/5"
  );
}

/**
 * SCORE BOX: NO FILL (sesuai request)
 * Screenshot kamu: kotak kiri angka besar + label "Score".
 * Sekarang dibuat putih/transparent, border tipis, angka biru.
 */
function ScoreBox({ score }: { score: number }) {
  return (
    <div
      className={cn(
        "w-[86px] h-[86px] rounded-2xl flex flex-col items-center justify-center shrink-0",
        "bg-transparent border-2"
      )}
      style={{ borderColor: "rgba(61,90,254,0.20)" }} // border biru tipis
    >
      <div className="text-[38px] font-extrabold leading-none" style={{ color: C.blue }}>
        {score}
      </div>
      <div className="mt-1 text-[11px] font-extrabold" style={{ color: "rgba(61,90,254,0.70)" }}>
        Score
      </div>
    </div>
  );
}

function FeedbackByLynx({ feedback }: { feedback: GradeCardData["feedback"] }) {
  return (
    <div className="mt-7">
      <div className="text-[16px] font-extrabold text-black mb-4">
        Feedback By <span style={{ color: C.blue }}>Lynx</span>
      </div>

      <div className="space-y-2">
        <div className="font-extrabold text-[14px] text-black flex items-center gap-2">
          ✏️ <span>{feedback.analysisTitle}</span>
        </div>
        <ul className="space-y-2 text-[13px] text-black">
          {feedback.analysisBullets.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-[2px]">•</span>
              <span className="leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 space-y-2">
        <div className="font-extrabold text-[14px] text-black flex items-center gap-2">
          ⚠️ <span>{feedback.mistakesTitle}</span>
        </div>
        <ul className="space-y-2 text-[13px] text-black">
          {feedback.mistakesBullets.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-[2px]">❌</span>
              <span className="leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 space-y-2">
        <div className="font-extrabold text-[14px] text-black flex items-center gap-2">
          💡 <span>{feedback.fixTitle}</span>
        </div>
        <ul className="space-y-2 text-[13px] text-black">
          {feedback.fixBullets.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-[2px]">•</span>
              <span className="leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function GradeCard({ item, onToggle }: { item: GradeCardData; onToggle: (id: string) => void }) {
  return (
    <div className={cn("bg-white rounded-2xl p-8", CARD_SHADOW)}>
      <div className="flex items-start gap-8">
        <ScoreBox score={item.score} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[20px] font-extrabold text-black leading-tight">{item.title}</div>
              <div className="mt-1 text-[12px] text-gray-600 font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>{item.deadlineText}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onToggle(item.id)}
              className="text-gray-600 hover:text-gray-900 pt-1"
              aria-label="toggle"
            >
              {item.expanded ? <ChevronUp className="w-7 h-7" /> : <ChevronDown className="w-7 h-7" />}
            </button>
          </div>

          {item.expanded ? (
            <>
              <FeedbackByLynx feedback={item.feedback} />

              <div className="mt-8 border-t" style={{ borderColor: C.tableBorder }} />

              <div className="mt-6">
                <div className="w-full border" style={{ borderColor: C.tableBorder }}>
                  <div className="grid grid-cols-[200px_1fr]">
                    <div
                      className="border-b px-4 py-3 text-[13px] font-extrabold text-black"
                      style={{ borderColor: C.tableBorder }}
                    >
                      Grading Status
                    </div>
                    <div
                      className="border-b px-4 py-3 text-[13px] font-medium text-black"
                      style={{ borderColor: C.tableBorder }}
                    >
                      {item.table.gradingStatus}
                    </div>

                    <div className="px-4 py-3 text-[13px] font-extrabold text-black">Finished On</div>
                    <div className="px-4 py-3 text-[13px] font-medium text-black">{item.table.finishedOn}</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-3 text-[13px] text-gray-500 line-clamp-1">
              Feedback tersedia — klik untuk melihat detail.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MyGradesHardcodedPage() {
  const tabs: SubjectTab[] = useMemo(
    () => ["Matematika Diskret", "Kalkulus 1", "Dasar-Dasar Pemrograman"],
    []
  );

  const [activeTab, setActiveTab] = useState<SubjectTab>("Kalkulus 1");
  const [searchQuery, setSearchQuery] = useState("");

  const [cards, setCards] = useState<GradeCardData[]>([
    {
      id: "g1",
      subject: "Kalkulus 1",
      score: 98,
      title: "TK 2 Kalkulus",
      deadlineText: "Deadline on 18 Nov 2025 - 23:59",
      expanded: true,
      feedback: {
        analysisTitle: "Analisis Prosedural",
        analysisBullets: [
          "Langkah-langkah perhitungan sebagian besar benar dan sistematis.",
          "Terdapat kesalahan minor pada manipulasi aljabar dan substitusi variabel.",
          "Beberapa tahap loncat langsung ke hasil tanpa penjabaran, sehingga menurunkan kejelasan logika matematis.",
        ],
        mistakesTitle: "Kesalahan Umum yang Terdeteksi",
        mistakesBullets: [
          "Tidak menuliskan alasan pemilihan metode (misalnya metode substitusi, bagian, atau teorema tertentu).",
          "Kesalahan tanda (+/−) pada satu tahap perhitungan.",
          "Interpretasi hasil akhir belum dikaitkan kembali dengan konteks soal.",
        ],
        fixTitle: "Rekomendasi Perbaikan",
        fixBullets: ["Periksa kembali operasi aljabar dasar untuk menghindari kesalahan kecil."],
      },
      table: {
        gradingStatus: "Graded",
        finishedOn: "Wednesday, 14 May 2026, 2:31 PM",
      },
    },
    {
      id: "g2",
      subject: "Kalkulus 1",
      score: 98,
      title: "TK 2 Kalkulus",
      deadlineText: "Deadline on 18 Nov 2025 - 23:59",
      expanded: false,
      feedback: {
        analysisTitle: "Analisis Prosedural",
        analysisBullets: ["Jawaban sudah mengarah benar namun masih perlu perapihan langkah."],
        mistakesTitle: "Kesalahan Umum yang Terdeteksi",
        mistakesBullets: ["Ada bagian yang melewati penjelasan langkah."],
        fixTitle: "Rekomendasi Perbaikan",
        fixBullets: ["Lengkapi justifikasi setiap metode yang dipakai."],
      },
      table: {
        gradingStatus: "Graded",
        finishedOn: "Wednesday, 14 May 2026, 2:31 PM",
      },
    },
  ]);

  const filteredCards = useMemo(() => {
    return cards
      .filter((c) => c.subject === activeTab)
      .filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [cards, activeTab, searchQuery]);

  const toggleCard = (id: string) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, expanded: !c.expanded } : c)));
  };

  return (
    <div className="min-h-screen w-full pb-20" style={{ backgroundColor: C.bg }}>
      {/* FIXED CANVAS WIDTH */}
      <div className={cn("mx-auto", CANVAS_W)}>
        {/* HERO */}
        <div className="pt-10 px-12">
          <div className="flex items-start justify-between gap-10">
            <h1 className="text-[54px] font-extrabold leading-none" style={{ color: C.hero }}>
              Let&rsquo;s See Your Progress Here!
            </h1>

            {/* Search pill + bell */}
            <div className="flex items-center gap-4">
              <div className="relative w-[520px]">
                <Input
                  placeholder="Search Material"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn("h-12 rounded-full bg-white border-none pl-6 pr-12 text-sm", SOFT_SHADOW)}
                />
                <Search className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
              </div>

              <button
                type="button"
                className={cn("h-12 w-12 rounded-full bg-white flex items-center justify-center", SOFT_SHADOW)}
                aria-label="notifications"
              >
                <Bell className="h-6 w-6" style={{ color: C.blue }} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-10 flex items-center gap-6">
            <div className="flex items-center gap-6">
              {tabs.map((t) => {
                const active = activeTab === t;

                // Apply exact colors via inline style to guarantee match
                if (t === "Matematika Diskret") {
                  return (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={tabStyle(t, active)}
                      style={{ backgroundColor: C.blue }}
                    >
                      {t}
                    </button>
                  );
                }
                if (t === "Kalkulus 1") {
                  return (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={tabStyle(t, active)}
                      style={{ color: C.olive, borderColor: C.borderGrey }}
                    >
                      {t}
                    </button>
                  );
                }
                return (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={tabStyle(t, active)}
                    style={{ backgroundColor: C.purple }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>

            {/* Bubble MR REMOVED as requested */}
          </div>
        </div>

        {/* LIST */}
        <div className="mt-16 px-12">
          <div className="space-y-10">
            {filteredCards.map((item) => (
              <GradeCard key={item.id} item={item} onToggle={toggleCard} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}