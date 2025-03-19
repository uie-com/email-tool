"use client";

import { parseVariables } from "@/domain/parse/parseVariables";
import { EmailVariables, Email, EmailVariable } from "@/domain/schema";
import { PROGRAM_DEFAULTS } from "@/domain/settings/programs"
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";

import { DatePicker, Flex, Input, Space, TimePicker, Typography } from "antd";
import dayjs from "dayjs";



export function ContentHelper() {
    const settings = PROGRAM_DEFAULTS.getSettingsForTags(['TUXS', 'Today', 'EDT', 'Job search']);
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
        <Flex align="center" justify="center" className="h-full" gap={20} style={{ position: 'relative' }}>
            <Space>
                {/* <TextArea style={{ height: 820, width: 520 }} value={email.sourcePlainText || ''} onChange={handleInputChange} className="resize-none" /> */}
                <RichTextEditor />
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
            <Space direction="vertical" size={2} >
                <Typography.Text>{variable.writtenName}</Typography.Text>
                <Space.Compact block>
                    <DatePicker value={variable.value ? dayjs(variable.value as Date) : null} onChange={e => setValue(e?.toDate())} disabled={disabled} />
                    <TimePicker value={variable.value ? dayjs(variable.value as Date) : null} onChange={e => setValue(e?.toDate())} disabled={disabled} />
                </Space.Compact>
            </Space>
        )
    } else if (variable.type === 'Banner') {

    } else if (variable.type === 'Image') {

    } else if (variable.type === 'Body') {
        <Space direction="vertical" size={2}>
            <Typography.Text>{variable.writtenName}</Typography.Text>
            <TextArea autoSize={true} value={variable.value as string} onChange={e => setValue(e.target.value)} disabled={disabled} />
        </Space>
    }
}

import { useQuill } from "react-quilljs";
import 'quill/dist/quill.snow.css';

function RichTextEditor() {
    const { quill, quillRef, Quill } = useQuill({});

    if (Quill) {
        const Size = Quill.import('attributors/style/size');
        const fontSizeArray = new Array(100).fill(0).map((_, i) => `${i + 1}pt`);
        Size.whitelist = fontSizeArray;
        Quill.register(Size, true);
        console.log(Quill);
    }

    useEffect(() => {
        if (quill) {
            quill.on('text-change', (delta, oldDelta, source) => {
                console.log('Text change!');
                console.log(quill.getText()); // Get text only
                console.log(quill.getContents()); // Get delta contents
                console.log(quill.root.innerHTML); // Get innerHTML using quill
                console.log(quillRef.current.firstChild.innerHTML); // Get innerHTML using quillRef
            });


        }
    }, [quill]);

    return (
        <div style={{ height: 820, width: 520 }} >
            <div ref={quillRef} style={{
                fontFamily: 'var(--ant-font-family)',
                borderRadius: ' 0 0 6px 6px',
                transition: 'all 0.2s'
            }} />
        </div>
    );
};