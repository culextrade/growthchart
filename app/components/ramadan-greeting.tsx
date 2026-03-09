"use client";

import { Moon, Star } from "lucide-react";
import { useState } from "react";
import { X } from "lucide-react";

export function RamadanGreeting() {
    const [isVisible, setIsVisible] = useState(true);

    const now = new Date();
    // Use target dates: 
    // Eid starts: March 19, 2026 (local time)
    // Eid ends: March 21, 2026 (local time) - meaning greeting is hidden *on and after* March 21.
    const eidStart = new Date(2026, 2, 19); // Month is 0-indexed (2 = March)
    const eidEnd = new Date(2026, 2, 21);

    if (!isVisible || now >= eidEnd) return null;

    const isEid = now >= eidStart && now < eidEnd;

    return (
        <div className="mb-6 flex items-start sm:items-center justify-between overflow-hidden rounded-2xl border border-emerald-100/60 bg-gradient-to-r from-emerald-50/80 to-white px-5 py-4 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-4">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100/50 text-emerald-600">
                    <Moon className="h-5 w-5" />
                    <Star className="absolute right-1.5 top-2 h-2.5 w-2.5 text-emerald-400 fill-emerald-400/20" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-emerald-950">
                        {isEid ? "Selamat Hari Raya Idulfitri, Dok. ✨" : "Selamat menunaikan ibadah puasa, Dok. ✨"}
                    </p>
                    <p className="text-xs text-emerald-700/80 mt-0.5">
                        {isEid
                            ? "Minal Aidin wal-Faizin, mohon maaf lahir dan batin. Selamat berkumpul bersama keluarga."
                            : "Semoga senantiasa diberikan keberkahan dan semangat dalam beribadah, serta melayani pasien sepenuh hati."}
                    </p>
                </div>
            </div>
            <button
                onClick={() => setIsVisible(false)}
                className="p-1.5 text-emerald-600/50 hover:text-emerald-700 hover:bg-emerald-100/50 rounded-lg transition-colors shrink-0 -mr-2"
                title="Tutup ucapan"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
