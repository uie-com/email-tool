"use client";

import { parseVariables, renderVariables } from "@/domain/parse/parseVariables";
import { EmailVariables, Email, EmailVariable } from "@/domain/schema";
import { PROGRAM_DEFAULTS } from "@/domain/settings/programs"
import TextArea from "antd/es/input/TextArea";
import { useEffect, useRef, useState } from "react";

import { DatePicker, Flex, Input, Space, TimePicker, Typography } from "antd";
import dayjs from "dayjs";



export function ContentHelper() {
    const settings = PROGRAM_DEFAULTS.getSettingsForTags(['TUXS', 'Today', 'EDT', 'Job search']);
    const [email, setEmail] = useState<Email>({});
    const [variables, setVariables] = useState<EmailVariables>({});
    const [displayRendered, setDisplayRendered] = useState(false);


    const handleVariableChange = (newVariables: EmailVariables) => {
        setVariables(newVariables);
    }

    const handleVariableInput = (newVariables: EmailVariables) => {
        setDisplayRendered(true);
        setVariables(newVariables);
    }

    const handleContentChange = (content: any) => {
        setEmail({ ...email, ...content });
    }

    // Show editable content when click on
    const handleEditorFocus = () => {
        setDisplayRendered(false);
    }

    return (
        <Flex align="center" justify="center" className="h-full" gap={20} style={{ position: 'relative' }}>
            <Space>
                {/* <TextArea style={{ height: 820, width: 520 }} value={email.sourcePlainText || ''} onChange={handleInputChange} className="resize-none" /> */}
                <RichTextEditor variables={variables} setVariables={handleVariableChange} updateEmail={handleContentChange} displayRendered={displayRendered} handleEditorFocus={handleEditorFocus} />
            </Space>
            <VariableForm variables={variables} setVariables={handleVariableInput} />
        </Flex>

    );
}


export function VariableForm({ variables, setVariables }: { variables: EmailVariables, setVariables: (variables: EmailVariables) => void }) {

    return (
        <Flex vertical align="start" justify="center" className="h-full" gap={20} key={'form'}>
            {variables && Object.keys(variables).map(key =>
                <VariableInput key={key} variable={variables[key]} setValue={(value) => {
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
            <Space direction="vertical" size={2} key={variable.id}>
                <Typography.Text>{variable.writtenName}</Typography.Text>
                <Input type="text" value={variable.value as string} onChange={e => setValue(e.target.value)} disabled={disabled} />
            </Space>
        )
    } else if (variable.type === 'Number') {

    } else if (variable.type === 'Date') {
        return (
            <Space direction="vertical" size={2} key={variable.id} >
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
        <Space direction="vertical" size={2} key={variable.id}>
            <Typography.Text>{variable.writtenName}</Typography.Text>
            <TextArea autoSize={true} value={variable.value as string} onChange={e => setValue(e.target.value)} disabled={disabled} />
        </Space>
    }
}

import { useQuill } from "react-quilljs";
import 'quill/dist/quill.snow.css';

function RichTextEditor({ variables, setVariables, updateEmail, displayRendered, handleEditorFocus }: { variables: EmailVariables, setVariables: (variables: EmailVariables) => void, updateEmail: (props: any) => void, displayRendered: boolean, handleEditorFocus: () => void }) {
    const variablesRef = useRef(variables);
    const { quill, quillRef, Quill } = useQuill({});
    const { quill: annotationQuill, quillRef: annotationQuillRef, Quill: AnnotatedQuill } = useQuill({ modules: { toolbar: false } });
    const { quill: renderedQuill, quillRef: renderedQuillRef, Quill: RenderedQuill } = useQuill({ modules: { toolbar: false } });

    // TODO: not do this every render, but useEffect isn't working.
    if (Quill) {
        const Size = Quill.import('attributors/style/size');
        const fontSizeArray = new Array(100).fill(0).map((_, i) => `${i + 1}pt`);
        Size.whitelist = fontSizeArray;
        Quill.register(Size, true);
        renderedQuill?.disable();
    }

    // Set up event listener
    useEffect(() => {
        if (!quill) return;
        // On input, parse variables and update email
        const handleInput = () => {
            console.log('Parsing input');
            if (!quill || !annotationQuill) return;
            annotationQuill.setContents(quill.getContents());
            if (!variablesRef.current || Object.keys(variablesRef.current).length === 0) console.log('Parsing variables for the first time');;
            variablesRef.current = parseVariables(annotationQuill, variablesRef.current, false);
            updateEmail({ sourceRichText: quill.getContents() });
        };
        quill.once('text-change', () => handleInput());
        return () => {
            quill.off('text-change', () => handleInput());
        }
    }, [quill?.getText(), variables]);

    useEffect(() => {
        if (!annotationQuill || Object.keys(variablesRef.current).map(key => variablesRef.current[key].id + variablesRef.current[key].occurs).join('') === Object.keys(variables).map(key => variables[key].id + variables[key].occurs).join('')) return;
        console.log('Saving variables');
        parseVariables(annotationQuill, variablesRef.current, true);
        setVariables(variablesRef.current);
    }, [variablesRef.current]);

    useEffect(() => {
        if (!renderedQuill || !annotationQuill || !variables) return;
        console.log('Rendering variables');
        renderedQuill.setContents(annotationQuill.getContents());
        renderVariables(renderedQuill, variables);
        updateEmail({ renderedRichText: renderedQuill.getContents() });
    }, [annotationQuill, variables]);

    return (
        <div style={{ height: 820, width: 520, position: 'relative' }} onClick={handleEditorFocus}>
            <div ref={quillRef} style={{
                fontFamily: 'var(--ant-font-family)',
                borderRadius: ' 0 0 6px 6px',
                transition: 'all 0.2s',
                // display: displayRaw ? 'block' : 'none'
                height: 750, width: 520, overflowY: 'scroll'
            }} />
            <div className="renderView" style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: displayRendered ? '1' : '0', pointerEvents: displayRendered ? 'unset' : 'none', transition: 'all 0.2s'
            }}>
                <div ref={renderedQuillRef} style={{
                    fontFamily: 'var(--ant-font-family)',
                    borderRadius: ' 0 0 6px 6px',
                    transition: 'all 0.2s',
                    zIndex: 10,
                    backgroundColor: 'white',
                }} />
            </div>
            <div className="hiddenView" style={{
                display: 'none', pointerEvents: 'none'
            }}>
                <div ref={annotationQuillRef} />
            </div>
        </div>
    );
};