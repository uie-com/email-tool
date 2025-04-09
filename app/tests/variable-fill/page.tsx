
"use client";

import { ContentHelper } from "@/app/helpers/emailEditing/contentFill";
import { Flex } from "@mantine/core";

export default function Page() {

    return (
        <Flex align="center" justify="center" direction='column' className="w-full h-full p-20" gap={20} style={{ position: 'relative' }}>
            <ContentHelper></ContentHelper>
        </Flex>
    );
}