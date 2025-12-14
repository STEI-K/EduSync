// src/app/(main)/(murid)/course/kalkulus-1/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Download, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type MaterialItem = {
  id: string;
  fileName: string;
  url: string;
};

type TaskItem = {
  id: string;
  title: string;
  publishedAt: string;
  seeMoreHref: string;
};

type CourseSection = {
  id: string;
  heading: string;
  materials: MaterialItem[];
  tasks: TaskItem[];
  showTugasNavBar?: boolean; // bar abu + panah kiri (yang ada di screenshot section ke-2)
};

type CourseChapter = {
  id: string;
  title: string;
  sections: CourseSection[];
};

function PdfFileIcon({ className }: { className?: string }) {
  // Ikon file PDF dengan folded corner (lebih mirip screenshot dibanding kotak "PDF")
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Body */}
      <path
        d="M7 2.8H16.9L22 7.9V23.2C22 24.4 21 25.4 19.8 25.4H7C5.8 25.4 4.8 24.4 4.8 23.2V5C4.8 3.8 5.8 2.8 7 2.8Z"
        fill="#C62C2C"
      />
      {/* Fold */}
      <path d="M16.9 2.8V7.9H22" fill="#E24A4A" />
      {/* Lines */}
      <rect x="8.2" y="10" width="10.6" height="1.3" rx="0.65" fill="rgba(255,255,255,0.85)" />
      <rect x="8.2" y="12.8" width="8.4" height="1.3" rx="0.65" fill="rgba(255,255,255,0.85)" />
      {/* PDF label */}
      <rect x="7.2" y="17.2" width="6.6" height="4.2" rx="1.1" fill="rgba(255,255,255,0.18)" />
      <text x="8.1" y="20.2" fontSize="2.8" fontWeight="800" fill="white">
        PDF
      </text>
    </svg>
  );
}

