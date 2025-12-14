"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay } from "date-fns";
import { id as indonesia } from "date-fns/locale";
import { Bell, ChevronLeft, ChevronRight, Search, ArrowRight, X, FileText } from "lucide-react";

// Firebase
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs, limit, orderBy, query, Timestamp, where } from "firebase/firestore";

// ---------- TYPES ----------
interface UserProfile {
  uid: string;
  displayName: string | null;
  grade_level: string;
  photoURL?: string | null;
}

interface StudentClass {
  id: string;
  name: string;
  subject: string;
  teacherName?: string;
  schedule?: string;
  studentCount?: number;
}

type AssignmentStatus = "ongoing" | "graded" | "submitted";

interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate?: Timestamp | null;
  status: AssignmentStatus;
  score?: number | null;
  submittedAt?: Timestamp | null;
  author?: string | null;
  publishedAt?: Timestamp | null;
}

type AnnouncementAttachment = {
  name: string;
  url: string;
};

interface Announcement {
  id: string;
  title: string;
  author: string;
  publishedAt?: Timestamp | null;
  excerpt: string;
  content?: string;
  attachments?: AnnouncementAttachment[];
  href?: string;
}

interface LynxRecommendation {
  subject: string;
  advice: string;
  resource_link: string;
}

interface LynxAnalysisResult {
  weaknesses: string[];
  recommendations: LynxRecommendation[];
}

// ---------- UI HELPERS ----------
function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

const CHIP_STYLES = [
  { bg: "bg-[#3D5AFE]", text: "text-white" }, // biru
  { bg: "bg-[#FFD54F]", text: "text-[#5D4037]" }, // kuning
  { bg: "bg-[#6C63FF]", text: "text-white" }, // ungu
];

function safeInitial(name?: string | null) {
  const s = (name || "").trim();
  return s.length ? s[0].toUpperCase() : "S";
}

function prettyPublished(ts?: Timestamp | null) {
  if (!ts) return "09 Nov 2025 - 09:30";
  return format(ts.toDate(), "dd MMM yyyy - HH:mm", { locale: indonesia });
}

