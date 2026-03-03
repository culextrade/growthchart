"use client";

import { useState, useTransition } from "react";
import { Plus, User, Trash2, KeyRound, Lock, Unlock, Shield, Loader2, Pencil } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import {
    createHospitalAccount,
    deleteHospitalAccount,
    updateHospitalPassword,
    updateHospitalInfo,
    toggleLockAccount,
    changeSelfPassword,
} from "./actions";

type Hospital = {
    id: string;
    username: string | null;
    name: string | null;
    isLocked: boolean;
    createdAt: Date;
};

function EditInfoModal({ hospital, onClose }: { hospital: Hospital; onClose: () => void }) {
    const [name, setName] = useState(hospital.name || "");
    const [username, setUsername] = useState(hospital.username || "");
    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            try {
                await updateHospitalInfo(hospital.id, name, username);
                setMsg("Data berhasil diubah!");
                setTimeout(onClose, 1200);
            } catch (err: any) {
                setMsg(err.message || "Gagal mengubah data");
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                    <Pencil className="h-5 w-5 text-primary" />
                    Ubah Data Faskes
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                    Faskes: <span className="font-semibold text-foreground">{hospital.name}</span>
                </p>
                {msg && (
                    <div className={`mb-3 p-2 rounded-lg text-sm font-medium text-center ${msg.includes("berhasil") ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                        {msg}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Nama RS/Klinik</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded-lg text-sm bg-muted/30 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none transition"
                            placeholder="Nama RS/Klinik"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded-lg text-sm bg-muted/30 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none transition"
                            placeholder="username"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={onClose} className="flex-1 px-3 py-2 border rounded-lg text-sm font-medium hover:bg-muted/30 transition">
                            Batal
                        </button>
                        <button type="submit" disabled={isPending} className="flex-1 bg-primary text-white py-2 rounded-lg font-bold text-sm hover:bg-primary/90 transition disabled:opacity-60 flex items-center justify-center gap-2">
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function EditPasswordModal({ hospital, onClose }: { hospital: Hospital; onClose: () => void }) {
    const [newPassword, setNewPassword] = useState("");
    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            try {
                await updateHospitalPassword(hospital.id, newPassword);
                setMsg("Password berhasil diubah!");
                setTimeout(onClose, 1200);
            } catch (err: any) {
                setMsg(err.message || "Gagal mengubah password");
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-primary" />
                    Ubah Password
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                    Faskes: <span className="font-semibold text-foreground">{hospital.name}</span> (@{hospital.username})
                </p>
                {msg && (
                    <div className={`mb-3 p-2 rounded-lg text-sm font-medium text-center ${msg.includes("berhasil") ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                        {msg}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Password Baru</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-3 py-2 border rounded-lg text-sm bg-muted/30 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none transition"
                            placeholder="Minimal 6 karakter"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={onClose} className="flex-1 px-3 py-2 border rounded-lg text-sm font-medium hover:bg-muted/30 transition">
                            Batal
                        </button>
                        <button type="submit" disabled={isPending} className="flex-1 bg-primary text-white py-2 rounded-lg font-bold text-sm hover:bg-primary/90 transition disabled:opacity-60 flex items-center justify-center gap-2">
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SelfPasswordModal({ onClose }: { onClose: () => void }) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            try {
                await changeSelfPassword(currentPassword, newPassword);
                setMsg("Password berhasil diubah!");
                setTimeout(onClose, 1200);
            } catch (err: any) {
                setMsg(err.message || "Gagal mengubah password");
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Ubah Password Admin
                </h3>
                <p className="text-xs text-muted-foreground mb-4">Masukkan password lama dan password baru.</p>
                {msg && (
                    <div className={`mb-3 p-2 rounded-lg text-sm font-medium text-center ${msg.includes("berhasil") ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                        {msg}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Password Lama</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border rounded-lg text-sm bg-muted/30 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none transition"
                            placeholder="Password saat ini"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Password Baru</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-3 py-2 border rounded-lg text-sm bg-muted/30 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none transition"
                            placeholder="Minimal 6 karakter"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={onClose} className="flex-1 px-3 py-2 border rounded-lg text-sm font-medium hover:bg-muted/30 transition">
                            Batal
                        </button>
                        <button type="submit" disabled={isPending} className="flex-1 bg-primary text-white py-2 rounded-lg font-bold text-sm hover:bg-primary/90 transition disabled:opacity-60 flex items-center justify-center gap-2">
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function HospitalRow({ hospital }: { hospital: Hospital }) {
    const [editPwModal, setEditPwModal] = useState(false);
    const [editInfoModal, setEditInfoModal] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    const handleToggleLock = () => {
        startTransition(async () => {
            await toggleLockAccount(hospital.id);
        });
    };

    const handleDelete = () => {
        if (!deleteConfirm) {
            setDeleteConfirm(true);
            setTimeout(() => setDeleteConfirm(false), 3000);
            return;
        }
        startTransition(async () => {
            await deleteHospitalAccount(hospital.id);
            setDeleteConfirm(false);
        });
    };

    return (
        <>
            <div className={`p-4 flex items-center justify-between hover:bg-muted/10 transition ${hospital.isLocked ? "opacity-60" : ""}`}>
                <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${hospital.isLocked ? "bg-red-100 text-red-500" : "bg-primary/10 text-primary"}`}>
                        {hospital.isLocked ? <Lock className="h-5 w-5" /> : <User className="h-5 w-5" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground flex items-center gap-2">
                            {hospital.name}
                            {hospital.isLocked && (
                                <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-semibold">
                                    NONAKTIF
                                </span>
                            )}
                        </h3>
                        <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                @{hospital.username}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                                {new Date(hospital.createdAt).toLocaleDateString("id-ID")}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {/* Edit Info */}
                    <button
                        onClick={() => setEditInfoModal(true)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition"
                        title="Ubah Data Faskes"
                    >
                        <Pencil className="h-4 w-4" />
                    </button>

                    {/* Edit Password */}
                    <button
                        onClick={() => setEditPwModal(true)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition"
                        title="Ubah Password"
                    >
                        <KeyRound className="h-4 w-4" />
                    </button>

                    {/* Toggle Lock */}
                    <button
                        onClick={handleToggleLock}
                        disabled={isPending}
                        className={`p-2 rounded-lg transition ${hospital.isLocked
                            ? "text-green-600 hover:bg-green-50"
                            : "text-amber-600 hover:bg-amber-50"
                            }`}
                        title={hospital.isLocked ? "Aktifkan Akun" : "Nonaktifkan Akun"}
                    >
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : hospital.isLocked ? (
                            <Unlock className="h-4 w-4" />
                        ) : (
                            <Lock className="h-4 w-4" />
                        )}
                    </button>

                    {/* Delete */}
                    <button
                        onClick={handleDelete}
                        disabled={isPending}
                        className={`p-2 rounded-lg transition ${deleteConfirm
                            ? "bg-red-500 text-white"
                            : "text-red-500 hover:bg-red-50"
                            }`}
                        title={deleteConfirm ? "Klik lagi untuk konfirmasi hapus" : "Hapus Faskes"}
                    >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                </div>
            </div>
            {editPwModal && <EditPasswordModal hospital={hospital} onClose={() => setEditPwModal(false)} />}
            {editInfoModal && <EditInfoModal hospital={hospital} onClose={() => setEditInfoModal(false)} />}
        </>
    );
}

export default function SuperadminClient({ hospitals }: { hospitals: Hospital[] }) {
    const [isPending, startTransition] = useTransition();
    const [formMsg, setFormMsg] = useState("");
    const [selfPwModal, setSelfPwModal] = useState(false);

    const handleCreateAccount = (formData: FormData) => {
        startTransition(async () => {
            try {
                await createHospitalAccount(formData);
                setFormMsg("Akun berhasil dibuat!");
                setTimeout(() => setFormMsg(""), 3000);
            } catch (err: any) {
                setFormMsg(err.message || "Gagal membuat akun");
            }
        });
    };

    return (
        <div className="min-h-screen bg-muted/20 p-8">
            <header className="mb-8 border-b pb-4 flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Superadmin Dashboard</h1>
                    <p className="text-muted-foreground">Kelola akun akses Rumah Sakit &amp; Klinik.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSelfPwModal(true)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg hover:bg-muted/30 transition"
                    >
                        <Shield className="h-4 w-4" />
                        Ubah Password
                    </button>
                    <LogoutButton />
                </div>
            </header>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl border shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Plus className="h-5 w-5 text-primary" />
                            Tambah Faskes Baru
                        </h2>
                        {formMsg && (
                            <div className={`mb-3 p-2 rounded-lg text-sm font-medium text-center ${formMsg.includes("berhasil") ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                                {formMsg}
                            </div>
                        )}
                        <form action={handleCreateAccount} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Nama RS/Klinik</label>
                                <input name="name" type="text" required className="w-full px-3 py-2 border rounded-lg text-sm bg-muted/30 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none transition" placeholder="Klinik Sehat" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Username</label>
                                <input name="username" type="text" required className="w-full px-3 py-2 border rounded-lg text-sm bg-muted/30 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none transition" placeholder="kliniksehat" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Password Awal</label>
                                <input name="password" type="text" required minLength={6} className="w-full px-3 py-2 border rounded-lg text-sm bg-muted/30 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none transition" placeholder="Minimal 6 karakter" />
                            </div>
                            <button type="submit" disabled={isPending} className="w-full bg-primary text-white py-2 rounded-lg font-bold text-sm hover:bg-primary/90 transition disabled:opacity-60 flex items-center justify-center gap-2">
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                Buat Akun
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                        <div className="p-4 bg-muted/30 border-b">
                            <h2 className="text-sm font-bold flex items-center gap-2">
                                <User className="h-4 w-4 text-primary" />
                                Daftar Faskes Terdaftar ({hospitals.length})
                            </h2>
                        </div>
                        <div className="divide-y">
                            {hospitals.map((hospital) => (
                                <HospitalRow key={hospital.id} hospital={hospital} />
                            ))}
                            {hospitals.length === 0 && (
                                <div className="p-8 text-center text-muted-foreground text-sm">
                                    Belum ada faskes yang terdaftar.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {selfPwModal && <SelfPasswordModal onClose={() => setSelfPwModal(false)} />}
        </div>
    );
}
