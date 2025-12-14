// src/app/(main)/(murid)/my-grades/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search, Bell, ChevronDown, ChevronUp, Clock } from "lucide-react";

// =====================
// TYPES
// =====================
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

// =====================
// TOKENS
// =====================
const TOK = {
  pageBg: "#F8F9FC",

  tabBlue: "#4E6AF6",
  tabPurple: "#7649F6",
  tabMustard: "#A7973B",

  textGrey: "#6B7280",
  iconGrey: "#9CA3AF",
  border: "#E7E7E7",
  tableBorder: "rgba(156,163,175,0.70)",

  cardBg: "#FFFFFF",
  scoreBoxBg: "#EEF1FF",
  scoreBlue: "#4E6AF6",
};

// ===== HERO GRADIENT (LEFT -> RIGHT, FIXED DIRECTION) =====
// Kamu bilang kebalik: berarti yang harusnya "lebih terang" di kiri, "lebih ungu" di kanan (atau sebaliknya).
// Dari screenshot kamu yang crop: kiri lebih terang, kanan lebih ungu.
// Jadi start = terang, end = ungu.
const HERO_GRADIENT = "linear-gradient(90deg, #EEF1FF 0%, #C9D1FF 55%, #B6B4FF 100%)";

// Screenshot canvas is ~1388px wide
const CANVAS_W = "w-[1388px]";

// Shadows tuned to match screenshot feel
const PILL_SHADOW = "shadow-[0_14px_34px_rgba(0,0,0,0.10)]";
const CARD_SHADOW = "shadow-[0_18px_44px_rgba(0,0,0,0.08)]";

function TabButton({
  label,
  active,
  onClick,
}: {
  label: SubjectTab;
  active: boolean;
  onClick: () => void;
}) {
  if (label === "Matematika Diskret") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "h-[44px] px-7 rounded-[14px] text-[14px] font-extrabold text-white",
          "transition hover:brightness-95",
          PILL_SHADOW,
          active && "ring-2 ring-black/5"
        )}
        style={{ backgroundColor: TOK.tabBlue }}
      >
        {label}
      </button>
    );
  }

  if (label === "Kalkulus 1") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "h-[44px] px-7 rounded-[14px] text-[14px] font-extrabold",
          "bg-white border transition hover:bg-[#FAFAFA]",
          PILL_SHADOW,
          active && "ring-2 ring-black/5"
        )}
        style={{ color: TOK.tabMustard, borderColor: TOK.border }}
      >
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-[44px] px-7 rounded-[14px] text-[14px] font-extrabold text-white",
        "transition hover:brightness-95",
        PILL_SHADOW,
        active && "ring-2 ring-black/5"
      )}
      style={{ backgroundColor: TOK.tabPurple }}
    >
      {label}
    </button>
  );
}

function ScoreBox({ score }: { score: number }) {
  return (
    <div
      className={cn(
        "w-[92px] h-[92px] rounded-2xl shrink-0",
        "flex flex-col items-center justify-center",
        "shadow-[0_14px_34px_rgba(0,0,0,0.06)]"
      )}
      style={{ backgroundColor: TOK.scoreBoxBg }}
    >
      <div className="text-[42px] font-extrabold leading-none" style={{ color: TOK.scoreBlue }}>
        {score}
      </div>
      <div className="mt-1 text-[11px] font-extrabold" style={{ color: "rgba(78,106,246,0.72)" }}>
        Score
      </div>
    </div>
  );
}

