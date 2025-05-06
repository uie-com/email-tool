"use client";

import { GlobalSettings } from "@/domain/schema";
import { GlobalSettingsContext } from "@/domain/schema/context";
import { useEffect, useState } from "react";

export function GlobalSettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<GlobalSettings>({});

    useEffect(() => {
        const storedSettings = localStorage.getItem('globalSettings');
        if (storedSettings) {
            setSettings(JSON.parse(storedSettings));
        }
    }, []);

    useEffect(() => {
        if (Object.keys(settings).length === 0) return;
        localStorage.setItem('globalSettings', JSON.stringify(settings));
    }, [settings]);

    return (
        <GlobalSettingsContext.Provider value={[settings, setSettings]}>
            {children}
        </GlobalSettingsContext.Provider>
    );
}