"use client";

import React, { useMemo, useState } from "react";
import { Bell, Search, FileText, Plus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type Attachment = { name: string; url: string };
type Status = "On Going" | "Submitted" | "Graded";

type Assignment = {
  id: string;
  tag: string;
  title: string;
  publishedAt: string;
  deadlineText: string;
  instructions: string;
  attachments: Attachment[];
  submissionStatusLabel: string;
  timeRemaining: string;
  primaryActionLabel: string;
};

type ClassCard = {
  id: string;
  title: string;
  teacher: string;
  theme: "blue" | "purple" | "yellow";
  illustration: "matdis" | "ddp" | "kalkulus";
};

export default function MyAssignmentsHardcodedPage() {
  const data = useMemo(() => {
    const assignments: Assignment[] = [
  {
    id: "a1",
    tag: "Kalkulus 1",
    title: "TK2 — Teknik Integrasi (Substitusi & Parsial)",
    publishedAt: "Published on 09 Nov 2025 - 09:30",
    deadlineText: "Deadline on 16 Nov 2025 - 23:59",
    instructions:
      "Kerjakan seluruh soal pada lembar TK2 dengan ketentuan berikut:\n\n" +
      "1) Pengerjaan manual\n" +
      "- Tulis tangan di kertas A4, rapi, dan langkah harus runtut.\n" +
      "- Jika memakai substitusi pada integral tentu, batas integral wajib diubah atau lakukan back-sub sebelum evaluasi.\n" +
      "- Untuk jawaban desimal, bulatkan sampai 4 angka di belakang koma.\n\n" +
      "2) Pengerjaan dengan LLM\n" +
      "- Gunakan LLM untuk menyelesaikan soal yang sama.\n" +
      "- Bandingkan hasilnya dengan jawaban manual (tunjukkan bagian yang berbeda dan jelaskan penyebabnya).\n\n" +
      "3) Format pengumpulan\n" +
      "- Gabungkan manual + perbandingan LLM dalam 1 PDF.\n" +
      "- Nama file: TK2_Kalkulus_Nama_NPM.pdf\n\n" +
      "Lampiran berisi soal dan rubrik penilaian.",
    attachments: [
      { name: "Soal TK2 Integral.pdf", url: "https://www.africau.edu/images/default/sample.pdf" },
      { name: "Rubrik Penilaian TK2.pdf", url: "https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf" },
    ],
    submissionStatusLabel: "No Attempt",
    timeRemaining: "6 days 11 hours 20 mins",
    primaryActionLabel: "Add Submission",
  },
  {
    id: "a2",
    tag: "Matematika Diskret",
    title: "Latihan — Logika Proposisional & Tabel Kebenaran",
    publishedAt: "Published on 08 Nov 2025 - 13:10",
    deadlineText: "Deadline on 14 Nov 2025 - 20:00",
    instructions:
      "Kerjakan latihan berikut untuk menguatkan pemahaman logika proposisional:\n\n" +
      "a) Buat tabel kebenaran lengkap untuk setiap ekspresi.\n" +
      "b) Tentukan apakah ekspresi termasuk tautologi, kontradiksi, atau kontingen.\n" +
      "c) Jika diminta, buktikan ekuivalensi menggunakan hukum logika (De Morgan, distributif, dll.).\n\n" +
      "Format:\n" +
      "- Tulis rapi dan berurutan.\n" +
      "- Untuk ekuivalensi, tunjukkan transformasi langkah demi langkah.\n\n" +
      "Lampiran berisi daftar soal dan contoh format tabel.",
    attachments: [
      { name: "Soal Logika.pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { name: "Template Tabel Kebenaran.pdf", url: "https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf" },
    ],
    submissionStatusLabel: "No Attempt",
    timeRemaining: "4 days 07 hours 10 mins",
    primaryActionLabel: "Add Submission",
  },
  {
    id: "a3",
    tag: "Dasar-Dasar Pemrograman",
    title: "Tugas — OOP: Inheritance & Polymorphism",
    publishedAt: "Published on 10 Nov 2025 - 08:00",
    deadlineText: "Deadline on 15 Nov 2025 - 18:30",
    instructions:
      "Buat program OOP sederhana sesuai spesifikasi di lampiran:\n\n" +
      "1) Wajib ada class dasar dan minimal 2 subclass (inheritance).\n" +
      "2) Implementasikan polymorphism (override method) dan demonstrasikan melalui pemanggilan via reference parent.\n" +
      "3) Sertakan validasi input dasar dan contoh test case pada bagian akhir.\n\n" +
      "Pengumpulan:\n" +
      "- Upload source code + README singkat (cara run + contoh output).\n" +
      "- Jika memakai library tambahan, tulis alasannya.\n\n" +
      "Lampiran berisi detail requirement dan contoh output yang diharapkan.",
    attachments: [
      { name: "Spesifikasi Tugas OOP.pdf", url: "https://www.africau.edu/images/default/sample.pdf" },
      { name: "Contoh Output & Testcase.pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
    ],
    submissionStatusLabel: "No Attempt",
    timeRemaining: "5 days 05 hours 40 mins",
    primaryActionLabel: "Add Submission",
  },
  {
    id: "a4",
    tag: "Kalkulus 1",
    title: "Quiz — Aplikasi Integral (Luas & Volume)",
    publishedAt: "Published on 11 Nov 2025 - 15:20",
    deadlineText: "Deadline on 13 Nov 2025 - 21:00",
    instructions:
      "Kerjakan quiz singkat aplikasi integral:\n\n" +
      "- Soal berfokus pada luas daerah dan volume benda putar.\n" +
      "- Wajib menuliskan setup integral (batas, fungsi, dan metode: washer/shell) sebelum menghitung.\n" +
      "- Jawaban tanpa setup integral dianggap tidak lengkap.\n\n" +
      "Catatan:\n" +
      "- Waktu pengerjaan 60 menit.\n" +
      "- Upload jawaban maksimal 1 file PDF.\n\n" +
      "Lampiran berisi paket soal quiz.",
    attachments: [
      { name: "Paket Soal Quiz Integral.pdf", url: "https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf" },
    ],
    submissionStatusLabel: "No Attempt",
    timeRemaining: "2 days 03 hours 00 mins",
    primaryActionLabel: "Start Quiz",
  },
  {
    id: "a5",
    tag: "Matematika Diskret",
    title: "Tugas — Kombinatorika Dasar (Counting & Casework)",
    publishedAt: "Published on 05 Nov 2025 - 14:20",
    deadlineText: "Deadline on 15 Nov 2025 - 23:00",
    instructions:
      "Kerjakan tugas kombinatorika dengan ketentuan:\n\n" +
      "1) Untuk setiap nomor, jelaskan metode yang dipilih (aturan perkalian/penjumlahan, permutasi, kombinasi, inklusi-eksklusi).\n" +
      "2) Jika menggunakan casework, pastikan kasus saling lepas (disjoint) dan mencakup semua kemungkinan.\n" +
      "3) Tulis interpretasi hasil akhir dalam konteks soal (bukan hanya angka).\n\n" +
      "Format pengumpulan:\n" +
      "- 1 PDF, rapi, dan urut.\n" +
      "- Cantumkan nama dan NPM.\n\n" +
      "Lampiran berisi soal dan contoh cara menuliskan casework yang benar.",
    attachments: [
      { name: "Soal Kombinatorika.pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { name: "Contoh Casework.pdf", url: "https://www.africau.edu/images/default/sample.pdf" },
    ],
    submissionStatusLabel: "No Attempt",
    timeRemaining: "5 days 10 hours 15 mins",
    primaryActionLabel: "Add Submission",
  },
];

    const classes: ClassCard[] = [
      {
        id: "c1",
        title: "Matematika Diskret 1",
        teacher: "Prof. Ari Darrell Muljono",
        theme: "blue",
        illustration: "matdis",
      },
      {
        id: "c2",
        title: "Dasar-Dasar\nPemrograman 1",
        teacher: "Prof. Made Shandy Krisnanda",
        theme: "purple",
        illustration: "ddp",
      },
      {
        id: "c3",
        title: "Kalkulus 1",
        teacher: "Prof. Rahel Meilinda Aruan",
        theme: "yellow",
        illustration: "kalkulus",
      },
    ];

    return { assignments, classes };
  }, []);

  const [filter, setFilter] = useState<Status>("On Going");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>(data.assignments[0]?.id || "");

  const filtered = useMemo(() => {
    const base = data.assignments.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()));
    if (filter === "On Going") return base;
    if (filter === "Submitted") return base.slice(0, Math.max(1, Math.floor(base.length / 2)));
    return base.slice(0, 1);
  }, [data.assignments, filter, search]);

  const selected = useMemo(
    () => data.assignments.find((a) => a.id === selectedId) || data.assignments[0],
    [data.assignments, selectedId]
  );

  const COLOR = {
    pageBg: "bg-[#F8F9FC]",
    shadowSoft: "shadow-[0_18px_40px_rgba(0,0,0,0.08)]",
    shadowHeader: "shadow-[0_10px_30px_rgba(0,0,0,0.08)]",
    heroGrad: "bg-gradient-to-r from-[#B8B6FF] to-[#3D5AFE]",
    olive: { active: "bg-[#80711A]", idle: "bg-[#B7A21F]" },
    activeRow: "bg-[#4B67F6]",
    hoverRow: "hover:bg-[#EEF0F6]",
  };

  // FIX #1: samain tinggi list kiri & detail kanan (selalu sama)
  const PANEL_H = "h-[520px]";
  const router = useRouter();

  return (
    <div className={cn("min-h-screen", COLOR.pageBg)}>

      <main className="mx-auto max-w-[1200px] px-10 pt-10 pb-16">
        {/* HERO + SEARCH */}
        <div className="flex items-center justify-between gap-10">
          <h1 className={cn("text-[54px] font-extrabold leading-none tracking-[-0.02em]", "text-transparent bg-clip-text", COLOR.heroGrad)}>
            Let&rsquo;s Back On Track!
          </h1>

          <div className="flex items-center gap-5">
            <div className={cn("relative w-[460px] h-[44px] rounded-full bg-white", COLOR.shadowSoft)}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Material"
                className="h-full w-full rounded-full px-6 pr-12 text-[13px] outline-none border-none bg-transparent text-black placeholder:text-[#9CA3AF]"
              />
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6B7280]" />
            </div>

            <button
              type="button"
              aria-label="notifications"
              className={cn("w-[44px] h-[44px] rounded-full bg-white flex items-center justify-center", COLOR.shadowSoft)}
            >
              <Bell className="w-[20px] h-[20px] text-[#3D5AFE]" />
            </button>
          </div>
        </div>

        {/* TITLE + FILTER */}
        <div className="mt-12 flex items-center justify-between">
          <h2 className="text-[30px] font-extrabold text-black">My Assignments</h2>

          <div className="flex items-center gap-3">
            {(["On Going", "Submitted", "Graded"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  "h-[30px] px-5 rounded-full text-[12px] font-extrabold text-white transition",
                  filter === s
                    ? cn(COLOR.olive.active, "shadow-[0_10px_22px_rgba(128,113,26,0.35)]")
                    : cn(COLOR.olive.idle, "hover:brightness-95")
                )}
                type="button"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ASSIGNMENTS GRID */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-10 items-start">
          {/* LEFT LIST (fixed height) */}
          <div className={cn("bg-white overflow-hidden", COLOR.shadowSoft, PANEL_H)}>
            <div className="h-full overflow-auto">
              {filtered.map((a, idx) => {
                const active = a.id === selected?.id;
                const isLast = idx === filtered.length - 1;

                return (
                  <button
                    key={a.id}
                    onClick={() => setSelectedId(a.id)}
                    type="button"
                    className={cn(
                      "w-full text-left px-5 py-4 transition-colors",
                      active ? COLOR.activeRow : "bg-white",
                      !active && COLOR.hoverRow,
                      !isLast && "border-b border-[#E6E7EA]"
                    )}
                  >
                    <div className="mb-3">
                      <span
                        className={cn(
                          "inline-flex items-center px-3 py-1 rounded-[8px] text-[10px] font-extrabold",
                          active ? "bg-[#DDE6FF] text-[#3D5AFE]" : "bg-[#3D5AFE] text-white"
                        )}
                      >
                        {a.tag}
                      </span>
                    </div>

                    <div className={cn("text-[14px] font-extrabold leading-snug", active ? "text-white" : "text-[#2F2F2F]")}>
                      {a.title}
                    </div>

                    <div className={cn("mt-1 text-[10px] font-medium", active ? "text-[#E8ECFF]" : "text-[#9CA3AF]")}>
                      {a.publishedAt}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT DETAIL (fixed height, scroll body if overflow) */}
          <div className={cn("bg-white", COLOR.shadowSoft, PANEL_H, "flex flex-col")}>
            {/* top padding area */}
            <div className="px-10 pt-10">
              <div className="mb-6">
                <h3 className="text-[18px] md:text-[20px] font-extrabold text-black">{selected.title}</h3>
                <p className="mt-1 text-[12px] text-[#6B7280] font-medium">{selected.deadlineText}</p>
              </div>
            </div>

            {/* scrollable content */}
            <div className="flex-1 overflow-auto px-10 pb-6 pr-8">
              <div className="text-[12px] text-[#2F2F2F] leading-relaxed whitespace-pre-line">{selected.instructions}</div>

              <div className="mt-6 space-y-2">
                {selected.attachments.map((f, idx) => (
                  <a key={idx} href={f.url} className="flex items-center gap-3 text-[12px] text-black font-medium hover:underline w-fit">
                    <FileText className="w-[16px] h-[16px] text-black" />
                    {f.name}
                  </a>
                ))}
              </div>

              <div className="mt-10 border-t border-[#D1D5DB]" />

              <div className="mt-6">
                <div className="w-full border border-[#D1D5DB]">
                  <div className="grid grid-cols-[170px_1fr]">
                    <div className="border-b border-[#D1D5DB] px-4 py-3 text-[12px] font-extrabold text-black">
                      Submission Status
                    </div>
                    <div className="border-b border-[#D1D5DB] px-4 py-3 text-[12px] font-medium text-black">
                      {selected.submissionStatusLabel}
                    </div>

                    <div className="px-4 py-3 text-[12px] font-extrabold text-black">Time Remaining</div>
                    <div className="px-4 py-3 text-[12px] font-medium text-black">{selected.timeRemaining}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* fixed footer button */}
            <div className="px-10 pb-10 pt-2">
              <div className="flex justify-center">
                <button
                  type="button"
                  className={cn(
                    "h-[34px] rounded-[8px] px-5 text-[12px] font-bold text-white inline-flex items-center gap-3",
                    "bg-[#3D5AFE] hover:bg-[#2F49E8]",
                    "shadow-[0_14px_30px_rgba(61,90,254,0.25)]"
                  )}
                >
                  <span className="w-[18px] h-[18px] rounded-full border border-white/80 flex items-center justify-center">
                    <Plus className="w-[12px] h-[12px]" />
                  </span>
                  {selected.primaryActionLabel}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MY CLASS */}
        <div className="mt-16">
          <h2 className="text-[30px] font-extrabold text-black mb-8">My Class</h2>

          {/* FIX #2: bikin kartu My Class lebih ramping (fixed max width, center) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
            {data.classes.map((c) => {
              const titleColor =
                c.theme === "blue" ? "text-[#3D5AFE]" : c.theme === "purple" ? "text-[#6C63FF]" : "text-[#B08A00]";

              const btnClass =
                c.theme === "blue"
                  ? "bg-[#4B67F6] text-white hover:bg-[#3F59E8]"
                  : c.theme === "purple"
                  ? "bg-[#6C63FF] text-white hover:bg-[#594FF2]"
                  : "bg-[#FFE16A] text-[#5A4F14] hover:brightness-95";

              return (
                <div
                  key={c.id}
                  className={cn(
                    "bg-white rounded-[18px] text-center",
                    COLOR.shadowSoft,
                    "flex flex-col items-center",
                    "w-full max-w-[320px]", // ramping
                    "min-h-[350px]"
                  )}
                >
                  <div className="w-full px-7 pt-7">
                    <div className={cn("text-[20px] font-extrabold mb-1 whitespace-pre-line", titleColor)}>{c.title}</div>
                    <div className="text-[11px] text-[#6B7280] font-semibold mb-6">{c.teacher}</div>

                    {/* fixed illustration box */}
                    <div className="h-[150px] w-full flex items-center justify-center mb-6">
                      {c.illustration === "matdis" && (
                        <svg width="220" height="140" viewBox="0 0 220 140" fill="none">
                          <circle cx="55" cy="60" r="8" fill="#3D5AFE" opacity="0.9" />
                          <circle cx="110" cy="40" r="8" fill="#3D5AFE" opacity="0.9" />
                          <circle cx="165" cy="60" r="8" fill="#3D5AFE" opacity="0.9" />
                          <circle cx="80" cy="105" r="8" fill="#3D5AFE" opacity="0.9" />
                          <circle cx="140" cy="105" r="8" fill="#3D5AFE" opacity="0.9" />
                          <path
                            d="M55 60 L110 40 L165 60 L140 105 L80 105 L55 60 Z M55 60 L140 105 M165 60 L80 105"
                            stroke="#3D5AFE"
                            strokeWidth="3"
                            opacity="0.45"
                          />
                        </svg>
                      )}

                      {c.illustration === "ddp" && (
                        <svg width="220" height="140" viewBox="0 0 220 140" fill="none">
                          <rect x="45" y="35" width="130" height="70" rx="12" stroke="#6C63FF" strokeWidth="3" opacity="0.55" />
                          <path d="M70 55 H150" stroke="#6C63FF" strokeWidth="3" opacity="0.5" />
                          <path d="M70 75 H130" stroke="#6C63FF" strokeWidth="3" opacity="0.5" />
                          <path d="M70 95 H140" stroke="#6C63FF" strokeWidth="3" opacity="0.5" />
                          <rect x="62" y="108" width="96" height="16" rx="8" fill="#6C63FF" opacity="0.18" />
                          <rect x="150" y="88" width="18" height="18" rx="6" fill="#6C63FF" opacity="0.35" />
                        </svg>
                      )}

                      {c.illustration === "kalkulus" && (
                        <svg width="220" height="140" viewBox="0 0 220 140" fill="none">
                          <path d="M70 110 V40" stroke="#FFD54F" strokeWidth="4" opacity="0.85" />
                          <path d="M70 110 H170" stroke="#FFD54F" strokeWidth="4" opacity="0.85" />
                          <path
                            d="M85 105 C100 75, 120 70, 135 55 C148 42, 160 40, 170 42"
                            stroke="#FFD54F"
                            strokeWidth="4"
                            fill="none"
                            opacity="0.85"
                          />
                          <text x="145" y="70" fontSize="18" fontWeight="800" fill="#FFD54F" opacity="0.85">
                            ∫
                          </text>
                          <text x="165" y="95" fontSize="12" fontWeight="800" fill="#FFD54F" opacity="0.85">
                            d/dx
                          </text>
                        </svg>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto w-full px-7 pb-7">
                    <button
                      type="button"
                      className={cn("w-full h-[44px] rounded-[10px] font-extrabold text-[13px]", btnClass)}
                      onClick={() => router.push("/myclasses/kalkulus1")} // FIX #3: navigasi ke halaman kelas yang sesuai
                    >
                      Enter Class
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}