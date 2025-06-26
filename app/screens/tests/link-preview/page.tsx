// https://leaders.centercentre.com/events/redux-navigating-politics-prioritizing-ux-above-product-delivery

"use client";

import { Button, Flex } from "@mantine/core";
import { useEffect, useState } from "react";


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