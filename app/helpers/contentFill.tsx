"use client";

import { parseVariables, fillVariables, resolveDependencies, parseValuesDependencies } from "@/domain/parse/parseVariables";
import { Email, EmailVariable, EmailVariableValues } from "@/domain/schema";
import { PROGRAM_VALUES } from "@/domain/settings/emails"
import TextArea from "antd/es/input/TextArea";
import { useContext, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";

import { useQuill } from "react-quilljs";
import 'quill/dist/quill.snow.css';
import { Flex, Textarea, TextInput } from "@mantine/core";
import { DateInput, DateTimePicker, TimeInput } from "@mantine/dates";
import { IconLink, IconLinkOff, IconLinkPlus, IconPlus } from "@tabler/icons-react";
import { isValidHttpUrl } from "@/domain/parse/parseUtility";
import Quill from "quill";
import { EditorContext } from "../page";



export function ContentHelper() {
    const settings = PROGRAM_VALUES.getSettingsForTags(['TUXS', 'Today', 'EDT', 'Job search']);
    const [email, setEmail] = useState<Email>({});
    const [parsedVariables, setParsedVariables] = useState<EmailVariable[]>([]);
    const [displayRendered, setDisplayRendered] = useState(false);

    const [editorState, setEditorState] = useContext(EditorContext);


    const handleVariableChange = (newVariables: EmailVariable[]) => {
        setParsedVariables(newVariables);
    }

    const handleValueInput = (newValues: EmailVariableValues) => {
        setDisplayRendered(true);
        setEditorState({ ...editorState, email: { ...editorState.email, values: { ...editorState.email?.values ?? {}, ...newValues } } });
    }

    const handleContentChange = (content: any) => {
        setEmail({ ...email, ...content });
        setEditorState({ ...editorState, email: { ...editorState.email, content: { ...editorState.email?.content ?? {}, ...content } } });
    }

    // Show editable content when click on
    const handleEditorFocus = () => {
        setDisplayRendered(false);
    }

    return (
        <Flex align="center" justify="center" className="h-full w-full" gap={20} style={{ position: 'relative' }}>
            {/* <TextArea style={{ height: 820, width: 520 }} value={email.sourcePlainText || ''} onChange={handleInputChange} className="resize-none" /> */}
            <RichTextEditor variables={parsedVariables} values={editorState.email?.values} setVariables={handleVariableChange} updateEmail={handleContentChange} displayRendered={displayRendered} handleEditorFocus={handleEditorFocus} />
            <VariableForm variables={parsedVariables} values={editorState.email?.values} setValue={handleValueInput} />
        </Flex>

    );
}


export function VariableForm({ variables, values, setValue }: { variables: EmailVariable[], values?: EmailVariableValues, setValue: (values: EmailVariableValues) => void }) {
    const [formVariables, setFormVariables] = useState<EmailVariable[]>([]);

    useEffect(() => {
        let parsedVariables: EmailVariable[] = [...variables];
        parsedVariables = parsedVariables.concat(parseValuesDependencies(values));
        parsedVariables = resolveDependencies(parsedVariables, values);
        parsedVariables = parsedVariables.filter((variable, index) => {
            if (variables.slice(0, index).find(duplicate => duplicate.name === variable.name) !== undefined) {
                return false;
            }
            return true;
        });
        console.log('Creating form', parsedVariables);
        setFormVariables(parsedVariables);
    }, [variables, values])

    return (
        <Flex direction="column" align="start" justify="center" className="h-full" gap={20} key={'form'}>
            {formVariables && formVariables.map((variable, index) =>
                <VariableInput key={'ve' + index} index={index} variable={variable} value={values && values[variable.name] ? values[variable.name].value : undefined} setValue={(value) => {
                    setValue({ [variable.name]: { value: value } });
                }} />
            )}
        </Flex>

    );
}

function VariableInput({ variable, value, setValue, index }: { variable: EmailVariable, value: any, setValue: (value: any) => void, index: number }) {
    const [inputState, setInputState] = useState<string | null>(null);
    const disabled = variable.dependencies.length > 0;
    if (!inputState) {
        setInputState(value !== undefined ? '' : 'empty');
    }

    if (variable.type === 'String') {
        return (
            <TextInput
                key={'vi' + index}
                label={variable.writtenName}
                value={value as string ?? ''}
                onChange={e => setValue(e.target.value)}
                disabled={disabled}
                name="noAutofillSearch"
            />
        )
    } else if (variable.type === 'Number') {

    } else if (variable.type === 'Date') {
        return (
            <Flex direction="row" align={'end'} key={'vi' + index} gap={2} >
                <DateInput
                    valueFormat="dddd, MMMM D, YYYY"
                    label={variable.writtenName}
                    value={value as Date}
                    onChange={e => setValue(e)}
                    disabled={disabled}
                    name="noAutofillSearch"
                />
                <TimeInput
                    value={value as Date ? dayjs((value as Date))?.format('HH:mm') : '00:00'}
                    onChange={e => {
                        const [hours, minutes] = e.target.value.split(':');
                        const newDate = dayjs(value).hour(parseInt(hours)).minute(parseInt(minutes)).toDate();
                        setValue(newDate);
                    }}
                    disabled={disabled}
                    name="noAutofillSearch"
                />
            </Flex>
        )
    } else if (variable.type === 'Banner') {

    } else if (variable.type === 'Image') {

    } else if (variable.type === 'Link') {
        return (
            <TextInput
                key={'vi' + index}
                label={variable.writtenName}
                value={value as string ?? ''}
                onChange={e => {
                    if (e.target.value === '') {
                        setInputState('empty');
                    } else if (isValidHttpUrl(e.target.value)) {
                        setInputState('link');
                    } else {
                        setInputState('broken');
                    }
                    setValue(e.target.value)
                }}
                disabled={disabled}
                name="noAutofillSearch"
                rightSection={inputState && (
                    inputState === 'empty' ? (null) :
                        inputState === 'link' ? (<IconLink size={20} opacity={1} strokeWidth={1.5} />) :
                            inputState === 'broken' ? (<IconLinkOff size={20} opacity={1} strokeWidth={1.5} />) : null
                )}
            />
        )
    } else if (variable.type === 'Body') {
        <Textarea key={'vi' + index}
            label={variable.writtenName}
            value={value as string}
            onChange={e => setValue(e.target.value)}
            disabled={disabled}
            name="noAutofillSearch"
            autosize={true}
            minRows={2}
            maxRows={5}
        />
    }
}



function RichTextEditor({ variables, values, setVariables, updateEmail, displayRendered, handleEditorFocus }: { variables: EmailVariable[], values?: EmailVariableValues, setVariables: (variables: EmailVariable[]) => void, updateEmail: (props: any) => void, displayRendered: boolean, handleEditorFocus: () => void }) {
    const { quill, quillRef, Quill } = useQuill({

    });
    const { quill: renderedQuill, quillRef: renderedQuillRef, Quill: RenderedQuill } = useQuill({ modules: { toolbar: false } });

    // TODO: not do this every render, but useEffect isn't working.
    if (Quill) {
        // const Size = Quill.import('attributors/style/size');
        // const fontSizeArray = new Array(100).fill(0).map((_, i) => `${i + 1}pt`);
        // Size.whitelist = fontSizeArray;
        // Quill.register(Size, true);
    }

    useEffect(() => {
        if (!quill) return;
        console.log('Setting up quill');
        // On input, parse variables and update email
        const handleInput = () => {
            console.log('Parsing input');
            if (!quill) return;
            const newVariables = (parseVariables(quill.getText()));
            updateEmail({ sourceRichText: quill.getContents(), sourcePlainText: quill.getText() });
            console.log('Setting variables', newVariables);
            setVariables(newVariables);
        };
        quill.on('text-change', () => handleInput());
        return () => {
            quill.off('text-change', () => handleInput());
        }
    }, [quill]);

    useEffect(() => {
        if (!renderedQuill || !quill || !variables) return;
        console.log('Rendering variables');
        renderedQuill.setContents(quill.getContents());
        fillVariables(renderedQuill, values);
        updateEmail({ filledRichText: renderedQuill.getContents(), filledPlainText: renderedQuill.getText() });
        renderedQuill?.disable();
    }, [quill, variables, values]);

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
        </div>
    );
};