export default function CourseKalkulusDetailPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const UI = {
    pageBg: "bg-[#F6F7FA]",

    // screenshot: chapter & section heading biru
    brandBlue: "text-[#4E6AF6]",

    // screenshot: judul "Kalkulus 1" ungu muda
    heroTitle: "text-[#B8B6FF]",

    // screenshot: tombol "See More" ungu
    seeMoreBg: "bg-[#7649F6]",
    seeMoreHover: "hover:bg-[#6A3EF2]",

    // shadow lembut khas di screenshot (search pill & cards)
    softShadow: "shadow-[0_18px_40px_rgba(0,0,0,0.08)]",
    softShadowHover: "hover:shadow-[0_22px_54px_rgba(0,0,0,0.12)]",

    // card radius
    cardRadius: "rounded-[10px]",
  };

  const course = useMemo(() => {
    const chapters: CourseChapter[] = [
      {
        id: "ch1",
        title: "Chapter 1: Review Sistem Bilangan & Fungsi",
        sections: [
          {
            id: "s1",
            heading: "1.1 Sistem bilangan dan bilangan riil",
            materials: [
              { id: "m1", fileName: "Sistem bilangan dan bilangan riil_rev.pdf", url: "#" },
            ],
            tasks: [
              {
                id: "t1",
                title: "Tugas Kelompok 2 Kalkulus",
                publishedAt: "Published on 09 Nov 2025 - 09:30",
                seeMoreHref: "/my-assignments?aid=a1",
              },
            ],
          },
          {
            id: "s2",
            heading: "1.1 Sistem bilangan dan bilangan riil",
            materials: [
              { id: "m2", fileName: "Sistem bilangan dan bilangan riil_rev.pdf", url: "#" },
            ],
            showTugasNavBar: true, // ini yang bikin muncul bar abu + panah kiri (sesuai screenshot)
            tasks: [
              {
                id: "t2",
                title: "Tugas Kelompok 2 Kalkulus",
                publishedAt: "Published on 09 Nov 2025 - 09:30",
                seeMoreHref: "/my-assignments?aid=a1",
              },
            ],
          },
        ],
      },
    ];

    return {
      id: "kalkulus-1",
      title: "Kalkulus 1",
      teacher: "Oleh Prof Rahel Meilinda Aruan",
      chapters,
    };
  }, []);

  const filteredChapters = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return course.chapters;

    return course.chapters
      .map((ch) => {
        const sections = ch.sections.filter((s) => {
          const hitHeading = s.heading.toLowerCase().includes(q);
          const hitMat = s.materials.some((m) => m.fileName.toLowerCase().includes(q));
          const hitTask = s.tasks.some((t) => t.title.toLowerCase().includes(q));
          return hitHeading || hitMat || hitTask;
        });
        return { ...ch, sections };
      })
      .filter((ch) => ch.sections.length > 0);
  }, [course.chapters, search]);

  return (
    <div className={cn("min-h-screen", UI.pageBg)}>
      {/* wrapper ukuran & margin mirip screenshot */}
      <div className="mx-auto w-full max-w-[1100px] pt-10 pb-16">
        {/* TOP BAR */}
        <div className="flex items-start justify-between">
          {/* Left: back + title */}
          <div className="flex items-start gap-6">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="back"
              className="mt-[6px] rounded-full p-1 transition-opacity hover:opacity-80"
            >
              <ArrowLeft className="h-9 w-9 text-[#4E6AF6]" strokeWidth={2.4} />
            </button>

            <div>
              <div className={cn("text-[44px] font-extrabold leading-none", UI.heroTitle)}>
                {course.title}
              </div>
              <div className="mt-3 text-[14px] font-medium text-black">{course.teacher}</div>
            </div>
          </div>

          {/* Right: search + bell (bell TANPA bubble) */}
          <div className="flex items-center gap-8">
            <div className={cn("relative h-[44px] w-[470px] rounded-full bg-white", UI.softShadow)}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Material"
                className="h-full w-full rounded-full bg-transparent px-7 pr-12 text-[13px] font-medium text-black outline-none placeholder:text-[#A3A8B8]"
              />
              <Search className="absolute right-6 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#6B7280]" />
            </div>

            <button
              type="button"
              aria-label="notifications"
              className="transition-opacity hover:opacity-80"
            >
              <Bell className="h-9 w-9 text-[#6B83F7]" strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="mt-14 space-y-16">
          {filteredChapters.map((ch) => (
            <div key={ch.id}>
              {/* Chapter Title */}
              <h2 className={cn("text-[26px] font-extrabold", UI.brandBlue)}>{ch.title}</h2>

              {/* Sections */}
              <div className="mt-8 space-y-14">
                {ch.sections.map((sec) => (
                  <div key={sec.id}>
                    {/* section heading agak indent, seperti screenshot */}
                    <h3 className={cn("ml-8 text-[16px] font-extrabold", UI.brandBlue)}>
                      {sec.heading}
                    </h3>

                    {/* Section content indent lebih dalam */}
                    <div className="mt-6 pl-16">
                      {/* Materi */}
                      <div className="text-[13px] font-extrabold text-black">Materi</div>

                      <div className="mt-3 space-y-3">
                        {sec.materials.map((m) => (
                          <div
                            key={m.id}
                            className={cn(
                              "group flex h-[52px] w-full items-center justify-between bg-white px-5",
                              UI.cardRadius,
                              UI.softShadow,
                              "transition-all duration-200",
                              UI.softShadowHover,
                              "hover:-translate-y-[1px]"
                            )}
                          >
                            <div className="flex min-w-0 items-center gap-4">
                              <PdfFileIcon className="shrink-0" />
                              <div className="truncate text-[13px] font-medium text-black">
                                {m.fileName}
                              </div>
                            </div>

                            {/* download icon TANPA bubble besar, cuma hover kecil */}
                            <a
                              href={m.url}
                              aria-label="download material"
                              className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-[#F1F3F8]"
                            >
                              <Download className="h-5 w-5 text-black" strokeWidth={2.2} />
                            </a>
                          </div>
                        ))}
                      </div>

                      {/* Tugas */}
                      <div className="mt-8 text-[13px] font-extrabold text-black">Tugas</div>

                      {/* bar abu + panah kiri (yang muncul di screenshot section ke-2) */}
                      {sec.showTugasNavBar && (
                        <div
                          className={cn(
                            "mt-3 flex h-[38px] w-full items-center justify-center",
                            UI.cardRadius,
                            "bg-[#F1F3F8]",
                            "shadow-[0_14px_34px_rgba(0,0,0,0.06)]"
                          )}
                        >
                          <ArrowLeft className="h-4 w-4 text-black" strokeWidth={2.2} />
                        </div>
                      )}

                      <div className="mt-3 space-y-3">
                        {sec.tasks.map((t) => (
                          <div
                            key={t.id}
                            className={cn(
                              "group flex w-full items-center justify-between gap-8 bg-white px-6 py-5",
                              UI.cardRadius,
                              UI.softShadow,
                              "transition-all duration-200",
                              UI.softShadowHover,
                              "hover:-translate-y-[1px]"
                            )}
                          >
                            <div className="min-w-0">
                              <div className="truncate text-[14px] font-extrabold text-black">
                                {t.title}
                              </div>
                              <div className="mt-1 text-[12px] font-medium text-[#6B7280]">
                                {t.publishedAt}
                              </div>
                            </div>

                            <Link
                              href={t.seeMoreHref}
                              className={cn(
                                "shrink-0 inline-flex h-[28px] items-center justify-center px-4",
                                "rounded-[8px] text-[11px] font-extrabold text-white",
                                UI.seeMoreBg,
                                UI.seeMoreHover,
                                "shadow-[0_10px_22px_rgba(118,73,246,0.35)]",
                                "transition-all duration-200 active:scale-[0.98]"
                              )}
                            >
                              See More
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* empty search */}
          {filteredChapters.length === 0 && (
            <div
              className={cn(
                "mx-auto w-full bg-white px-10 py-10 text-center",
                UI.cardRadius,
                UI.softShadow
              )}
            >
              <div className="text-[14px] font-extrabold text-black">No results</div>
              <div className="mt-2 text-[12px] text-[#6B7280]">Coba keyword lain.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}