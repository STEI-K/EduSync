"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { Phone, Mail, CalendarDays, Lock, PencilLine } from "lucide-react";

type StudentProfile = {
  name: string;
  studentId: string; // NIS / NIM
  avatarUrl?: string | "/null_profile.png";

  phone?: string | null;
  email?: string | null;
  birthDate?: string | null; // format bebas: "08 January 1990"
  passwordMasked?: string | null; // default: "••••••••••••"
};

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function initialFromName(name: string) {
  const t = name.trim();
  return t ? t[0].toUpperCase() : "S";
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="w-full rounded-2xl bg-[#F6F6F6] shadow-[0_14px_28px_rgba(0,0,0,0.08)] px-8 py-5 flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <span className="text-[13px] font-extrabold text-[#8A7A2A]">{label}</span>
        <span className="text-[16px] font-extrabold text-[#3D3D3D]">{value}</span>
      </div>

      <div className="h-12 w-12 rounded-xl bg-transparent flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}

export default function StudentProfilePage() {
  /**
   * UI ONLY.
   * Integrasi logic kamu tinggal ganti object `profile` dari:
   * - Firebase userProfile / firestore
   * - props / server fetch
   */
  const profile: StudentProfile = useMemo(
    () => ({
      name: "Tania Ju",
      studentId: "2005485499324",
      avatarUrl: "/null_profile.png", // ganti URL avatar kamu, atau null
      phone: "0816123123123",
      email: "tanialovesiapa@gmail.com",
      birthDate: "08 January 1990",
      passwordMasked: "••••••••••••••••",
    }),
    []
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F4F6F8]">
      {/* container */}
      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Center block */}
        <div className="flex flex-col items-center">
          {/* Avatar big */}
          <div className="relative w-[170px] h-[170px] rounded-full overflow-hidden bg-[#E7E7E7] shadow-[0_18px_40px_rgba(0,0,0,0.10)]">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt="Profile"
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-5xl font-extrabold text-gray-600">
                  {initialFromName(profile.name)}
                </span>
              </div>
            )}
          </div>

          {/* Name + ID */}
          <div className="mt-8 text-center">
            <h1 className="text-[34px] font-extrabold text-[#9B8A2D] leading-tight">
              {profile.name}
            </h1>
            <p className="mt-2 text-[28px] font-medium text-[#3D3D3D] tracking-wide">
              {profile.studentId}
            </p>
          </div>

          {/* Info cards */}
          <div className="mt-10 w-full max-w-3xl space-y-5">
            <InfoRow
              label="No Telepon"
              value={profile.phone || "-"}
              icon={<Phone className="h-7 w-7 text-[#5A4F14]" />}
            />
            <InfoRow
              label="E-mal Address"
              value={profile.email || "-"}
              icon={<Mail className="h-7 w-7 text-[#111111]" />}
            />
            <InfoRow
              label="Birth Date"
              value={profile.birthDate || "-"}
              icon={<CalendarDays className="h-7 w-7 text-[#111111]" />}
            />
            <InfoRow
              label="Password"
              value={profile.passwordMasked || "••••••••"}
              icon={<Lock className="h-7 w-7 text-[#111111]" />}
            />
          </div>

          {/* Edit button + small bubble */}
          <div className="relative mt-10 flex items-center justify-center">
            <button
              type="button"
              className={cn(
                "h-12 px-10 rounded-xl bg-[#FFD54F] hover:brightness-95 active:scale-[0.99] transition",
                "shadow-[0_14px_30px_rgba(0,0,0,0.10)]",
                "flex items-center gap-3"
              )}
              onClick={() => {
                // UI only: ganti ke router.push('/profile/edit') kalau perlu
                alert("Edit Profile clicked (UI only).");
              }}
            >
              <PencilLine className="h-5 w-5 text-[#5A4F14]" />
              <span className="text-[16px] font-extrabold text-[#5A4F14]">
                Edit Profile
              </span>
            </button>

            {/* bubble kecil kanan bawah seperti screenshot */}
            <div className="absolute -right-8 -top-6 h-16 w-16 rounded-full bg-[#FFD54F] border-[8px] border-[#3D5AFE] shadow-[0_16px_30px_rgba(0,0,0,0.18)] flex items-center justify-center">
              <span className="text-[18px] font-extrabold text-[#5A4F14]">
                {initialFromName(profile.name)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}