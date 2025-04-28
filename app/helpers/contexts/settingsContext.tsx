"use client";

import { GlobalSettings, GlobalSettingsContext } from "@/domain/schema";
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
        localStorage.setItem('globalSettings', JSON.stringify(settings));
    }, [settings]);

    return (
        <GlobalSettingsContext.Provider value={[settings, setSettings]}>
            {children}
        </GlobalSettingsContext.Provider>
    );
}