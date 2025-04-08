"use client";

import { Variables } from "@/domain/schema/variableCollection";
import { Flex, Textarea } from "@mantine/core";
import { useState } from "react";

export default function Page() {
    const [value, setValue] = useState<string>('');
    const parsedVariables = new Variables(value);

    return (
        <Flex align="center" justify="center" direction='column' className="w-full h-full p-20" gap={20} style={{ position: 'relative' }}>
            <Textarea onChange={(event) => {
                setValue(event.currentTarget.value)
            }} name="search" placeholder="" label="" autosize />
            <h1>Parsed Variables:</h1>
            <div className="p-4 border-gray-200 rounded-lg min-w-96 border-1">
                <p>{JSON.stringify(parsedVariables)}</p>
            </div>
        </Flex>
    );
}