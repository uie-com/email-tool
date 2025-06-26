"use client";

import { getSessionSchedule } from "@/domain/email/schedule/sessions";
import { Flex } from "@mantine/core";
import { useState } from "react";

export default function ProgramSchema() {
    const [result, setResult] = useState<any>(null);
    if (!result) {
        console.log('Fetching session schedule...');
        getSessionSchedule().then((data) => {
            setResult(data);
        });
    }


    return (
        <Flex align="center" justify="center" direction='column' className="w-full h-full" gap={20} style={{ position: 'relative' }}>
            <div className="p-4 border-gray-200 rounded-lg min-w-96 border-1">
                <h2></h2>
                <pre>{JSON.stringify(result, null, ' ')}</pre>
            </div>
        </Flex>
    );
}