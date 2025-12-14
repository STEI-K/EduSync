"use client";

<<<<<<< HEAD
import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Bell, Search, FileText, Plus } from "lucide-react";
=======
import { useEffect, useState, useRef } from "react";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc,
  updateDoc,
  serverTimestamp,
  doc,
  getDoc
} from "firebase/firestore";
import { toast } from "sonner"; 
import { useRouter } from "next/navigation";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Bell, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Plus
} from "lucide-react";
>>>>>>> a700e47c5e99b63bbb6e456c3610284f48f317b3
import { cn } from "@/lib/utils";

type Attachment = { name: string; url: string };
type Status = "On Going" | "Submitted" | "Graded";

type Assignment = {
  id: string;
  tag: string; // "Kalkulus 1"
  title: string;
  publishedAt: string; // "Published on 09 Nov 2025 - 09:30"
  deadlineText: string; // "Deadline on 18 Nov 2025 - 23:59"
  instructions: string;
  attachments: Attachment[];
  submissionStatusLabel: string; // "No Attempt" / "Submitted" / etc
  timeRemaining: string; // "8 days 14 hours 30 mins"
  primaryActionLabel: string; // "Add Submission"
};

type ClassCard = {
  id: string;
  title: string;
  teacher: string;
  theme: "blue" | "purple" | "yellow";
  illustration: "matdis" | "ddp" | "kalkulus";
};

