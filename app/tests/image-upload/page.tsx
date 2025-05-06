"use client";

import { SETTINGS } from "@/domain/settings/settings";
import { Button, Flex, Text, Textarea } from "@mantine/core";
import { useContext, useEffect, useState } from "react";
import { initializeSettings } from "@/domain/parse/parseSettings";
import { createEmailsFromSession } from "@/domain/parse/parseSchedule";
import { EMAILS_PER_SESSION } from "@/domain/settings/schedule";
import { getSessionSchedule } from "@/domain/data/sessions";
import { GlobalSettings } from "@/domain/schema";

export default function ProgramSchema() {
    const [result, setResult] = useState<any>(null);

    const [settings, setSettings] = useState<GlobalSettings>({});

    useEffect(() => {
        const storedSettings = localStorage.getItem('globalSettings');
        if (storedSettings) {
            setSettings(JSON.parse(storedSettings));
        }
    }, []);

    const handleTry = async () => {
        // const res = await uploadImageCURL('./banners/tuxs-dst/upcomingtopics.png', settings.activeCampaignToken ?? '');
        // setResult(res);
    };


    return (
        <Flex align="center" justify="center" direction='column' className="w-full h-full" gap={20} p={50} style={{ position: 'relative' }}>
            <Button onClick={handleTry} className="mb-4">Try Upload</Button>
            <Text maw={400}>{JSON.stringify(result, null, ' ')}</Text>
        </Flex>
    );
}