// ---------- MAIN ----------
export default function DashboardMuridPage() {
  const router = useRouter();

  // auth / profile
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // data loading
  const [loadingData, setLoadingData] = useState(true);
  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // lynx
  const [lynxData, setLynxData] = useState<LynxAnalysisResult | null>(null);
  const [loadingLynx, setLoadingLynx] = useState(false);
  const [errorLynx, setErrorLynx] = useState<string | null>(null);

  // calendar
  const [monthCursor, setMonthCursor] = useState<Date>(() => new Date(2026, 4, 1)); // May 2026
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date(2026, 4, 8));

  // ---------- ANNOUNCEMENT DRAWER STATE ----------
  const [isAnnDrawerOpen, setIsAnnDrawerOpen] = useState(false);
  const [activeAnnouncementId, setActiveAnnouncementId] = useState<string | null>(null);

  const closeAnnouncementDrawer = () => setIsAnnDrawerOpen(false);
  const openAnnouncementDrawer = (id: string) => {
    setActiveAnnouncementId(id);
    setIsAnnDrawerOpen(true);
  };

  useEffect(() => {
    if (!isAnnDrawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAnnouncementDrawer();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isAnnDrawerOpen]);

  // ---------- AUTH CHECK ----------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);

      try {
        const userDocRef = collection(db, "users");
        const q = query(userDocRef, where("uid", "==", currentUser.uid));
        const snapshot = await getDocs(q);

        let grade = "12 SMA";
        let photo = currentUser.photoURL;

        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          if (data.grade_level) grade = data.grade_level;
          if (data.photoURL) photo = data.photoURL;
        }

        setUserProfile({
          uid: currentUser.uid,
          displayName: currentUser.displayName || "Siswa",
          grade_level: grade,
          photoURL: photo,
        });
      } catch {
        setUserProfile({
          uid: currentUser.uid,
          displayName: currentUser.displayName || "Siswa",
          grade_level: "12 SMA",
          photoURL: currentUser.photoURL,
        });
      } finally {
        setLoadingAuth(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // ---------- DATA FETCH ----------
  useEffect(() => {
    if (!userProfile) return;

    const fetchAll = async () => {
      setLoadingData(true);
      try {
        // 1) Classes
        const classesRef = collection(db, "classes");
        const qClasses = query(classesRef, where("students", "array-contains", userProfile.uid));
        const classSnapshot = await getDocs(qClasses);

        const fetchedClasses: StudentClass[] = classSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || "Kelas Tanpa Nama",
          subject: doc.data().subject || "Umum",
          teacherName: doc.data().teacherName || "Guru",
          schedule: doc.data().schedule || "Jadwal belum diatur",
          studentCount: doc.data().students?.length || 0,
        }));
        setClasses(fetchedClasses);

        // 2) Assignments
        const classIds = fetchedClasses.map((c) => c.id).slice(0, 10);
        if (classIds.length > 0) {
          const assignmentsRef = collection(db, "assignments");

          const qAssignments = query(
            assignmentsRef,
            where("classId", "in", classIds),
            orderBy("dueDate", "asc"),
            limit(20)
          );

          const assignSnapshot = await getDocs(qAssignments);

          const fetchedAssignments: Assignment[] = assignSnapshot.docs.map((doc) => {
            const d = doc.data();
            const statusRaw = (d.status || "ongoing") as AssignmentStatus;

            return {
              id: doc.id,
              title: d.title || "TK2 Kalkulus",
              subject: d.subjectName || d.subject || "Kalkulus 1",
              dueDate: d.dueDate ?? null,
              status: statusRaw,
              score: typeof d.score === "number" ? d.score : null,
              submittedAt: d.submittedAt ?? null,
              author: d.author || d.teacherName || "Prof. Okky",
              publishedAt: d.publishedAt ?? null,
            };
          });

          setAssignments(fetchedAssignments);
        } else {
          setAssignments([]);
        }

        // 3) Announcements
        try {
          const annRef = collection(db, "announcements");
          const qAnn = query(annRef, orderBy("publishedAt", "desc"), limit(3));
          const annSnap = await getDocs(qAnn);

          const fetchedAnn: Announcement[] = annSnap.docs.map((doc) => {
            const d = doc.data();

            const rawAttachments = Array.isArray(d.attachments) ? d.attachments : [];
            const attachments: AnnouncementAttachment[] = rawAttachments
              .map((x: any) => ({
                name: typeof x?.name === "string" ? x.name : "Lampiran",
                url: typeof x?.url === "string" ? x.url : "#",
              }))
              .filter((x: AnnouncementAttachment) => x.url && x.url !== "#");

            return {
              id: doc.id,
              title: d.title || "Revisi Berkas TK2 Kalkulus",
              author: d.author || "Kalkulus 1 - Prof. Okky",
              publishedAt: d.publishedAt ?? null,
              excerpt:
                d.excerpt ||
                "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore.",
              content:
                d.content ||
                d.body ||
                d.description ||
                "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
              attachments: attachments.length ? attachments : undefined,
              href: d.href || "#",
            };
          });

          setAnnouncements(fetchedAnn);
        } catch {
          setAnnouncements([]);
        }
      } finally {
        setLoadingData(false);
      }
    };

    fetchAll();
    fetchLynxAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile]);

  // ---------- LYNX FETCH ----------
  const fetchLynxAnalysis = async () => {
    if (!userProfile) return;
    setLoadingLynx(true);
    setErrorLynx(null);

    try {
      const response = await fetch("https://lynx-ai.up.railway.app/analysis/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: userProfile.uid,
          student_name: userProfile.displayName,
          grade_level: userProfile.grade_level,
        }),
      });

      if (!response.ok) throw new Error("Gagal terhubung ke AI");

      const data = await response.json();
      if (!data.weaknesses || !data.recommendations) throw new Error("Format data tidak sesuai");

      setLynxData(data);
    } catch {
      setLynxData(null);
    } finally {
      setLoadingLynx(false);
    }
  };

  // ---------- FALLBACK DATA ----------
  const visualAnnouncements = useMemo<Announcement[]>(() => {
    if (announcements.length >= 3) return announcements.slice(0, 3);

    const fullText =
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n" +
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet.\n\n" +
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipisicing elit.";

    return [
      {
        id: "a1",
        title: "Pengumuman: Terdapat Revisi Berkas TK 2 Kalkulus (Gelombang 1)",
        author: "Kalkulus 1 - Prof. Okky",
        publishedAt: Timestamp.fromDate(new Date(2025, 10, 9, 9, 30)),
        excerpt:
          "Perbaiki format jawaban: tulis langkah integral secara runtut, cantumkan batas substitusi, dan rapikan notasi.\n\nDeadline revisi: Senin, 11 Nov 2025 pukul 23:59. Unggah ulang dalam satu PDF.",
        content:
          "Halo semuanya,\n\nDari hasil pengecekan berkas TK2 Kalkulus, ada beberapa pola kesalahan yang sering muncul. Tolong lakukan revisi pada submission kalian dengan memperhatikan poin berikut:\n\n1) Notasi & langkah pengerjaan\n- Setiap integral wajib ditulis langkahnya (bukan hanya hasil akhir).\n- Untuk substitusi (u-sub), cantumkan: pemilihan u, du, serta transformasi batas jika integral tentu.\n- Untuk integral parsial, tulis pemilihan u dan dv serta tabel/urutan turun-naik (jika dipakai).\n\n2) Integral tentu\n- Jika kamu mengubah variabel, batas integral harus ikut diubah (atau lakukan back-sub sebelum substitusi batas).\n- Tunjukkan evaluasi F(b) - F(a) dengan jelas.\n\n3) Penyajian file\n- Gabungkan semua jawaban dalam 1 PDF.\n- Nama file: TK2_Kalkulus_Nama_NPM.pdf\n- Pastikan scan/foto jelas (tidak blur, tidak miring, dan tidak terpotong).\n\nDeadline revisi: Senin, 11 Nov 2025 pukul 23:59.\n\nJika ada pertanyaan, tulis di forum kelas atau konsultasi pada jam office hour.\n\n\n\n\nTerima kasih.\n— Prof. Okky",
        attachments: [
          {
            name: "Template Penulisan Jawaban (PDF)",
            url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          },
          {
            name: "Rubrik Penilaian TK2 Kalkulus (PDF)",
            url: "https://www.africau.edu/images/default/sample.pdf",
          },
        ],
        href: "#",
      },
      {
        id: "a2",
        title: "Pengumuman: Format Final & Contoh Notasi (Wajib Diikuti)",
        author: "Kalkulus 1 - Prof. Okky",
        publishedAt: Timestamp.fromDate(new Date(2025, 10, 10, 10, 0)),
        excerpt:
          "Mulai minggu ini, semua submission wajib mengikuti format notasi dan struktur penulisan yang disediakan.\n\nSubmission yang tidak mengikuti format dapat diminta revisi atau dipotong poin.",
        content:
          "Halo semuanya,\n\nMulai minggu ini, semua submission TK2 Kalkulus wajib mengikuti format penulisan yang konsisten agar proses penilaian adil dan cepat. Saya melihat banyak jawaban sebenarnya benar, tetapi kehilangan poin karena notasi dan langkah kurang rapi.\n\nBerikut aturan format yang wajib diikuti:\n\n1) Struktur jawaban per soal\n- Tulis nomor soal dan sub-soal (misal: 2(a), 2(b)).\n- Tulis diketahui (jika ada) dan target yang diminta.\n- Tulis langkah pengerjaan berurutan. Hindari loncatan yang membuat pembaca menebak.\n\n2) Notasi integral\n- Gunakan tanda kurung yang jelas pada pecahan dan fungsi komposisi.\n- Jika ada konstanta, cantumkan di luar integral ketika memungkinkan.\n- Untuk integral trigonometri, tulis identitas yang dipakai sebelum substitusi (misal: sin^2 x = (1 - cos 2x)/2).\n\n3) Substitusi (u-sub) — contoh minimal yang harus terlihat\n- Tulis: u = g(x)\n- Turunkan: du = g'(x) dx\n- Ubah integral ke variabel u\n- Jika integral tentu: ubah batas bawah dan batas atas ke bentuk u, lalu evaluasi.\n\n4) Integral parsial — aturan penulisan\n- Tulis: pilih u dan dv\n- Tulis: du dan v\n- Tulis formula: ∫ u dv = uv - ∫ v du\n- Jika memakai metode tabel (tabular), tetap tulis minimal formula akhir dan hasil setiap turunan/integ.\n\n5) Kerapihan file\n- 1 file PDF untuk semua jawaban.\n- Nama file: TK2_Kalkulus_Nama_NPM.pdf\n- Foto/scan harus terbaca jelas. Jika tulisan pensil tipis, tebalin atau gunakan mode scan.\n\nCatatan penilaian:\n- Jawaban tanpa langkah bisa dianggap tidak memenuhi standar pembuktian, walaupun hasil akhirnya benar.\n- Jika format berantakan, poin presentasi/kejelasan bisa dipotong.\n\nSilakan gunakan dokumen template dan contoh notasi pada lampiran.\n\nTerima kasih.\n— Prof. Okky",
        attachments: [
          {
            name: "Template Format Jawaban (PDF)",
            url: "https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf",
          },
          {
            name: "Contoh Notasi & Langkah (PDF)",
            url: "https://www.africau.edu/images/default/sample.pdf",
          },
        ],
        href: "#",
      },
      {
        id: "a3",
        title: "Reminder: Deadline, Penalti Keterlambatan, dan Checklist Sebelum Upload",
        author: "Kalkulus 1 - Prof. Okky",
        publishedAt: Timestamp.fromDate(new Date(2025, 10, 11, 8, 15)),
        excerpt:
          "Sebelum upload, cek ulang: format file, urutan halaman, dan kejelasan langkah. jika terjadi kekurangan file tidak ada keringanan\n\nPenalti keterlambatan: -10 poin per 24 jam (maksimal 48 jam).",
        content:
          "Halo semuanya,\n\nSaya ingatkan kembali beberapa hal penting terkait pengumpulan TK2 Kalkulus.\n\n1) Deadline\n- Deadline utama: Senin, 11 Nov 2025 pukul 23:59.\n- Setelah melewati deadline, submission tetap bisa diunggah tetapi akan terkena penalti keterlambatan.\n\n2) Penalti keterlambatan\n- Terlambat ≤ 24 jam: -10 poin.\n- Terlambat 24–48 jam: -20 poin.\n- Lewat 48 jam: submission tidak dinilai kecuali ada alasan resmi (misal: surat dokter).\n\n3) Checklist sebelum upload (wajib)\n- [ ] Semua nomor soal terjawab dan tidak ada halaman yang tertinggal.\n- [ ] Langkah integral ditulis runtut (bukan hanya hasil).\n- [ ] Jika ada substitusi pada integral tentu, batas sudah ikut diubah atau dilakukan back-sub dengan jelas.\n- [ ] Tanda kurung dan pecahan terbaca (hindari tulisan yang ambigu).\n- [ ] File sudah digabung menjadi 1 PDF dan urutan halaman sesuai nomor soal.\n- [ ] Nama file sesuai format: TK2_Kalkulus_Nama_NPM.pdf\n\n4) Catatan umum dari koreksi sebelumnya\n- Banyak yang lupa menuliskan +C pada integral tak tentu.\n- Banyak yang salah di integral tentu karena batas tidak ikut berubah saat substitusi.\n- Ada yang menulis langkah “langsung jadi” tanpa justifikasi; ini berpotensi mengurangi poin.\n\nJika kamu ragu, lebih baik tulis satu langkah tambahan daripada menghilangkan penjelasan.\n\nTerima kasih.\n— Prof. Okky",
        attachments: [
          {
            name: "Checklist Pengumpulan (PDF)",
            url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          },
          {
            name: "Rubrik Penilaian (PDF)",
            url: "https://www.africau.edu/images/default/sample.pdf",
          },
        ],
        href: "#",
      },
    ];
  }, [announcements]);

  const activeAnnouncement = useMemo(() => {
    if (!activeAnnouncementId) return null;
    return visualAnnouncements.find((a) => a.id === activeAnnouncementId) || visualAnnouncements[0] || null;
  }, [activeAnnouncementId, visualAnnouncements]);

  useEffect(() => {
    if (!isAnnDrawerOpen) return;
    if (activeAnnouncementId) return;
    if (visualAnnouncements.length) setActiveAnnouncementId(visualAnnouncements[0].id);
  }, [isAnnDrawerOpen, activeAnnouncementId, visualAnnouncements]);

  const visualAssignments = useMemo(() => {
    const ongoing = assignments.filter((a) => a.status === "ongoing");
    const graded = assignments.filter((a) => a.status === "graded");
    const submitted = assignments.filter((a) => a.status === "submitted");

  const dOngoing: Assignment[] = [
    {
      id: "o1",
      title: "TK2 Kalkulus — Teknik Integrasi (Substitusi & Parsial)",
      subject: "By Kalkulus 1 - Prof. Okky",
      publishedAt: Timestamp.fromDate(new Date(2025, 10, 9, 9, 30)),
      dueDate: Timestamp.fromDate(new Date(2025, 10, 16, 23, 59)),
      status: "ongoing",
    },
    {
      id: "o2",
      title: "Matematika Diskret — Relasi, Fungsi, dan Pembuktian",
      subject: "By Matematika Diskret - Bu Rani",
      publishedAt: Timestamp.fromDate(new Date(2025, 10, 8, 13, 10)),
      dueDate: Timestamp.fromDate(new Date(2025, 10, 14, 20, 0)),
      status: "ongoing",
    },
    {
      id: "o3",
      title: "Dasar-Dasar Pemrograman — OOP: Class, Object, dan Inheritance",
      subject: "By DDP - Pak Bima",
      publishedAt: Timestamp.fromDate(new Date(2025, 10, 10, 8, 0)),
      dueDate: Timestamp.fromDate(new Date(2025, 10, 15, 18, 30)),
      status: "ongoing",
    },
  ];

  const dGraded: Assignment[] = [
    {
      id: "g1",
      title: "TK2 Kalkulus — Integral Tentu & Aplikasinya",
      subject: "By Kalkulus 1 - Prof. Okky",
      publishedAt: Timestamp.fromDate(new Date(2025, 10, 6, 9, 0)),
      status: "graded",
      score: 98,
    },
    {
      id: "g2",
      title: "Matematika Diskret — Kombinatorika Dasar",
      subject: "By Matematika Diskret - Bu Rani",
      publishedAt: Timestamp.fromDate(new Date(2025, 10, 5, 14, 20)),
      status: "graded",
      score: 91,
    },
  ];

  const dSubmitted: Assignment[] = [
    {
      id: "s1",
      title: "TK2 Kalkulus — Limit & Turunan (Latihan Campuran)",
      subject: "By Kalkulus 1 - Prof. Okky",
      publishedAt: Timestamp.fromDate(new Date(2025, 10, 2, 9, 30)),
      status: "submitted",
      submittedAt: Timestamp.fromDate(new Date(2025, 10, 3, 22, 41)),
    },
    {
      id: "s2",
      title: "Dasar-Dasar Pemrograman — Latihan Array & String",
      subject: "By DDP - Pak Bima",
      publishedAt: Timestamp.fromDate(new Date(2025, 9, 29, 10, 0)), // Oct 29 2025
      status: "submitted",
      submittedAt: Timestamp.fromDate(new Date(2025, 9, 30, 21, 5)),
    },
    {
      id: "s3",
      title: "Matematika Diskret — Logika Proposisional & Tabel Kebenaran",
      subject: "By Matematika Diskret - Bu Rani",
      publishedAt: Timestamp.fromDate(new Date(2025, 10, 1, 8, 15)),
      status: "submitted",
      submittedAt: Timestamp.fromDate(new Date(2025, 10, 1, 23, 56)),
    },
  ];
    return {
      ongoing: ongoing.length ? ongoing.slice(0, 3) : dOngoing,
      graded: graded.length ? graded.slice(0, 2) : dGraded,
      submitted: submitted.length ? submitted.slice(0, 3) : dSubmitted,
    };
  }, [assignments]);

  const classChips = useMemo(() => {
    const fallback = [
      { id: "c1", name: "Matematika Diskret" },
      { id: "c2", name: "Kalkulus 1" },
      { id: "c3", name: "Dasar-Dasar Pemrograman" },
    ];

    return classes.length ? classes.slice(0, 3).map((c) => ({ id: c.id, name: c.subject || c.name })) : fallback;
  }, [classes]);

  // ---------- CALENDAR GRID ----------
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(monthCursor);
    const monthEnd = endOfMonth(monthCursor);

    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days: Date[] = [];
    let d = gridStart;
    while (d <= gridEnd) {
      days.push(d);
      d = addDays(d, 1);
    }
    return days;
  }, [monthCursor]);

  // ---------- LOADING AUTH ----------
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3D5AFE] border-t-transparent" />
      </div>
    );
  }

  // ---------- RENDER ----------
  return (
    <div className="min-h-screen bg-[#F3F6FF]">
      <main className="mx-20 px-6 py-8">
        {/* Welcome + Search + Bell */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-[42px] leading-tight font-extrabold bg-linear-to-r from-blue-20 via-blue-40 to-blue-base bg-clip-text text-transparent w-fit">
              Welcome Again, {userProfile?.displayName || "Siswa"}!
            </h1>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <div className="relative w-[340px] hidden sm:block">
              <input
                className="w-full h-11 rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.10)] px-5 pr-12 text-sm outline-none border border-transparent focus:border-[#3D5AFE]/30"
                placeholder="Search Material"
              />
              <Search className="h-5 w-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>

            <button
              type="button"
              className="h-11 w-11 rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.10)] flex items-center justify-center"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-[#3D5AFE]" />
            </button>
          </div>
        </div>

        {/* Announcement + Calendar/Reminder row */}
        <div className="mt-8 flex justify-between items-end">
          <div className="flex flex-col">
            {/* Chips */}
            <div className="mt-4 flex flex-wrap gap-3 mb-4">
              {classChips.map((c, idx) => {
                const s = CHIP_STYLES[idx % CHIP_STYLES.length];
                return (
                  <button
                    key={c.id}
                    className={cn("px-5 py-2 rounded-[8px] text-sh6 font-semibold shadow-sm", s.bg, s.text)}
                    type="button"
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>

            {/* Latest Announcement */}
            <section>
              <h2 className="text-sh3 font-extrabold text-gray-900 mb-4">Latest Announcement</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[0, 1, 2].map((i) => {
                  const a = visualAnnouncements[i];
                  return (
                    <div
                      key={loadingData ? `sk-ann-${i}` : a.id}
                      className="bg-white rounded-2xl w-76 h-fit shadow-[0_16px_30px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden"
                    >
                      <div className="p-5">
                        <h3 className="font-extrabold text-blue-100 text-sh6">
                          {loadingData ? "Revisi Berkas TK2 Kalkulus" : a.title}
                        </h3>

                        <p className="mt-1  text-sh8 text-black">
                          <span className="font-semibold text-blue-base">
                            By {loadingData ? "Kalkulus 1 - Prof. Okky" : a.author}
                          </span>
                          {" | "}
                          Published on{" "}
                          {loadingData
                            ? "09 Nov 2025 - 09:30"
                            : a.publishedAt
                            ? format(a.publishedAt.toDate(), "dd MMM yyyy - HH:mm", { locale: indonesia })
                            : "—"}
                        </p>

                        <div className="mt-3 text-b7 leading-relaxed text-blue-100 whitespace-pre-line ml-5">
                          {loadingData ? (
                            <>
                              Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore.
                              {"\n\n"}
                              Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            </>
                          ) : (
                            a.excerpt
                          )}
                        </div>
                      </div>

                      <div className="px-5 pb-5">
                        <Link
                          href={loadingData ? "#" : a.href || "#"}
                          onClick={(e) => {
                            e.preventDefault();
                            if (!loadingData) openAnnouncementDrawer(a.id);
                          }}
                          className="block w-full text-center rounded-[8px] bg-yellow-base text-yellow-90 font-normal text-b8 py-2.5 hover:brightness-95"
                        >
                          Lihat Selengkapnya
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* RIGHT: Calendar + Reminder */}
          <aside className="space-y-5">
            {/* Calendar */}
            <div className="bg-transparent">
              <div className="flex items-center justify-end gap-2 mb-2">
                <button
                  type="button"
                  className="h-7 w-7 rounded-full hover:bg-white/60 flex items-center justify-center"
                  onClick={() => setMonthCursor((d) => subMonths(d, 1))}
                  aria-label="Prev month"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-700" />
                </button>

                <div className="text-sh5 font-bold text-gray-900">
                  {format(monthCursor, "MMMM yyyy", { locale: indonesia })}
                </div>

                <button
                  type="button"
                  className="h-7 w-7 rounded-full hover:bg-white/60 flex items-center justify-center"
                  onClick={() => setMonthCursor((d) => addMonths(d, 1))}
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4 text-gray-700" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 text-[11px] text-gray-700">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((w) => (
                  <div key={w} className="text-center font-semibold opacity-70">
                    {w}
                  </div>
                ))}

                {calendarDays.map((d, idx) => {
                  const inMonth = isSameMonth(d, monthCursor);
                  const selected = isSameDay(d, selectedDate);

                  return (
                    <button
                      key={`${d.toISOString()}-${idx}`}
                      type="button"
                      onClick={() => setSelectedDate(d)}
                      className={cn(
                        "h-7 w-7 rounded-full text-center flex items-center justify-center font-semibold",
                        inMonth ? "text-gray-900" : "text-gray-400",
                        selected ? "bg-[#3D5AFE] text-white shadow-md" : "hover:bg-white/70"
                      )}
                    >
                      {d.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reminder */}
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 mb-3">Reminder</h3>

              <div className="space-y-3 flex flex-col items-between">
                {[
                  { title: "Submit TK2 Kalkulus — Teknik Integrasi", sub: "Due Date: Mon, 11 Nov • 23:59" },
                  { title: "Quiz Matematika Diskret — Relasi & Fungsi", sub: "Due Date: Tue, 12 Nov • 20:00" },
                  { title: "Submit DDP — OOP (Inheritance)", sub: "Due Date: Wed, 13 Nov • 18:30" },
                ].map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    className="w-full rounded-xl bg-[#3D5AFE] text-white px-4 py-3 flex items-center justify-between shadow-[0_12px_24px_rgba(61,90,254,0.25)] hover:brightness-95"
                  >
                    <div className="text-left">
                      <div className="text-xs font-extrabold">{r.title}</div>
                      <div className="text-[10px] opacity-85">{r.sub}</div>
                    </div>
                    <ChevronRight className="h-5 w-5 opacity-90" />
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Latest Assignment */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-extrabold text-gray-900">Latest Assignment</h2>
            <button type="button" className="text-xs font-bold text-[#FFD54F] hover:underline">
              Lihat Selengkapnya
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* On Going */}
            <div>
              <div className="text-center text-sh5 font-semibold text-blue-60 mb-4">On Going</div>
              <div className="space-y-4">
                {visualAssignments.ongoing.map((t) => (
                  <div key={t.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className="font-semibold text-sh6 text-black">{t.title}</div>
                    <div className="text-b9 text-blue-100 mt-1">
                      {t.subject}
                      {t.publishedAt ? ` | Published on ${prettyPublished(t.publishedAt)}` : ""}
                    </div>
                    <div className="mt-3 flex items-center justify-end">
                      <span className="text-b9 font-semibold text-blue-base">7 days 12 hours left</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Graded */}
            <div>
              <div className="text-center text-sh5 font-semibold text-blue-60 mb-4">Graded</div>
              <div className="space-y-4">
                {visualAssignments.graded.map((t) => {
                  const title = t.title || "TK2 Kalkulus - Integral & Aplikasinya";
                  const authorLine = t.subject || "By Kalkulus 1 - Prof. Okky";
                  const pubLine = t.publishedAt
                    ? format(t.publishedAt.toDate(), "dd MMM yyyy - HH:mm", { locale: indonesia })
                    : "09 Nov 2025 - 09:30";
                  const scoreVal = typeof t.score === "number" ? t.score : 98;

                  return (
                    <div key={t.id} className="relative group">
                      {/* CARD NORMAL (tetap seperti UI kamu sekarang) */}
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-4 transition-opacity duration-150 group-hover:opacity-0">
                        <div className="flex-1">
                          <div className="font-semibold text-sh6 text-black">{title}</div>
                          <div className="text-b9 text-blue-100 mt-1">
                            {authorLine}
                            {t.publishedAt ? ` | Published on ${pubLine}` : ""}
                          </div>
                        </div>

                        <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] flex flex-col items-center justify-center border border-[#DDE3FF]">
                          <div className="text-lg leading-none font-extrabold text-[#3D5AFE]">{scoreVal}</div>
                          <div className="text-[10px] font-bold text-[#3D5AFE] opacity-80">Score</div>
                        </div>
                      </div>

                      {/* HOVER PANEL (floating overlay, tidak kepotong, tidak merusak layout) */}
                      <div
                          className={cn(
                            "absolute left-0 top-0 w-full z-30",
                            "opacity-0 pointer-events-none transition-opacity duration-150",
                            "group-hover:opacity-100 group-hover:pointer-events-auto"
                          )}
                        >
                        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_16px_30px_rgba(0,0,0,0.10)] p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              {/* Title: kecil + clamp biar ga jadi poster */}
                              <div
                                className={cn(
                                  "text-[22px] leading-snug font-extrabold text-black",
                                  "overflow-hidden",
                                  "[display:-webkit-box]",
                                  "[-webkit-box-orient:vertical]",
                                  "[-webkit-line-clamp:2]"
                                )}
                              >
                                {title}
                              </div>

                              {/* Meta: lebih kecil */}
                              <div className="mt-2 text-[14px] leading-snug text-black">
                                <div>{authorLine}</div>
                                <div>Published on {pubLine}</div>
                              </div>
                            </div>

                            {/* Score box: diperkecil */}
                            <div className="w-[78px] h-[78px] rounded-2xl bg-[#EEF2FF] flex flex-col items-center justify-center border border-[#DDE3FF] shrink-0">
                              <div className="text-[34px] leading-none font-extrabold text-[#3D5AFE]">
                                {scoreVal}
                              </div>
                              <div className="text-[13px] font-semibold text-[#3D5AFE] opacity-90">
                                Score
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="mt-4 w-full h-[48px] rounded-xl bg-[#6C63FF] text-white font-medium text-[16px] hover:brightness-95"
                            onClick={() => router.push(`/assignments/${t.id}/feedback`)}
                          >
                            See Feedback
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submitted */}
            <div>
              <div className="text-center text-sh5 font-semibold text-blue-60 mb-4">Submitted</div>
              <div className="space-y-4">
                {visualAssignments.submitted.map((t) => (
                  <div key={t.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className="font-semibold text-sh6 text-black">{t.title}</div>
                    <div className="text-b9 text-blue-100 mt-1">
                      {t.subject}
                      {t.publishedAt ? ` | Published on ${prettyPublished(t.publishedAt)}` : ""}
                    </div>
                    <div className="mt-3 text-right">
                      <span className="text-b9 font-semibold text-blue-base">
                        Submitted on{" "}
                        {t.submittedAt ? format(t.submittedAt.toDate(), "dd MMM yyyy - HH:mm", { locale: indonesia }) : "09 Nov 2025 - 23:56"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Rekomendasi Bahan Belajar (By Lynx) */}
        <section className="mt-12">
          <div className="mb-4">
            <h2 className="text-sh3 font-bold text-black">Rekomendasi Bahan Belajar</h2>
            <p className="text-sh4 text-black font-normal">
              By{" "}
              <span className="font-extrabold bg-linear-to-r from-[#46C8FF] to-[#2A7899] bg-clip-text text-transparent">
                Lynx
              </span>
            </p>
          </div>

          <div className="space-y-4">
            <Link href="https://www.youtube.com/watch?v=E86ckq8yLUU" target="_blank" rel="noreferrer" className="block">
              <div className="rounded-2xl px-6 py-5 bg-[#3D5AFE] text-white shadow-[0_16px_30px_rgba(61,90,254,0.25)] hover:brightness-95 flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-sm">
                    {loadingLynx ? "20 Latihan Soal Teknik Pengintegralan Parsial" : lynxData?.recommendations?.[0]?.advice || "Video Tutorial Integral"}
                  </div>
                  <div className="text-[11px] opacity-85 mt-1">
                    {loadingLynx
                      ? "Kalkulus 1 Chapter 4: Integral Tentu"
                      : lynxData?.recommendations?.[0]?.subject
                      ? `${lynxData.recommendations[0].subject}`
                      : "Integral"}
                  </div>
                </div>
                <ArrowRight className="h-6 w-6" />
              </div>
            </Link>

            <Link href={lynxData?.recommendations?.[1]?.resource_link || "#"} target="_blank" rel="noreferrer" className="block">
              <div className="rounded-2xl px-6 py-5 bg-[#6C63FF] text-white shadow-[0_16px_30px_rgba(108,99,255,0.25)] hover:brightness-95 flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-sm">
                    {loadingLynx ? "FlashCards Fungsi Khusus Pada OOP" : lynxData?.recommendations?.[1]?.advice || "FlashCards Fungsi Khusus Pada OOP"}
                  </div>
                  <div className="text-[11px] opacity-85 mt-1">
                    {loadingLynx
                      ? "Dasar-Dasar Pemrograman | Chapter 8: Object Oriented Programming"
                      : lynxData?.recommendations?.[1]?.subject
                      ? `${lynxData.recommendations[1].subject}`
                      : "Dasar-Dasar Pemrograman | Chapter 8: Object Oriented Programming"}
                  </div>
                </div>
                <ArrowRight className="h-6 w-6" />
              </div>
            </Link>

            {errorLynx && (
              <div className="text-xs text-red-600 font-bold">
                {errorLynx}{" "}
                <button type="button" onClick={fetchLynxAnalysis} className="underline">
                  Refresh
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Floating Avatar */}
      <button
        type="button"
        className="fixed right-8 bottom-8 h-14 w-14 rounded-full bg-[#FFD54F] border-[6px] border-[#3D5AFE] shadow-[0_18px_40px_rgba(0,0,0,0.15)] flex items-center justify-center"
        aria-label="Profile"
        onClick={() => router.push("/chat")}
      >
        <span className="font-extrabold text-[#5D4037] text-lg">{safeInitial(userProfile?.displayName)}</span>
      </button>

      {/* Announcement Right Drawer */}
      {isAnnDrawerOpen && (
        <div className="fixed inset-0 z-[60]">
          <button type="button" aria-label="Close announcement" onClick={closeAnnouncementDrawer} className="absolute inset-0 bg-black/20" />

          <div className="absolute right-0 top-0 h-full w-[420px] max-w-[92vw] bg-white shadow-[0_18px_50px_rgba(0,0,0,0.18)] border-l border-gray-200 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-extrabold text-black text-lg leading-snug">
                    {activeAnnouncement?.title || "Revisi Berkas TK2 Kalkulus"}
                  </h3>

                  <p className="mt-1 text-sm text-black">
                    <span className="font-semibold text-blue-base">By {activeAnnouncement?.author || "Kalkulus 1 - Prof. Okky"}</span>
                    {" | "}
                    Published on{" "}
                    {activeAnnouncement?.publishedAt
                      ? format(activeAnnouncement.publishedAt.toDate(), "dd MMM yyyy - HH:mm", { locale: indonesia })
                      : "09 Nov 2025 - 09:30"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeAnnouncementDrawer}
                  className="h-9 w-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
                  aria-label="Close"
                >
                  <X className="h-5 w-5 text-gray-700" />
                </button>
              </div>

              <div className="mt-5 text-sm leading-relaxed text-black whitespace-pre-line">
                {activeAnnouncement?.content ||
                  activeAnnouncement?.excerpt ||
                  "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
              </div>

              <div className="mt-8">
                <div className="font-extrabold text-sm text-black mb-3">Lampiran</div>

                <div className="space-y-3">
                  {(activeAnnouncement?.attachments?.length ? activeAnnouncement.attachments : [{ name: "Lorem Ipsum.pdf", url: "#" }]).map(
                    (att, idx) => (
                      <div key={`${att.name}-${idx}`} className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-base" />
                        {att.url && att.url !== "#" ? (
                          <Link href={att.url} target="_blank" rel="noreferrer" className="text-blue-base underline text-sm">
                            {att.name}
                          </Link>
                        ) : (
                          <span className="text-blue-base text-sm">{att.name}</span>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}