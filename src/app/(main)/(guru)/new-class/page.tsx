import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import TestCloudinary from "../components/TestCloudinary";

export default function NewClassPage() {
    return (
    <main>
      <h1>Project Hackathon</h1>
      {/* Tempel di sini buat ngetes */}
      <TestCloudinary />
    </main>
  );
}