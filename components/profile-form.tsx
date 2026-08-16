"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle2, ImagePlus, LoaderCircle } from "lucide-react";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface ProfileFormProps {
  initialName: string;
  initialPhone: string;
  initialLocation: string;
  initialBio: string;
  initialAvatarUrl?: string;
}

export function ProfileForm({
  initialName,
  initialPhone,
  initialLocation,
  initialBio,
  initialAvatarUrl = "",
}: ProfileFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewObjectUrl = useRef<string | null>(null);
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [location, setLocation] = useState(initialLocation);
  const [bio, setBio] = useState(initialBio);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [avatarPreview, setAvatarPreview] = useState(initialAvatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  useEffect(() => {
    return () => {
      if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);
    };
  }, []);

  const handleAvatarSelect = (file: File | undefined) => {
    setAvatarError(null);
    setFeedback(null);

    if (!file) return;
    if (!AVATAR_TYPES.includes(file.type)) {
      setAvatarError("Escolha uma imagem JPG, PNG ou WebP.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("A foto deve ter no máximo 2 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);
    previewObjectUrl.current = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarPreview(previewObjectUrl.current);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    setUploadingAvatar(true);
    setAvatarError(null);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append("file", avatarFile);
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Não foi possível atualizar a foto.");

      const nextAvatarUrl = data.user?.avatarUrl || avatarPreview;
      setAvatarUrl(nextAvatarUrl);
      setAvatarPreview(nextAvatarUrl);
      setAvatarFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFeedback({ type: "success", text: "Foto de perfil atualizada com sucesso." });
      router.refresh();
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Erro ao enviar a foto.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, location, bio }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Falha ao salvar");
      }
      setFeedback({ type: "success", text: "Perfil atualizado com sucesso." });
      router.refresh();
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Erro ao salvar perfil",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-gray-200 bg-gray-50/80 p-5 sm:p-6" aria-labelledby="avatar-title">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-red-100 ring-4 ring-white shadow-sm">
            {avatarPreview || avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPreview || avatarUrl} alt="Prévia da foto de perfil" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-red-600">
                <ImagePlus size={32} aria-hidden="true" />
              </div>
            )}
            <span className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow" aria-hidden="true">
              <Camera size={14} />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <h4 id="avatar-title" className="text-base font-semibold text-gray-900">Foto de perfil</h4>
            <p className="mt-1 text-sm leading-6 text-gray-600">Use uma imagem clara para identificar sua conta. JPG, PNG ou WebP de até 2 MB.</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label htmlFor="avatar-file" className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-red-300 hover:text-red-700 focus-within:ring-2 focus-within:ring-red-200">
                <Camera size={16} aria-hidden="true" />
                Escolher foto
              </label>
              <input
                ref={fileInputRef}
                id="avatar-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => handleAvatarSelect(event.target.files?.[0])}
              />
              {avatarFile && (
                <button
                  type="button"
                  onClick={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
                >
                  {uploadingAvatar ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <CheckCircle2 size={16} aria-hidden="true" />}
                  {uploadingAvatar ? "Enviando foto..." : "Salvar foto"}
                </button>
              )}
            </div>
            {avatarError && <p className="mt-3 text-sm font-medium text-red-700" role="alert">{avatarError}</p>}
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="profile-name" className="mb-1.5 block text-sm font-medium text-gray-700">Nome Completo</label>
          <input id="profile-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20" required />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="profile-phone" className="mb-1.5 block text-sm font-medium text-gray-700">Telefone</label>
            <input id="profile-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" className="w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20" />
          </div>
          <div>
            <label htmlFor="profile-location" className="mb-1.5 block text-sm font-medium text-gray-700">Localização</label>
            <input id="profile-location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Cidade, Estado" className="w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20" />
          </div>
        </div>

        <div>
          <label htmlFor="profile-bio" className="mb-1.5 block text-sm font-medium text-gray-700">Bio</label>
          <textarea id="profile-bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Conte um pouco sobre você" className="w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20" />
        </div>

        {feedback && <p className={feedback.type === "success" ? "text-sm font-medium text-green-700" : "text-sm font-medium text-red-700"} role={feedback.type === "success" ? "status" : "alert"}>{feedback.text}</p>}

        <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-wait disabled:opacity-50">
          {saving && <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />}
          {saving ? "Salvando..." : "Salvar Alterações"}
        </button>
      </form>
    </div>
  );
}
