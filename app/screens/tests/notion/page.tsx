"use client";

import { findNotionCard } from "@/domain/integrations/notion/notionActions";
import { GlobalSettings } from "@/domain/schema";
import { Button, Flex, Text } from "@mantine/core";
import { useEffect, useState } from "react";

export default function ProgramSchema() {
    const [result, setResult] = useState<any>(null);
    const [getResult, setGetResult] = useState<any>(null);

    const [settings, setSettings] = useState<GlobalSettings>({});

    useEffect(() => {
        const storedSettings = localStorage.getItem('globalSettings');
        if (storedSettings) {
            setSettings(JSON.parse(storedSettings));
        }
    }, []);

    const handleTry = async () => {
        const res = await findNotionCard('2025-07-07', 'TUXS Today', '');
        setResult(res);
    };


    return (
        <Flex align="center" justify="center" direction='column' className="w-full h-full" gap={20} p={50} style={{ position: 'relative' }}>
            <Button onClick={handleTry} className="mb-4">Try Search</Button>
            <Text maw={400}>{JSON.stringify(result, null, ' ')}</Text>
        </Flex>
    );
}