// https://leaders.centercentre.com/events/redux-navigating-politics-prioritizing-ux-above-product-delivery

"use client";

import { SETTINGS } from "@/domain/settings/settings";
import { Button, Flex, Text, Textarea } from "@mantine/core";
import { useContext, useEffect, useState } from "react";
import { initializeSettings } from "@/domain/parse/parseSettings";
import { createEmailsFromSession } from "@/domain/parse/parseSchedule";
import { EMAILS_PER_SESSION } from "@/domain/settings/schedule";
import { getSessionSchedule } from "@/domain/data/sessions";
import { GlobalSettings } from "@/domain/schema";
import { findNotionCard } from "@/domain/data/notionActions";


export default function ProgramSchema() {
    const [result, setResult] = useState<any>(null);

    useEffect(() => {

    }, []);

    const handleTry = async () => {
        const res = await fetch('/api/preview?url=https://leaders.centercentre.com/events/redux-navigating-politics-prioritizing-ux-above-product-delivery');
        const text = await res.text();
        const doc = JSON.parse("{ \"body\": " + text + "}").body
        setResult(doc);
        console.log(doc);
    };


    return (
        <Flex align="center" justify="center" direction='column' className="w-full h-full" gap={20} p={50} style={{ position: 'relative' }}>
            <Button onClick={handleTry} className="mb-4">Try Search</Button>
            <iframe className="w-full h-screen" srcDoc={result}></iframe>
        </Flex>
    );
}