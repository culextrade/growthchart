"use client";

import { useEffect } from "react";
import { useTheme } from "@/components/theme-provider";

function GirlOrnaments() {
    return (
        <>
            {/* Top-right flower cluster */}
            <svg className="absolute -top-10 -right-10 w-[320px] h-[320px] opacity-[0.04] pointer-events-none" viewBox="0 0 300 300" fill="none">
                <ellipse cx="150" cy="80" rx="35" ry="14" stroke="#ec4899" strokeWidth="1.5" transform="rotate(0 150 80)" />
                <ellipse cx="150" cy="80" rx="35" ry="14" stroke="#ec4899" strokeWidth="1.5" transform="rotate(60 150 80)" />
                <ellipse cx="150" cy="80" rx="35" ry="14" stroke="#ec4899" strokeWidth="1.5" transform="rotate(120 150 80)" />
                <circle cx="150" cy="80" r="10" stroke="#ec4899" strokeWidth="1.5" />
                {/* 5-petal flower */}
                <ellipse cx="230" cy="180" rx="25" ry="10" stroke="#f472b6" strokeWidth="1.2" transform="rotate(0 230 180)" />
                <ellipse cx="230" cy="180" rx="25" ry="10" stroke="#f472b6" strokeWidth="1.2" transform="rotate(72 230 180)" />
                <ellipse cx="230" cy="180" rx="25" ry="10" stroke="#f472b6" strokeWidth="1.2" transform="rotate(144 230 180)" />
                <ellipse cx="230" cy="180" rx="25" ry="10" stroke="#f472b6" strokeWidth="1.2" transform="rotate(216 230 180)" />
                <ellipse cx="230" cy="180" rx="25" ry="10" stroke="#f472b6" strokeWidth="1.2" transform="rotate(288 230 180)" />
                <circle cx="230" cy="180" r="7" stroke="#f472b6" strokeWidth="1.2" />
                {/* Stem + leaf */}
                <path d="M180 250 Q200 220 220 240" stroke="#ec4899" strokeWidth="1" />
                <path d="M195 230 Q210 240 200 255" stroke="#ec4899" strokeWidth="0.8" />
                {/* Small buds */}
                <circle cx="100" cy="150" r="5" stroke="#f9a8d4" strokeWidth="0.8" />
                <path d="M95 150 Q100 138 105 150" stroke="#f9a8d4" strokeWidth="0.8" />
                <circle cx="260" cy="260" r="6" stroke="#f9a8d4" strokeWidth="0.8" />
                <path d="M254 260 Q260 248 266 260" stroke="#f9a8d4" strokeWidth="0.8" />
                <circle cx="80" cy="240" r="4" stroke="#fbb6ce" strokeWidth="0.6" />
            </svg>
            {/* Bottom-left subtle flowers */}
            <svg className="absolute -bottom-16 -left-16 w-[280px] h-[280px] opacity-[0.03] pointer-events-none" viewBox="0 0 260 260" fill="none">
                <ellipse cx="130" cy="120" rx="30" ry="12" stroke="#ec4899" strokeWidth="1.2" transform="rotate(0 130 120)" />
                <ellipse cx="130" cy="120" rx="30" ry="12" stroke="#ec4899" strokeWidth="1.2" transform="rotate(45 130 120)" />
                <ellipse cx="130" cy="120" rx="30" ry="12" stroke="#ec4899" strokeWidth="1.2" transform="rotate(90 130 120)" />
                <ellipse cx="130" cy="120" rx="30" ry="12" stroke="#ec4899" strokeWidth="1.2" transform="rotate(135 130 120)" />
                <circle cx="130" cy="120" r="8" stroke="#ec4899" strokeWidth="1.2" />
                <path d="M70 200 Q90 170 110 190" stroke="#f472b6" strokeWidth="0.8" />
                <path d="M85 180 Q100 190 90 205" stroke="#f472b6" strokeWidth="0.7" />
                <circle cx="200" cy="60" r="4" stroke="#f9a8d4" strokeWidth="0.6" />
                <path d="M196 60 Q200 52 204 60" stroke="#f9a8d4" strokeWidth="0.6" />
            </svg>
        </>
    );
}

function BoyOrnaments() {
    return (
        <>
            {/* Top-right geometry */}
            <svg className="absolute -top-10 -right-10 w-[320px] h-[320px] opacity-[0.04] pointer-events-none" viewBox="0 0 300 300" fill="none">
                {/* Large triangle */}
                <polygon points="150,30 220,130 80,130" stroke="#3b82f6" strokeWidth="1.5" strokeLinejoin="round" />
                {/* Hexagon */}
                <polygon points="230,170 255,190 255,225 230,245 205,225 205,190" stroke="#60a5fa" strokeWidth="1.2" strokeLinejoin="round" />
                {/* Paper airplane */}
                <path d="M80 180 L160 210 L120 225 Z" stroke="#3b82f6" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M120 225 L130 255 L160 210" stroke="#3b82f6" strokeWidth="1.2" />
                {/* Trail lines from airplane */}
                <path d="M75 185 L55 175" stroke="#93c5fd" strokeWidth="0.7" />
                <path d="M78 195 L58 190" stroke="#93c5fd" strokeWidth="0.5" />
                {/* Diamond */}
                <polygon points="200,70 220,100 200,130 180,100" stroke="#93c5fd" strokeWidth="1" />
                {/* Small circle */}
                <circle cx="120" cy="260" r="15" stroke="#60a5fa" strokeWidth="0.8" />
                {/* Tiny square rotated */}
                <rect x="255" cy="270" y="270" width="20" height="20" stroke="#93c5fd" strokeWidth="0.8" rx="2" transform="rotate(20 265 280)" />
            </svg>
            {/* Bottom-left geometry */}
            <svg className="absolute -bottom-16 -left-16 w-[280px] h-[280px] opacity-[0.03] pointer-events-none" viewBox="0 0 260 260" fill="none">
                {/* Pentagon */}
                <polygon points="130,60 175,93 158,145 102,145 85,93" stroke="#3b82f6" strokeWidth="1.2" strokeLinejoin="round" />
                {/* Small paper plane */}
                <path d="M180 180 L220 195 L200 200 Z" stroke="#60a5fa" strokeWidth="1" strokeLinejoin="round" />
                <path d="M200 200 L205 215 L220 195" stroke="#60a5fa" strokeWidth="0.8" />
                {/* Dots */}
                <circle cx="60" cy="200" r="2" stroke="#93c5fd" strokeWidth="0.6" />
                <circle cx="240" cy="120" r="2" stroke="#93c5fd" strokeWidth="0.6" />
                {/* Small triangle */}
                <polygon points="50,130 70,160 30,160" stroke="#93c5fd" strokeWidth="0.8" strokeLinejoin="round" />
            </svg>
        </>
    );
}

export function ClientThemeWrapper({ children, gender }: { children: React.ReactNode, gender: "male" | "female" }) {
    const { setGender } = useTheme();

    useEffect(() => {
        setGender(gender);
        return () => setGender(null);
    }, [gender, setGender]);

    return (
        <div className="relative min-h-screen bg-background p-8 transition-colors duration-500 overflow-hidden">
            {gender === 'female' ? <GirlOrnaments /> : <BoyOrnaments />}
            <div className="relative z-[1]">
                {children}
            </div>
        </div>
    );
}