function FeedbackByLynx({ feedback }: { feedback: GradeCardData["feedback"] }) {
  return (
    <div className="mt-6">
      <div className="text-[16px] font-extrabold text-black mb-4">
        Feedback By <span style={{ color: TOK.scoreBlue }}>Lynx</span>
      </div>

      <div className="space-y-2">
        <div className="font-extrabold text-[14px] text-black flex items-center gap-2">
          ✏️ <span>{feedback.analysisTitle}</span>
        </div>
        <ul className="space-y-2 text-[13px] text-black">
          {feedback.analysisBullets.map((b, i) => (
            <li key={i} className="flex gap-3">
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
            <li key={i} className="flex gap-3">
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
            <li key={i} className="flex gap-3">
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
    <div className={cn("rounded-2xl", CARD_SHADOW)} style={{ backgroundColor: TOK.cardBg }}>
      <div className="px-10 py-9">
        <div className="flex items-start gap-8">
          <ScoreBox score={item.score} />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="text-[20px] font-extrabold text-black leading-tight">{item.title}</div>
                <div className="mt-2 text-[12px] font-medium flex items-center gap-2" style={{ color: TOK.textGrey }}>
                  <Clock className="w-4 h-4" style={{ color: TOK.iconGrey }} />
                  <span>{item.deadlineText}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onToggle(item.id)}
                className="pt-1 text-gray-600 hover:text-gray-900"
                aria-label="toggle"
              >
                {item.expanded ? <ChevronUp className="w-7 h-7" /> : <ChevronDown className="w-7 h-7" />}
              </button>
            </div>

            {item.expanded ? (
              <>
                <FeedbackByLynx feedback={item.feedback} />

                <div className="mt-8 border-t" style={{ borderColor: TOK.tableBorder }} />

                <div className="mt-6">
                  <div className="w-full border" style={{ borderColor: TOK.tableBorder }}>
                    <div className="grid grid-cols-[220px_1fr]">
                      <div
                        className="border-b px-5 py-3 text-[13px] font-extrabold text-black"
                        style={{ borderColor: TOK.tableBorder }}
                      >
                        Grading Status
                      </div>
                      <div
                        className="border-b px-5 py-3 text-[13px] font-medium text-black"
                        style={{ borderColor: TOK.tableBorder }}
                      >
                        {item.table.gradingStatus}
                      </div>

                      <div className="px-5 py-3 text-[13px] font-extrabold text-black">Finished On</div>
                      <div className="px-5 py-3 text-[13px] font-medium text-black">{item.table.finishedOn}</div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
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
    title: "TK2 Kalkulus — Integral Tentu & Aplikasinya",
    deadlineText: "Deadline on 16 Nov 2025 - 23:59",
    expanded: true,
    feedback: {
      analysisTitle: "Analisis Prosedural",
      analysisBullets: [
        "Pemilihan metode dan alur penyelesaian sudah tepat untuk mayoritas soal.",
        "Langkah evaluasi integral tentu sudah konsisten (F(b) − F(a)) dan notasi cukup rapi.",
        "Ada beberapa bagian yang melompat dari transformasi integral ke hasil tanpa menunjukkan intermediate step, sehingga mengurangi keterlacakan.",
      ],
      mistakesTitle: "Kesalahan Umum yang Terdeteksi",
      mistakesBullets: [
        "Transformasi batas saat substitusi pada integral tentu belum dituliskan secara eksplisit di beberapa nomor.",
        "Kesalahan tanda (+/−) minor saat manipulasi aljabar pada satu tahapan.",
        "Konstanta integrasi (+C) tertinggal pada satu sub-soal integral tak tentu (jika ada bagian tak tentu).",
      ],
      fixTitle: "Rekomendasi Perbaikan",
      fixBullets: [
        "Jika memakai substitusi pada integral tentu, selalu tulis perubahan batas atau lakukan back-sub sebelum substitusi batas.",
        "Tambahkan 1–2 langkah intermediate untuk bagian yang ‘loncat’ agar penilai bisa mengikuti logika kamu.",
        "Cek ulang operasi aljabar (tanda, distribusi, faktorisasi) sebelum finalisasi.",
      ],
    },
    table: {
      gradingStatus: "Graded",
      finishedOn: "Thursday, 07 Nov 2025, 4:10 PM",
    },
  },
  {
    id: "g2",
    subject: "Matematika Diskret",
    score: 91,
    title: "Matematika Diskret — Kombinatorika Dasar",
    deadlineText: "Deadline on 15 Nov 2025 - 20:00",
    expanded: false,
    feedback: {
      analysisTitle: "Analisis Prosedural",
      analysisBullets: [
        "Strategi penyelesaian sudah benar (mengarah ke permutasi/kombinasi dan aturan perkalian).",
        "Penulisan kasus sudah ada, namun pembagian kasus belum sepenuhnya disertai alasan yang formal.",
        "Notasi sudah cukup jelas, tetapi transisi antar langkah masih bisa dirapikan.",
      ],
      mistakesTitle: "Kesalahan Umum yang Terdeteksi",
      mistakesBullets: [
        "Salah memilih antara permutasi vs kombinasi pada satu sub-soal (urutan seharusnya tidak diperhitungkan).",
        "Tidak menuliskan definisi/argumen mengapa kasus-kasus yang dibentuk saling lepas (disjoint).",
        "Ada satu langkah yang mengasumsikan hasil tanpa pembuktian singkat (misal: langsung pakai rumus tanpa menyatakan kondisi).",
      ],
      fixTitle: "Rekomendasi Perbaikan",
      fixBullets: [
        "Tulis alasan pemilihan metode: kapan urutan penting (permutasi) vs tidak (kombinasi).",
        "Saat memakai casework, tulis kenapa kasus saling lepas dan menutupi semua kemungkinan.",
        "Tambahkan satu baris penutup yang mengaitkan hasil numerik ke pertanyaan (interpretasi jawaban).",
      ],
    },
    table: {
      gradingStatus: "Graded",
      finishedOn: "Wednesday, 06 Nov 2025, 6:25 PM",
    },
  },
  ]);

  const filteredCards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return cards
      .filter((c) => c.subject === activeTab)
      .filter((c) => (q ? c.title.toLowerCase().includes(q) : true));
  }, [cards, activeTab, searchQuery]);

  const toggleCard = (id: string) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, expanded: !c.expanded } : c)));
  };

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: TOK.pageBg }}>
      <div className={cn("mx-auto pb-24", CANVAS_W)}>
        {/* HERO */}
        <div className="pt-12 px-12">
          <div className="flex items-start justify-between gap-10">
            {/* Gradient text (LEFT -> RIGHT, corrected) */}
            <h1
              className={cn("text-[48px] font-extrabold leading-[1.0]", "bg-clip-text text-transparent")}
              style={{
                backgroundImage: HERO_GRADIENT,
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Let&rsquo;s See Your Progress Here!
            </h1>

            {/* Search pill + bell */}
            <div className="flex items-center gap-6 pt-2">
              <div className="relative w-[520px]">
                <Input
                  placeholder="Search Material"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "h-[50px] rounded-full bg-white border-0 ring-0 focus-visible:ring-0",
                    "pl-6 pr-12 text-[14px] font-medium",
                    PILL_SHADOW
                  )}
                />
                <Search className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: TOK.textGrey }} />
              </div>

              <button
                type="button"
                className={cn("h-[50px] w-[50px] rounded-full bg-white flex items-center justify-center", PILL_SHADOW)}
                aria-label="notifications"
              >
                <Bell className="h-6 w-6" style={{ color: TOK.tabBlue }} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-12 flex items-center gap-6">
            {tabs.map((t) => (
              <TabButton key={t} label={t} active={activeTab === t} onClick={() => setActiveTab(t)} />
            ))}
          </div>
        </div>

        {/* LIST */}
        <div className="mt-14 px-12">
          <div className="space-y-12">
            {filteredCards.map((item) => (
              <GradeCard key={item.id} item={item} onToggle={toggleCard} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}