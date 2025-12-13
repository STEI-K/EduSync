"use client"; // Wajib karena ini interaksi user (Client Component)

import { useState } from "react";

export default function TestCloudinary() {
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  const uploadToCloudinary = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    
    // Mengambil preset dari .env.local
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!); 

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      
      console.log("Sedang upload ke:", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`); // Debugging log

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        console.log("Upload Sukses!", data); // Cek Console browser (F12)
        setImage(data.secure_url);
        alert("Upload Berhasil! Cek folder techcomfest-2025 di Cloudinary.");
      } else {
        console.error("Gagal:", data);
        alert("Upload Gagal! Cek Console.");
      }
    } catch (error) {
      console.error("Error network:", error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "50px", border: "2px dashed red" }}>
      <h3>AREA TES CLOUDINARY (HAPUS NANTI)</h3>
      
      <input 
        type="file" 
        onChange={uploadToCloudinary} 
        disabled={loading}
      />
      
      {loading && <p>Loading...</p>}

      {image && (
        <div style={{ marginTop: "20px" }}>
          <p>Gambar berhasil di-host di:</p>
          <a href={image} target="_blank" style={{ color: "blue", textDecoration: "underline" }}>{image}</a>
          <br />
          <img src={image} alt="Preview" width="200" style={{ marginTop: "10px" }} />
        </div>
      )}
    </div>
  );
}