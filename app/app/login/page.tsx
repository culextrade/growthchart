"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                username,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Username atau password salah.");
                setIsLoading(false);
                return;
            }

            const session = await getSession();
            const role = (session?.user as any)?.role;

            if (role === "SUPERADMIN") {
                router.push("/superadmin");
            } else {
                router.push("/dashboard");
            }
            router.refresh();
        } catch {
            setError("Terjadi kesalahan. Silakan coba lagi.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-border">
                <div className="p-8">
                    <div className="flex justify-center mb-8">
                        <div className="relative h-12 w-48">
                            <Image
                                src="/logo-seha.png"
                                alt="SEHA Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-primary">Selamat Datang</h1>
                        <p className="text-sm text-muted-foreground mt-2">
                            Pediatric Growth Chart.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 font-medium text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">
                                Username
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="Masukkan username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">
                                Password
                            </label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="Masukkan password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-bold shadow-sm hover:bg-primary/90 transition-all disabled:opacity-70"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                "Masuk"
                            )}
                        </button>
                    </form>
                </div>
                <div className="bg-muted/30 py-4 text-center border-t">
                    <p className="text-xs text-muted-foreground/80 font-medium">
                        © 2026 PT Waras Ing Bhumi Ira
                    </p>
                </div>
            </div>
        </div>
    );
}