<<<<<<< HEAD
export default function MyAssignmentsHardcodedPage() {
  const data = useMemo(() => {
    const assignments: Assignment[] = [
      {
        id: "a1",
        tag: "Kalkulus 1",
        title: "Tugas Kelompok 2 Kalkulus",
        publishedAt: "Published on 09 Nov 2025 - 09:30",
        deadlineText: "Deadline on 18 Nov 2025 - 23:59",
        instructions:
          "Setiap kelompok mengerjakan tugas sebanyak 3 (tiga) topik, perhatikan topik mana saja yang kelompok Anda harus kerjakan. Berikut petunjuk pengerjaan tugas:\n\n" +
          "a. Kerjakan secara manual (tulis tangan di kertas HVS A4) dan terperinci dengan mengimplementasikan konsep turunan yang telah dipelajari dalam menyelesaikan soal yang diberikan. Untuk jawaban desimal yang didapat, lakukan pembulatan sampai 4 angka di belakang koma. Berikan rubrik penilaian rinci untuk jawaban Anda dengan total nilai 100.\n\n" +
          "b. Kerjakan dengan large language model (LLM) dan bandingkan hasilnya dengan hasil manual Anda. Berikut adalah lampiran pembagian kelompok dan soal yang harus dikerjakan.",
        attachments: [
          { name: "Pembagian Kelompok.pdf", url: "#" },
          { name: "Soal TK2 Kalkulus Sem Gasal.pdf", url: "#" },
        ],
        submissionStatusLabel: "No Attempt",
        timeRemaining: "8 days 14 hours 30 mins",
        primaryActionLabel: "Add Submission",
      },
      // duplikasi list kiri biar mirip screenshot
      {
        id: "a2",
        tag: "Kalkulus 1",
        title: "Tugas Kelompok 2 Kalkulus",
        publishedAt: "Published on 09 Nov 2025 - 09:30",
        deadlineText: "Deadline on 18 Nov 2025 - 23:59",
        instructions:
          "Instruksi tugas sama seperti di atas. (Dummy content untuk tampilan list)",
        attachments: [{ name: "Material.pdf", url: "#" }],
        submissionStatusLabel: "No Attempt",
        timeRemaining: "8 days 14 hours 30 mins",
        primaryActionLabel: "Add Submission",
      },
      {
        id: "a3",
        tag: "Kalkulus 1",
        title: "Tugas Kelompok 2 Kalkulus",
        publishedAt: "Published on 09 Nov 2025 - 09:30",
        deadlineText: "Deadline on 18 Nov 2025 - 23:59",
        instructions:
          "Instruksi tugas sama seperti di atas. (Dummy content untuk tampilan list)",
        attachments: [{ name: "Material.pdf", url: "#" }],
        submissionStatusLabel: "No Attempt",
        timeRemaining: "8 days 14 hours 30 mins",
        primaryActionLabel: "Add Submission",
      },
      {
        id: "a4",
        tag: "Kalkulus 1",
        title: "Tugas Kelompok 2 Kalkulus",
        publishedAt: "Published on 09 Nov 2025 - 09:30",
        deadlineText: "Deadline on 18 Nov 2025 - 23:59",
        instructions:
          "Instruksi tugas sama seperti di atas. (Dummy content untuk tampilan list)",
        attachments: [{ name: "Material.pdf", url: "#" }],
        submissionStatusLabel: "No Attempt",
        timeRemaining: "8 days 14 hours 30 mins",
        primaryActionLabel: "Add Submission",
      },
      {
        id: "a5",
        tag: "Kalkulus 1",
        title: "Tugas Kelompok 2 Kalkulus",
        publishedAt: "Published on 09 Nov 2025 - 09:30",
        deadlineText: "Deadline on 18 Nov 2025 - 23:59",
        instructions:
          "Instruksi tugas sama seperti di atas. (Dummy content untuk tampilan list)",
        attachments: [{ name: "Material.pdf", url: "#" }],
        submissionStatusLabel: "No Attempt",
        timeRemaining: "8 days 14 hours 30 mins",
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
        teacher: "Prof. Rahel Meilinda Aruan",
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
=======
// 🆕 Interface untuk My Class
interface ClassData {
  id: string;
  name: string;
  code: string;
  description?: string;
  imageUrl?: string;
  studentCount: number;
  teacherName?: string;
}

export default function MyAssignmentsPage() {
  const { user, loading: userLoading } = useUserProfile();
  const router = useRouter();
  
  // State Assignments
  const [assignments, setAssignments] = useState<AssignmentUI[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentUI | null>(null);
  const [filterStatus, setFilterStatus] = useState<"On Going" | "Submitted" | "Graded">("On Going");

  // 🆕 State Classes
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  // Ref untuk input file
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 2. DATA FETCHING ASSIGNMENTS ---
  useEffect(() => {
    const fetchData = async () => {
      // Tunggu user profile loaded
      if (!user || !user.uid || !user.daftarKelas) {
        if (!userLoading) setLoadingData(false);
        return;
      }
>>>>>>> a700e47c5e99b63bbb6e456c3610284f48f317b3

  const [filter, setFilter] = useState<Status>("On Going");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>(data.assignments[0]?.id || "");

  const filtered = useMemo(() => {
    // hardcoded: filter hanya buat UI (supaya pill terasa hidup)
    const base = data.assignments.filter((a) =>
      a.title.toLowerCase().includes(search.toLowerCase())
    );
    // status ga beneran dipakai di data hardcoded, jadi biar realistis:
    if (filter === "On Going") return base;
    if (filter === "Submitted") return base.slice(0, Math.max(1, Math.floor(base.length / 2)));
    return base.slice(0, 1);
  }, [data.assignments, filter, search]);

  const selected = useMemo(() => {
    return data.assignments.find((a) => a.id === selectedId) || data.assignments[0];
  }, [data.assignments, selectedId]);

<<<<<<< HEAD
  const COLOR = {
    bg: "bg-[#F6F7FB]",
    hero: "text-[#B8B6FF]",
    pillShadow: "shadow-[0_18px_40px_rgba(0,0,0,0.10)]",
    panelShadow: "shadow-[0_18px_40px_rgba(0,0,0,0.08)]",
    olive: { active: "bg-[#80711A]", idle: "bg-[#B7A21F]" },
    blueBtn: "bg-[#3D5AFE] hover:bg-[#2F49E8]",
=======
          chaptersSnap.docs.forEach((chapterDoc) => {
            const chapterData = chapterDoc.data();
            
            // 3. Loop Subchapters Array
            if (chapterData.subchapters && Array.isArray(chapterData.subchapters)) {
              chapterData.subchapters.forEach((sub: any) => {
                
                // 4. Loop Assignments Array
                if (sub.assignments && Array.isArray(sub.assignments)) {
                  sub.assignments.forEach((assign: AssignmentFromDB) => {
                    
                    // Filter: Hanya tampilkan jika status published (atau tidak ada status)
                    if (assign.status === "published" || !assign.status) {
                      
                      // Convert single url string ke array object attachment agar UI rapi
                      const attachmentsList: Attachment[] = assign.questionFileUrl 
                        ? [{ name: "Material.pdf", url: assign.questionFileUrl, type: "file" }]
                        : [];

                      classAssignments.push({
                        id: assign.id,
                        classId: classId,
                        className: className,
                        title: assign.title,
                        instructions: assign.description || "No instructions provided.",
                        dueDate: assign.deadline || null,
                        createdAt: assign.publishedAt || new Date().toISOString(),
                        attachments: attachmentsList,
                        points: 100, // Default score max
                        submissionStatus: "On Going" // Default sebelum di-merge
                      });
                    }
                  });
                }
              });
            }
          });
          return classAssignments;
        });

        // Tunggu semua kelas selesai diloop
        const nestedAssignmentsResult = (await Promise.all(assignmentsPromises)).flat();

        // B. AMBIL DATA SUBMISSIONS (ROOT COLLECTION)
        // Cukup satu query simpel ke root collection 'submissions' berdasarkan studentId
        const qSubmissions = query(
          collection(db, "submissions"),
          where("studentId", "==", user.uid)
        );
        const snapSubmissions = await getDocs(qSubmissions);
        const mySubmissions = snapSubmissions.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubmissionData));

        // C. MERGE DATA (GABUNGKAN)
        const finalData: AssignmentUI[] = nestedAssignmentsResult.map((assign) => {
          // Cari apakah ada submission untuk assignmentId ini
          const sub = mySubmissions.find((s) => s.assignmentId === assign.id);
          
          let status: "On Going" | "Submitted" | "Graded" = "On Going";
          if (sub) {
            status = sub.status === "GRADED" ? "Graded" : "Submitted";
          }

          return {
            ...assign,
            submissionStatus: status,
            submissionId: sub?.id,
            myScore: sub?.score,
            submittedAt: sub?.submittedAt,
            submittedFileName: sub?.fileName,
            submittedFileUrl: sub?.fileUrl
          };
        });

        // Sort by Deadline (Terdekat dulu)
        finalData.sort((a, b) => {
            const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
            const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
            return dateA - dateB;
        });

        setAssignments(finalData);
        
        // Auto-select logic
        if (finalData.length > 0) {
           // Coba pilih yang masih On Going dulu, kalau gak ada ambil yang pertama
           const firstPriority = finalData.find(f => f.submissionStatus === "On Going") || finalData[0];
           setSelectedAssignment(firstPriority);
        }

      } catch (error) {
        console.error("Error fetching assignments:", error);
        toast.error("Gagal memuat daftar tugas.");
      } finally {
        setLoadingData(false);
      }
    };

    if (!userLoading) {
        fetchData();
    }
  }, [user, userLoading]);

  // 🆕 DATA FETCHING CLASSES
  useEffect(() => {
    const fetchClasses = async () => {
      if (!user || !user.daftarKelas) {
        setLoadingClasses(false);
        return;
      }
      
      try {
        // Loop setiap classId di daftarKelas user
        const classesPromises = user.daftarKelas.map(async (classId: string) => {
          const classRef = doc(db, 'classes', classId);
          const classSnap = await getDoc(classRef);
          
          if (classSnap.exists()) {
            return {
              id: classSnap.id,
              ...classSnap.data()
            } as ClassData;
          }
          return null;
        });

        const results = await Promise.all(classesPromises);
        const validClasses = results.filter((cls): cls is ClassData => cls !== null);
        
        setClasses(validClasses);
      } catch (err) {
        console.error("Gagal mengambil data kelas:", err);
      } finally {
        setLoadingClasses(false);
      }
    };

    if (!userLoading) {
      fetchClasses();
    }
  }, [user, userLoading]);

  // --- 3. SUBMISSION LOGIC (ROOT COLLECTION + CHECK EXISTING) ---
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedAssignment || !user) return;

    if (file.size > 10 * 1024 * 1024) { 
      toast.error("File terlalu besar (Maks 10MB)");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload ke Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");
      
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) throw new Error("Cloudinary Config Missing");

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        { method: "POST", body: formData }
      );

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error?.message || "Gagal upload ke server");
      }

      const uploadData = await uploadRes.json();
      const realFileUrl = uploadData.secure_url; 
      
      // 2. Cek apakah submission sudah ada (untuk Update) atau belum (untuk Create)
      // Query ke ROOT collection 'submissions'
      const qExisting = query(
        collection(db, "submissions"),
        where("assignmentId", "==", selectedAssignment.id),
        where("studentId", "==", user.uid)
      );
      const existingSnap = await getDocs(qExisting);

      let submissionDocId = "";

      if (!existingSnap.empty) {
        // CASE: UPDATE (Sudah pernah submit, ganti file)
        const oldDoc = existingSnap.docs[0];
        submissionDocId = oldDoc.id;
        
        await updateDoc(doc(db, "submissions", submissionDocId), {
            fileUrl: realFileUrl,
            fileName: file.name,
            submittedAt: serverTimestamp(),
            status: "SUBMITTED" // Reset status jadi submitted jika sebelumnya graded/late
        });
        toast.success("Submission updated successfully!");
      } else {
        // CASE: CREATE (Baru pertama kali submit)
        const newSubmission: Omit<SubmissionData, 'id'> = {
            assignmentId: selectedAssignment.id,
            studentId: user.uid,
            studentName: user.nama || "Student",
            status: "SUBMITTED",
            submittedAt: serverTimestamp(),
            fileUrl: realFileUrl,
            fileName: file.name
        };
        const docRef = await addDoc(collection(db, "submissions"), newSubmission);
        submissionDocId = docRef.id;
        toast.success("Assignment submitted successfully!");
      }

      // 3. Optimistic UI Update (Tanpa reload page)
      const updatedAssignment: AssignmentUI = {
        ...selectedAssignment,
        submissionStatus: "Submitted",
        submissionId: submissionDocId,
        submittedFileName: file.name,
        submittedFileUrl: realFileUrl,
        submittedAt: new Date()
      };

      setAssignments(prev => 
        prev.map(a => a.id === selectedAssignment.id ? updatedAssignment : a)
      );
      setSelectedAssignment(updatedAssignment);
      setFilterStatus("Submitted");

    } catch (error: any) {
      console.error("Gagal submit:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
>>>>>>> a700e47c5e99b63bbb6e456c3610284f48f317b3
  };

  return (
<<<<<<< HEAD
    <div className={cn("min-h-screen", COLOR.bg)}>
      <div className="mx-20 px-6 py-10">
        {/* HERO + SEARCH */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <h1 className={cn("text-[44px] md:text-[54px] font-extrabold leading-none", COLOR.hero)}>
            Let&rsquo;s Back On Track!
          </h1>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-[420px]">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Material"
=======
    <div className="min-h-screen bg-[#F8F9FC] p-6 md:p-12 font-sans">
      
      {/* ========== SECTION 1: MY ASSIGNMENTS ========== */}
      <div className="flex flex-col gap-8 mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <h1 className="text-[42px] font-bold text-blue-base tracking-tight leading-none">
                Let&rsquo;s Back On Track!
            </h1>

            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-[400px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                        placeholder="Search Material" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 py-6 rounded-[20px] bg-white border-none shadow-sm text-sm"
                    />
                </div>
            </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mt-4">
            <h2 className="text-2xl font-bold text-black">My Assignments</h2>
            
            <div className="flex gap-3 bg-transparent">
                {(["On Going", "Submitted", "Graded"] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => {
                            setFilterStatus(status);
                            const first = assignments.find(a => a.submissionStatus === status);
                            setSelectedAssignment(first || null);
                        }}
                        className={cn(
                            "px-6 py-2 rounded-full text-sm font-bold transition-all",
                            filterStatus === status 
                                ? "bg-[#80711A] text-white shadow-md" 
                                : "bg-[#D4BB2B] text-white hover:bg-[#80711A]/80"
                        )}
                    >
                        {status}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* CONTENT GRID - ASSIGNMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-20">
        
        {/* LEFT COLUMN: LIST TUGAS */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300"/>
                <p className="text-gray-400 text-sm">No assignments found</p>
            </div>
          ) : (
            filteredAssignments.map((assign) => (
              <div
                key={assign.id}
                onClick={() => setSelectedAssignment(assign)}
>>>>>>> a700e47c5e99b63bbb6e456c3610284f48f317b3
                className={cn(
                  "h-11 w-full rounded-full bg-white border-none outline-none px-5 pr-12 text-sm",
                  COLOR.pillShadow
                )}
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>

            <button
              type="button"
              className={cn("h-11 w-11 rounded-full bg-white flex items-center justify-center", COLOR.pillShadow)}
              aria-label="notifications"
            >
              <Bell className="h-5 w-5 text-[#3D5AFE]" />
            </button>
          </div>
        </div>

        {/* TITLE + FILTER */}
        <div className="mt-10 flex items-center justify-between">
          <h2 className="text-3xl font-extrabold text-black">My Assignments</h2>

          <div className="flex items-center gap-3">
            {(["On Going", "Submitted", "Graded"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  "px-5 py-2 rounded-full text-[12px] font-extrabold text-white transition-all",
                  filter === s
                    ? cn(COLOR.olive.active, "shadow-[0_10px_22px_rgba(128,113,26,0.35)]")
                    : cn(COLOR.olive.idle, "hover:brightness-95")
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* GRID */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT LIST */}
          <div className="lg:col-span-4">
            <div className={cn("bg-white p-6", COLOR.panelShadow)}>
              <div className="max-h-[520px] overflow-auto pr-2">
                <div className="space-y-5">
                  {filtered.map((a) => {
                    const active = a.id === selected?.id;
                    return (
                      <button
                        key={a.id}
                        onClick={() => setSelectedId(a.id)}
                        className={cn(
                          "w-full text-left rounded-xl px-4 py-3 transition",
                          active ? "bg-[#F5F7FF]" : "hover:bg-[#FAFBFF]"
                        )}
                        type="button"
                      >
                        <div className="mb-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#3D5AFE] text-white text-[10px] font-extrabold">
                            {a.tag}
                          </span>
                        </div>

                        <div className="text-[14px] font-extrabold text-[#4A4A4A] leading-snug">
                          {a.title}
                        </div>
                        <div className="mt-1 text-[10px] text-gray-500 font-medium">{a.publishedAt}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT DETAIL */}
          <div className="lg:col-span-8">
            <div className={cn("bg-white  p-10", COLOR.panelShadow, "min-h-[520px]")}>
              <div className="mb-6">
                <h3 className="text-[18px] md:text-[20px] font-extrabold text-black">{selected.title}</h3>
                <p className="mt-1 text-[12px] text-gray-600 font-medium">{selected.deadlineText}</p>
              </div>

              <div className="text-[12px] text-[#4A4A4A] leading-relaxed whitespace-pre-line">
                {selected.instructions}
              </div>

              <div className="mt-6 space-y-2">
                {selected.attachments.map((f, idx) => (
                  <a
                    key={idx}
                    href={f.url}
                    className="flex items-center gap-2 text-[12px] text-black font-medium hover:underline w-fit"
                  >
                    <FileText className="w-4 h-4 text-black" />
                    {f.name}
                  </a>
                ))}
              </div>

              <div className="mt-8 border-t border-gray-300/60" />

              <div className="mt-6">
                <div className="w-full border border-gray-300/70">
                  <div className="grid grid-cols-[220px_1fr]">
                    <div className="border-b border-gray-300/70 px-4 py-3 text-[12px] font-extrabold text-black">
                      Submission Status
                    </div>
                    <div className="border-b border-gray-300/70 px-4 py-3 text-[12px] font-medium text-black">
                      {selected.submissionStatusLabel}
                    </div>

                    <div className="px-4 py-3 text-[12px] font-extrabold text-black">Time Remaining</div>
                    <div className="px-4 py-3 text-[12px] font-medium text-black">{selected.timeRemaining}</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  className={cn(
                    "rounded-md px-6 py-2 text-[12px] font-bold text-white inline-flex items-center gap-2",
                    COLOR.blueBtn,
                    "shadow-[0_14px_30px_rgba(61,90,254,0.25)]"
                  )}
                >
                  <Plus className="w-4 h-4" />
                  {selected.primaryActionLabel}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MY CLASS */}
        <div className="mt-16">
          <h2 className="text-3xl font-extrabold text-black mb-8">My Class</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.classes.map((c) => (
              <div
                key={c.id}
                className={cn("bg-white rounded-2xl p-8 text-center", "shadow-[0_18px_40px_rgba(0,0,0,0.08)]")}
              >
                <div
                  className={cn(
                    "text-[20px] font-extrabold mb-1 whitespace-pre-line",
                    c.theme === "blue" ? "text-[#3D5AFE]" : c.theme === "purple" ? "text-[#6C63FF]" : "text-[#80711A]"
                  )}
                >
                  {c.title}
                </div>

                <div className="text-[11px] text-gray-600 font-semibold mb-6">{c.teacher}</div>

                {/* Illustration placeholder: kalau belum ada asset, pakai svg sederhana biar tetap bagus */}
                <div className="h-[160px] flex items-center justify-center mb-6">
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

                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center justify-center w-full h-11 rounded-xl font-extrabold text-[13px]",
                    c.theme === "blue"
                      ? "bg-[#3D5AFE] text-white hover:bg-[#2F49E8]"
                      : c.theme === "purple"
                      ? "bg-[#6C63FF] text-white hover:bg-[#594FF2]"
                      : "bg-[#FFD54F] text-[#5A4F14] hover:brightness-95"
                  )}
                >
                  Enter Class
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* bottom padding */}
        <div className="h-10" />
      </div>

      {/* ========== SECTION 2: MY CLASS ========== */}
      <div className="border-t-2 border-gray-200 pt-16 mt-16">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-bold text-black">My Class</h2>
        </div>

        {loadingClasses ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-[12px]" />
            ))}
          </div>
        ) : classes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {classes.map((cls) => (
              <div 
                key={cls.id} 
                onClick={() => router.push(`/class/${cls.id}`)}
                className="rounded-[12px] px-7 py-8 shadow-sm hover:shadow-md hover:scale-105 transition-all bg-white group cursor-pointer relative overflow-hidden flex flex-col gap-5"
              >
                {/* Nama Kelas */}
                <h3 className="text-sh3 font-semibold text-blue-base transition-colors line-clamp-1">
                  {cls.name}
                </h3>

                {/* Logo Kelas */}
                <div className="flex justify-center items-center">
                  {cls.imageUrl ? (
                    <img 
                      src={cls.imageUrl} 
                      alt="Class Logo" 
                      className="w-20 h-20 rounded-[12px] object-cover border" 
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-[12px] bg-gray-100 flex items-center justify-center text-2xl">
                      📚
                    </div>
                  )}
                </div>

                {/* Info Tambahan */}
                <div className="text-center mt-2">
                  <p className="text-xs text-gray-500 font-medium">
                    Taught by {cls.teacherName || "Teacher"}
                  </p>
                </div>

                {/* Enter Class Button */}
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2 mt-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/class/${cls.id}`);
                  }}
                >
                  Enter Class
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full mx-auto flex items-center justify-center text-3xl mb-4">
              🎒
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Belum Ada Kelas
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6 text-sm">
              Kamu belum bergabung ke kelas manapun. Dapatkan kode kelas dari gurumu!
            </p>
            <Button 
              onClick={() => router.push('/dashboard-murid')} 
              className="bg-blue-base hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg"
            >
              Kembali ke Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
<<<<<<< HEAD
=======
}

function AssignmentsSkeleton() {
    return (
        <div className="min-h-screen bg-[#F8F9FC] p-6 md:p-12">
            <div className="flex justify-between mb-10">
                <Skeleton className="h-12w-64 rounded-xl" />
<div className="flex gap-2">
<Skeleton className="h-12 w-12 rounded-full" />
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-12 gap-8">
<div className="md:col-span-4 space-y-4">
{[1, 2, 3].map((i) => (
<Skeleton key={i} className="h-32 w-full rounded-2xl" />
))}
</div>
<div className="md:col-span-8">
<Skeleton className="h-[600px] w-full rounded-[30px]" />
</div>
</div>
</div>
)
>>>>>>> a700e47c5e99b63bbb6e456c3610284f48f317b3
}