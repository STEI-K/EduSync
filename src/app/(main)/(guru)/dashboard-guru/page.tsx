'use client';

import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ClassData {
  id: string;
  name: string;
  code: string;
  description?: string;
  studentCount: number;
}

export default function DashboardMurid() {
  // Panggil hook sakti kita
  const { user, loading, error } = useUserProfile();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);



  useEffect(() => {
    if (!user) return;

    const fetchClasses = async () => {
      try {
        // LOGIKA UTAMA: Query ke Firestore
        // "Ambil dari collection 'classes', dimana 'teacherId' == user.uid"
        const q = query(
          collection(db, 'classes'),
          where('teacherId', '==', user.uid)
          // orderBy('createdAt', 'desc') // Opsional: Biar yang baru dibuat ada di paling atas (Wajib bikin Composite Index di Firebase Console dulu kalau error)
        );

        const querySnapshot = await getDocs(q);
        
        // Mapping data dari snapshot ke array object
        const classList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ClassData));

        setClasses(classList);
      } catch (err) {
        console.error("Gagal mengambil data kelas:", err);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [user]); // Jalankan ulang kalau user berubah (misal baru login)

    // 1. Handle Loading (Wajib ada biar gak error 'cannot read property of null')
  if (loading) {
    return <div className="p-10">Sedang memuat data murid...</div>;
  }

  // 2. Handle Error atau User Kosong (Proteksi)
  if (error) return <div className="text-red-500">{error}</div>;
  if (!user) return <div>Anda belum login.</div>;
  // 3. Render UI Utama
  return (
    <div className="px-20 flex flex-col justify-center items-center">
      <header className="mb-8 text-sh2 font-bold w-fit
                    bg-linear-to-r from-blue-20 via-blue-40 to-blue-base
                    bg-clip-text text-transparent
                    text-center"
      >
        <h1>Good Morning,</h1>
        <p>Prof. {user.nama}!</p>
      </header>

      {classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div key={cls.id} className="border rounded-xl p-6 shadow-sm hover:shadow-md transition-all bg-white group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                {/* Kode Kelas (Badge) */}
                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                  {cls.code}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                {cls.name}
              </h3>
              <p className="text-gray-500 text-sm line-clamp-2 mb-6">
                {cls.description || "Tidak ada deskripsi"}
              </p>

              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <span>{cls.studentCount || 0} Murid</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div>

          </div>
          <h3 className="text-xl font-semibold text-gray-800">Belum ada kelas</h3>
          <p className="text-gray-500 max-w-sm mt-2 mb-6">
            Anda belum membuat kelas apapun. Mulai mengajar dengan membuat kelas pertama Anda.
          </p>
          <Button variant="outline">Buat Kelas Sekarang</Button>
        </div>
      )}
      <section>
        
      </section>
    </div>
  );
}