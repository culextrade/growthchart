"use client";

import { useEffect } from "react";
import { useTheme } from "@/components/theme-provider";

export function ClientThemeWrapper({ children, gender }: { children: React.ReactNode, gender: "male" | "female" }) {
    const { setGender } = useTheme();

    useEffect(() => {
        setGender(gender);
        return () => setGender(null);
    }, [gender, setGender]);

    return (
        <div className="min-h-screen bg-background p-8 transition-colors duration-500">
            {children}
        </div>
    );
}
