"use client";

import { parseVariables } from "@/domain/parse/parseVariables";
import { EmailVariables, Email } from "@/domain/schema";
import { PROGRAM_DEFAULTS } from "@/domain/settings/programs"
import TextArea from "antd/es/input/TextArea";
import { useState } from "react";

import { Flex, Space } from "antd";


export function ContentHelper() {
    // const settings = PROGRAM_DEFAULTS.getSettingsForTags(['TUXS', 'Today', 'EDT']);
    const [email, setEmail] = useState<Email>({});
    const [variables, setVariables] = useState<EmailVariables>({});

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const body = e.target.value;
        const variables = parseVariables(body);
        setVariables(variables);
        setEmail({ ...email, sourcePlainText: body });
    };

    return (
        <Flex align="center" justify="center" className="h-full" gap={20}>
            <Space>
                <TextArea style={{ height: 820, width: 520 }} value={email.sourcePlainText || ''} onChange={handleChange} className="resize-none" />
            </Space>
            <Space direction="vertical">
                <p>
                    {JSON.stringify(variables, null, 2)}
                </p>
            </Space>
        </Flex>
    );
}