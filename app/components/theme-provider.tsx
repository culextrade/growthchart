"use client";

import * as React from "react";

type Gender = "male" | "female" | null;

interface ThemeContextType {
    gender: Gender;
    setGender: (gender: Gender) => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [gender, setGender] = React.useState<Gender>(null);

    React.useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("theme-blue", "theme-pink");

        if (gender === "male") {
            root.classList.add("theme-blue");
        } else if (gender === "female") {
            root.classList.add("theme-pink");
        }
    }, [gender]);

    return (
        <ThemeContext.Provider value={{ gender, setGender }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = React.useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
