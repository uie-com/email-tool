"use client";

import { parseVariables } from "@/domain/parse/parseVariables";
import { EmailVariables, Email, EmailVariable } from "@/domain/schema";
import { PROGRAM_DEFAULTS } from "@/domain/settings/programs"
import TextArea from "antd/es/input/TextArea";
import { useState } from "react";

import { DatePicker, Flex, Input, Space, TimePicker, Typography } from "antd";
import dayjs from "dayjs";


export function ContentHelper() {
    // const settings = PROGRAM_DEFAULTS.getSettingsForTags(['TUXS', 'Today', 'EDT']);
    const [email, setEmail] = useState<Email>({});
    const [variables, setVariables] = useState<EmailVariables>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const body = e.target.value;
        const variables = parseVariables(body);
        setVariables(variables);
        setEmail({ ...email, sourcePlainText: body });
    };

    const handleVariableValueChange = (variables: EmailVariables) => {
        setVariables(variables);
    }

    return (
        <Flex align="center" justify="center" className="h-full" gap={20}>
            <Space>
                <TextArea style={{ height: 820, width: 520 }} value={email.sourcePlainText || ''} onChange={handleInputChange} className="resize-none" />
            </Space>
            <VariableForm variables={variables} setVariables={handleVariableValueChange} />
        </Flex>
    );
}

export function VariableForm({ variables, setVariables }: { variables: EmailVariables, setVariables: (variables: EmailVariables) => void }) {

    return (
        <Flex vertical align="start" justify="center" className="h-full" gap={20}>
            {variables && Object.keys(variables).map(key =>
                <VariableInput variable={variables[key]} setValue={(value) => {
                    setVariables({ ...variables, [key]: { ...variables[key], value } });
                }} />
            )}
        </Flex>

    );
}

function VariableInput({ variable, setValue }: { variable: EmailVariable, setValue: (value: any) => void }) {
    const disabled = variable.dependsOn.length > 0;

    if (variable.type === 'String') {
        return (
            <Space direction="vertical" size={2}>
                <Typography.Text>{variable.writtenName}</Typography.Text>
                <Input type="text" value={variable.value as string} onChange={e => setValue(e.target.value)} disabled={disabled} />
            </Space>
        )
    } else if (variable.type === 'Number') {

    } else if (variable.type === 'Date') {
        return (
            <Space direction="vertical" size={2}>
                <Typography.Text>{variable.writtenName}</Typography.Text>
                <Space.Compact block>
                    <DatePicker value={variable.value ? dayjs(variable.value as Date) : null} onChange={e => setValue(e?.toDate())} disabled={disabled} />
                    <TimePicker value={variable.value ? dayjs(variable.value as Date) : null} onChange={e => setValue(e?.toDate())} disabled={disabled} />
                </Space.Compact>

            </Space>
        )
    } else if (variable.type === 'Banner') {

    } else if (variable.type === 'Image') {

    }
}