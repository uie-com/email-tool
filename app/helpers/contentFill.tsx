"use client";

import { fillQuillVariables } from "@/domain/parse/parseVariables";
import { Email } from "@/domain/schema";
import { useContext, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";

import { useQuill } from "react-quilljs";
import 'quill/dist/quill.snow.css';
import { Flex, Textarea, TextInput } from "@mantine/core";
import { DateInput, TimeInput } from "@mantine/dates";
import { IconLink, IconLinkOff } from "@tabler/icons-react";
import { isValidHttpUrl } from "@/domain/parse/parseUtility";
import { EditorContext } from "../page";
import { Variable, Variables } from "@/domain/schema/variableCollection";
import { Values } from "@/domain/schema/valueCollection";


const DEBUG = false;
export function ContentHelper() {
    const [editorState, setEditorState] = useContext(EditorContext);

    const [variables, setVariables] = useState<Variables>(new Variables(''));
    const [values, setValues] = useState<Values>(new Values(editorState.email?.values?.initialValues ?? []));

    const [displayRendered, setDisplayRendered] = useState(false);

    const handleVariableChange = (newVariables: Variables) => {
        setVariables(newVariables);
    }

    const handleValueInput = (values: Values) => {
        setDisplayRendered(true);
        setValues(values);
        if (DEBUG) console.log('Set values: ', values);
    }

    const handleContentChange = (content: any) => {

    }

    // Show editable content when click on
    const handleEditorFocus = () => {
        setDisplayRendered(false);
    }

    return (
        <Flex align="center" justify="center" className="w-full h-full" gap={20} style={{ position: 'relative' }}>
            {/* <TextArea style={{ height: 820, width: 520 }} value={email.sourcePlainText || ''} onChange={handleInputChange} className="resize-none" /> */}
            <PlainTextEditor variables={variables} values={values} setVariables={handleVariableChange} updateEmail={handleContentChange} displayRendered={displayRendered} handleEditorFocus={handleEditorFocus} />
            <VariableForm variables={variables} values={values} setValue={handleValueInput} />
        </Flex>

    );
}

function PlainTextEditor({ variables, values, setVariables, updateEmail, displayRendered, handleEditorFocus }: { variables: Variables, values?: Values, setVariables: (variables: Variables) => void, updateEmail: (props: any) => void, displayRendered: boolean, handleEditorFocus: () => void }) {
    const [content, setContent] = useState<string>('');

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (DEBUG) console.log('Parsing variables');
        setContent(e.target.value);
        setVariables(new Variables(e.target.value));
    };

    const filledContent = useMemo(() => {
        if (!values) return content;
        if (DEBUG) console.log('Filling variables');
        const filled = variables.resolveWith(values, []);
        if (DEBUG) console.log('Filled variables', filled);
        return filled;
    }, [variables, values]);

    return (
        <div style={{ height: 820, width: 520, position: 'relative' }} onClick={handleEditorFocus}>
            <Textarea onChange={handleInput} style={{
                fontFamily: 'var(--ant-font-family)',
                borderRadius: ' 0 0 6px 6px',
                transition: 'all 0.2s',
                // display: displayRaw ? 'block' : 'none'
                height: 750, width: 520, overflowY: 'scroll'
            }} />
            <div className="renderView" style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: displayRendered ? '1' : '0', pointerEvents: displayRendered ? 'unset' : 'none', transition: 'all 0.2s'
            }}>
                <Textarea
                    value={filledContent}
                    onChange={() => { }}
                    style={{
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


export function VariableForm({ variables, values, setValue }: { variables: Variables, values?: Values, setValue: (values: Values) => void }) {
    const formVariables = useMemo(() => {
        return variables.getDisplayVariables(values)
    }, [variables, values]);

    return (
        <Flex direction="column" align="start" justify="center" className="h-full" gap={20} key={'form'}>
            {formVariables && formVariables.map((variable, index) => {
                return (
                    <VariableInput
                        key={'ve' + index}
                        index={index}
                        variable={variable}
                        value={values?.getLocalValue(variable.name)}
                        setValue={(value) => {
                            if (!values) values = new Values();
                            values.setValue(variable.name,
                                { value: value, source: 'user' }
                            );
                            setValue(new Values(values.initialValues));
                        }}
                    />)
            }
            )}
        </Flex>
    );
}

function VariableInput({ variable, value, setValue, index }: { variable: Variable, value: any, setValue: (value: any) => void, index: number }) {
    const [inputState, setInputState] = useState<string | null>('empty');
    const disabled = variable.hasParent;
    if (inputState === '' && value !== undefined && value !== null) {
        setInputState('empty');
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



// function RichTextEditor({ variables, values, setVariables, updateEmail, displayRendered, handleEditorFocus }: { variables: EmailVariable[], values?: ValueDict, setVariables: (variables: EmailVariable[]) => void, updateEmail: (props: any) => void, displayRendered: boolean, handleEditorFocus: () => void }) {
//     const { quill, quillRef, Quill } = useQuill({

//     });
//     const { quill: renderedQuill, quillRef: renderedQuillRef, Quill: RenderedQuill } = useQuill({ modules: { toolbar: false } });

//     // TODO: not do this every render, but useEffect isn't working.
//     if (Quill) {
//         // const Size = Quill.import('attributors/style/size');
//         // const fontSizeArray = new Array(100).fill(0).map((_, i) => `${i + 1}pt`);
//         // Size.whitelist = fontSizeArray;
//         // Quill.register(Size, true);
//     }

//     useEffect(() => {
//         if (!quill) return;
//         if (DEBUG) console.log('Setting up quill');
//         // On input, parse variables and update email
//         const handleInput = () => {
//             if (DEBUG) console.log('Parsing variables');
//             const timestamp = new Date().getTime();

//             if (!quill) return;
//             const newVariables = (parseVariables(quill.getText()));
//             updateEmail({ sourceRichText: quill.getContents(), sourcePlainText: quill.getText() });

//             if (DEBUG) console.log('Parsed variables in ' + (new Date().getTime() - timestamp) + 'ms ', newVariables);
//             setVariables(newVariables);
//         };
//         quill.on('text-change', () => handleInput());
//         return () => {
//             quill.off('text-change', () => handleInput());
//         }
//     }, [quill]);

//     useEffect(() => {
//         const render = async () => {
//             if (!renderedQuill || !quill || !variables) return;
//             renderedQuill.setContents(quill.getContents());
//             const timestamp = new Date().getTime();
//             const delta = new Delta(fillQuillVariables(variables, values));
//             renderedQuill.updateContents(delta, 'silent');
//             if (DEBUG) console.log('Rendered variables in ' + (new Date().getTime() - timestamp) + 'ms');
//             updateEmail({ filledRichText: renderedQuill.getContents(), filledPlainText: renderedQuill.getText() });
//             renderedQuill?.disable();
//         }
//         render();
//     }, [quill, variables, values]);

//     return (
//         <div style={{ height: 820, width: 520, position: 'relative' }} onClick={handleEditorFocus}>
//             <div ref={quillRef} style={{
//                 fontFamily: 'var(--ant-font-family)',
//                 borderRadius: ' 0 0 6px 6px',
//                 transition: 'all 0.2s',
//                 // display: displayRaw ? 'block' : 'none'
//                 height: 750, width: 520, overflowY: 'scroll'
//             }} />
//             <div className="renderView" style={{
//                 position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: displayRendered ? '1' : '0', pointerEvents: displayRendered ? 'unset' : 'none', transition: 'all 0.2s'
//             }}>
//                 <div ref={renderedQuillRef} style={{
//                     fontFamily: 'var(--ant-font-family)',
//                     borderRadius: ' 0 0 6px 6px',
//                     transition: 'all 0.2s',
//                     zIndex: 10,
//                     backgroundColor: 'white',
//                 }} />
//             </div>
//         </div>
//     );
// };