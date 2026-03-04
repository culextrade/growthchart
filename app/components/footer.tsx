import React from "react";
import Image from "next/image";

export function Footer() {
    return (
        <footer className="w-full bg-muted/30 border-t py-8 mt-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-muted-foreground/60 tracking-wider uppercase">
                                Powered by
                            </span>
                            <div className="relative h-6 w-24 opacity-80 grayscale hover:grayscale-0 transition-all">
                                <Image
                                    src="/logo-seha.png"
                                    alt="SEHA Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>
                        <p className="text-xs font-semibold text-muted-foreground/80">
                            © 2026 PT Waras Ing Bhumi Ira. All rights reserved.
                        </p>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-1 text-center md:text-right">
                        <p className="text-[11px] text-muted-foreground/50 italic">
                            Sumber data referensi klinis: World Health Organization (WHO) & Center for Disease Control (CDC)
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
