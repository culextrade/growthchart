import Image from "next/image";

export function PoweredBy() {
    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 select-none pointer-events-none sm:pointer-events-auto">
            <span className="text-[10px] font-bold text-muted-foreground/60 tracking-wider uppercase">
                Powered by
            </span>
            <div className="flex items-center px-4 py-2 rounded-full border bg-background/95 backdrop-blur-md shadow-lg transition-all hover:scale-105 active:scale-95 border-primary/10">
                <div className="relative h-6 w-32">
                    <Image
                        src="/logo-seha.png"
                        alt="SEHA Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </div>
        </div>
    );
}
