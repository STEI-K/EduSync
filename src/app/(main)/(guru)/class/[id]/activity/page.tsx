"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, doc, updateDoc, serverTimestamp, addDoc } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid'; // Install dulu: npm i uuid @types/uuid

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, FileText, PlayCircle, Link as LinkIcon, MoreVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";

// --- TIPE DATA ---
interface Material {
  id: string;
  title: string;
  type: "video" | "pdf" | "link";
  url: string;
}
interface SubChapter {
  id: string;
  title: string;
  materials: Material[];
}
interface Chapter {
  id: string;
  title: string;
  subchapters: SubChapter[];
}
interface ModuleData {
  id: string;
  title: string;
  chapters: Chapter[];
}

export default function ClassActivityPage() {
  const { id: classId } = useParams();
  const router = useRouter();
  
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [loading, setLoading] = useState(true);

  // STATE MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'module' | 'chapter' | 'subchapter' | 'material' | null>(null);
  const [inputTitle, setInputTitle] = useState("");
  const [inputUrl, setInputUrl] = useState(""); // Untuk materi
  
  // STATE UNTUK TRACKING POSISI (Lagi edit module mana, chapter mana)
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);

  // --- 1. FETCH DATA ---
  const fetchModules = async () => {
    if (!classId) return;
    try {
      const q = query(collection(db, "classes", classId as string, "modules"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ModuleData[];
      setModules(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchModules(); }, [classId]);

  // --- 2. LOGIC BUKA MODAL ---
  const openModal = (type: 'module' | 'chapter' | 'subchapter' | 'material', modId?: string, chapId?: string, subId?: string) => {
    setModalType(type);
    setSelectedModuleId(modId || null);
    setSelectedChapterId(chapId || null);
    setSelectedSubId(subId || null);
    setInputTitle("");
    setInputUrl("");
    setIsModalOpen(true);
  };

  // --- 3. LOGIC SIMPAN (HEART OF THE APP) ---
  const handleSave = async () => {
    if (!inputTitle) return toast.error("Judul wajib diisi");

    try {
      // KASUS 1: BUAT MODULE BARU (Dokumen Baru)
      if (modalType === 'module') {
        await addDoc(collection(db, "classes", classId as string, "modules"), {
          title: inputTitle,
          chapters: [], // Array kosong awal
          createdAt: serverTimestamp()
        });
        toast.success("Modul berhasil dibuat");
      } 
      
      // KASUS 2: EDIT ISI MODULE (Update Dokumen Lama)
      else if (selectedModuleId) {
        // Cari module yang sedang diedit di state lokal
        const moduleIndex = modules.findIndex(m => m.id === selectedModuleId);
        if (moduleIndex === -1) return;

        // Clone object module biar aman diedit (Immutability)
        const updatedModule = { ...modules[moduleIndex] };
        
        if (modalType === 'chapter') {
          // Push Chapter Baru
          updatedModule.chapters.push({
            id: uuidv4(),
            title: inputTitle,
            subchapters: []
          });
        } 
        else if (modalType === 'subchapter' && selectedChapterId) {
          // Cari Chapter target -> Push Subchapter
          const chapIdx = updatedModule.chapters.findIndex(c => c.id === selectedChapterId);
          if (chapIdx !== -1) {
            updatedModule.chapters[chapIdx].subchapters.push({
              id: uuidv4(),
              title: inputTitle,
              materials: []
            });
          }
        }
        else if (modalType === 'material' && selectedChapterId && selectedSubId) {
           // Cari Subchapter target -> Push Material
           const chapIdx = updatedModule.chapters.findIndex(c => c.id === selectedChapterId);
           if (chapIdx !== -1) {
             const subIdx = updatedModule.chapters[chapIdx].subchapters.findIndex(s => s.id === selectedSubId);
             if (subIdx !== -1) {
               updatedModule.chapters[chapIdx].subchapters[subIdx].materials.push({
                 id: uuidv4(),
                 title: inputTitle,
                 type: "link", // Default link dulu biar simpel
                 url: inputUrl || "#"
               });
             }
           }
        }

        // UPDATE KE FIREBASE (Timpa field chapters)
        const moduleRef = doc(db, "classes", classId as string, "modules", selectedModuleId);
        await updateDoc(moduleRef, {
          chapters: updatedModule.chapters
        });
        
        toast.success(`Berhasil menambah ${modalType}`);
      }

      // Refresh data & Tutup Modal
      setIsModalOpen(false);
      fetchModules();

    } catch (error) {
      console.error("Gagal save:", error);
      toast.error("Terjadi kesalahan saat menyimpan");
    }
  };

  // --- 4. NAVIGASI KE ASSIGNMENT ---
  const goToAssignmentPage = (moduleId: string, chapterId: string, subchapterId: string) => {
    // Kita lempar ID-nya lewat URL Query Params agar page assignment tahu mau simpan dimana
    router.push(`/class/${classId}/activity/new-assignment?moduleId=${moduleId}&chapterId=${chapterId}&subId=${subchapterId}`);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Materi & Tugas</h1>
        <Button onClick={() => openModal('module')}>+ Tambah Modul</Button>
      </div>

      {modules.map((module) => (
        <div key={module.id} className="mb-6 border rounded-lg bg-white overflow-hidden shadow-sm">
          {/* HEADER MODUL */}
          <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
             <h2 className="text-lg font-bold text-blue-800">{module.title}</h2>
             <Button variant="ghost" size="sm" onClick={() => openModal('chapter', module.id)}>
                + Chapter
             </Button>
          </div>

          {/* LIST CHAPTERS */}
          <Accordion type="multiple" className="w-full">
            {module.chapters?.map((chapter) => (
              <AccordionItem key={chapter.id} value={chapter.id} className="px-4">
                <AccordionTrigger className="hover:no-underline">
                  <span className="font-semibold">{chapter.title}</span>
                </AccordionTrigger>
                
                <AccordionContent className="pl-4 pb-4">
                  {/* TOMBOL ADD SUBCHAPTER DI LEVEL CHAPTER */}
                  <div className="mb-4">
                     <Button 
                       variant="outline" className="text-xs h-7"
                       onClick={() => openModal('subchapter', module.id, chapter.id)}
                     >
                       + Sub Bab
                     </Button>
                  </div>

                  {/* LIST SUBCHAPTERS */}
                  <div className="space-y-6 border-l-2 border-gray-100 pl-4 ml-2">
                    {chapter.subchapters?.map((sub) => (
                      <div key={sub.id}>
                        <div className="flex justify-between items-center mb-2">
                           <h4 className="font-medium text-gray-700">{sub.title}</h4>
                           <div className="flex gap-2">
                              {/* Add Material (Modal) */}
                              <Button 
                                variant="ghost" size="icon" className="h-6 w-6" 
                                onClick={() => openModal('material', module.id, chapter.id, sub.id)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                              {/* Add Assignment (Page Baru) */}
                              <Button 
                                variant="ghost" className="text-[10px] h-6 bg-blue-50 text-blue-600"
                                onClick={() => goToAssignmentPage(module.id, chapter.id, sub.id)}
                              >
                                + Tugas
                              </Button>
                           </div>
                        </div>

                        {/* LIST MATERIALS */}
                        <div className="grid gap-2">
                          {sub.materials?.map((mat) => (
                            <div key={mat.id} className="flex items-center gap-2 p-2 rounded bg-gray-50 border text-sm">
                               <FileText className="w-4 h-4 text-blue-500" />
                               <a href={mat.url} target="_blank" className="hover:underline flex-1">
                                 {mat.title}
                               </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}

      {/* --- SATU MODAL UNTUK SEMUA --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
           <DialogHeader>
             <DialogTitle className="capitalize">Tambah {modalType}</DialogTitle>
           </DialogHeader>
           
           <div className="space-y-4 py-4">
              <div className="grid gap-2">
                 <Label>Judul</Label>
                 <Input 
                   value={inputTitle} 
                   onChange={(e) => setInputTitle(e.target.value)} 
                   placeholder={`Masukkan nama ${modalType}...`}
                 />
              </div>
              
              {modalType === 'material' && (
                <div className="grid gap-2">
                   <Label>URL File / Link</Label>
                   <Input 
                     value={inputUrl} 
                     onChange={(e) => setInputUrl(e.target.value)} 
                     placeholder="https://..."
                   />
                </div>
              )}
           </div>

           <DialogFooter>
              <Button onClick={handleSave}>Simpan</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}