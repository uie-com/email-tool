import { fixTemplate } from "@/domain/parse/parseTemplates";
import { resolveTemplateRemotely } from "@/domain/parse/remoteParse";
import { EditorContext } from "@/domain/schema";
import { Value, Values } from "@/domain/schema/valueCollection";
import { Variables } from "@/domain/schema/variableCollection";
import { Anchor, Flex, Loader, Text, Textarea } from "@mantine/core";
import { useForceUpdate } from "@mantine/hooks";
import { Editor } from "@monaco-editor/react";
import { IconFileUnknown } from "@tabler/icons-react";
import React, { useState, useMemo, useEffect, useContext, useRef } from "react";

const DEBUG = true;

export function TemplateView({ setVariables, className, showToggle }: { setVariables: (v: Variables) => void, className?: string, showToggle: boolean }) {
    const [editorState, setEditorState] = useContext(EditorContext);
    const [filledTemplate, setFilledTemplate] = useState<string>('');
    const values = editorState.email?.values ?? new Values();

    const [showOriginal, setShowOriginal] = useState(false);

    const currentFilled = useRef<string>('');
    const currentlyRenderedEmail = useRef<string>(editorState.email?.template ?? '');

    const waitingTimeout = useRef<NodeJS.Timeout | null>(null);
    const forceUpdate = useForceUpdate();

    const noTemplateFound = useMemo(() => {
        return !editorState.email?.templateHTML || editorState.email?.templateHTML.length < 100
    }, [editorState.email?.templateHTML]);

    useEffect(() => {
        const fetchTemplate = async () => {
            const templateObject = values.getValueObj('template');
            if (!templateObject) return console.log('[TEMPLATE] No template object found', values);
            const templateValue = templateObject.source('user', 'settings');
            if (DEBUG) console.log('[TEMPLATE] Fetching template', templateValue);
            if (!templateValue) return console.log('[TEMPLATE] No template value found', templateObject);
            try {
                await templateValue?.populateRemote(values);

                if (DEBUG) console.log('[TEMPLATE] Fetched template', templateValue);
                setEditorState({ ...editorState, email: { ...editorState.email, templateHTML: fixTemplate(templateValue.source('remote').currentValue), template: templateObject.source('user', 'settings').currentValue } });
            } catch {
                console.error('Error fetching template', templateValue);
                setEditorState({ ...editorState, email: { ...editorState.email, templateHTML: '', template: templateObject.source('user', 'settings').currentValue } });
            }
        }

        if (values && values.getCurrentValue('template')
            && values.getValueObj('template')?.source('user', 'settings').currentValue !== editorState.email?.template
        ) {
            setFilledTemplate('');
            fetchTemplate();
        }
    }, [JSON.stringify(values.getValueObj('template'))]);

    useEffect(() => {
        const templateHTML = editorState.email?.templateHTML;
        if (!templateHTML) return;
        if (templateHTML.includes('data-mantine-color-scheme')) {
            return setEditorState({ ...editorState, email: { ...editorState.email, templateHTML: '', template: '' } });
        }
        const variables = new Variables(templateHTML);
        setVariables(variables);
        if (DEBUG) console.log('[TEMPLATE] Filling template', templateHTML);
        const filled = variables.resolveWith(values);
        if (DEBUG) console.log('[TEMPLATE] Filled template', filled);

        currentFilled.current = (filled);

        if (waitingTimeout.current)
            clearTimeout(waitingTimeout.current);

        waitingTimeout.current = setTimeout(() => {
            if (DEBUG) console.log('[TEMPLATE] Waited for template to be filled');
            waitingTimeout.current = null;
            currentlyRenderedEmail.current = editorState.email?.template ?? '';

            if (currentFilled.current !== filledTemplate)
                setFilledTemplate(currentFilled.current);
            else
                forceUpdate();

        }, 1000);
    }, [editorState.email?.templateHTML, JSON.stringify(values)]);

    if (DEBUG) console.log('[TEMPLATE] Rendering template view of ' + editorState.email?.template + ' with ' + ((currentlyRenderedEmail.current !== editorState.email?.template) ? 0 : filledTemplate.length) + ' characters');

    return (
        <div className={className + ' relative'} >
            <Flex
                className={"absolute top-0 left-0 right-0 bottom-0 z-10 backdrop-blur-sm transition-opacity delay-100 overflow-hidden pointer-events-none " + ((waitingTimeout.current || noTemplateFound || (currentlyRenderedEmail.current !== editorState.email?.template)) ? 'opacity-100' : 'opacity-0') + (noTemplateFound ? ' bg-gray-50 ' : '')}
                align={"center"}
                justify="center"
                gap={30}
                direction='column'
            >
                {
                    noTemplateFound ?
                        <>
                            <IconFileUnknown
                                size={200}
                                color="gray"
                                className="opacity-50"
                                stroke={2}
                            />
                            <Text className="opacity-80 scale-[280%]" size="xl" fw={900} c='gray'>Couldn't find</Text>
                            <Text className="opacity-80 scale-[280%]" size="xl" fw={900} c='gray'>Template</Text>
                        </>
                        : <Loader size="xl" color="blue" variant="lines" className="" />
                }
            </Flex>
            <iframe
                className="w-full h-full"
                style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                }}
                srcDoc={(currentlyRenderedEmail.current !== editorState.email?.template) ? '' : (showOriginal ? editorState.email?.templateHTML : filledTemplate)} >
            </iframe>
            {showToggle ? <Anchor c='dimmed' size="xs" className=" absolute right-4 top-3 hover:underline cursor-pointer opacity-60" onClick={() => setShowOriginal((prev) => !prev)}>{showOriginal ? 'Show filled' : 'Show original'}</Anchor> : null}
        </div>
    )
}

export function TemplateEditor({ className }: { className?: string }) {
    const [editorState, setEditorState] = useContext(EditorContext);

    const handleChange = (value: string | undefined) => {
        if (DEBUG) console.log('[TEMPLATE] Template changed: ', value);
        setEditorState((prev) => ({ ...prev, email: { ...prev.email, templateHTML: value } }));
    }


    if (!editorState.email?.templateHTML || editorState.email?.templateHTML.length < 100)
        return (
            <div className="flex items-center justify-center h-full border-[1px] border-gray-200 rounded-lg">
                <Loader></Loader>
            </div>
        )

    return (
        <Editor height="100%" width='100%'
            defaultLanguage="html"
            defaultValue={editorState.email.templateHTML}
            onChange={handleChange}
            className={"rounded-lg overflow-hidden absolute top-0 bottom-0 right-0 left-0 " + className}
            wrapperProps={{
                className: "relative",
                style: {
                    flex: 1,
                    height: undefined
                }
            }}
            theme="vs-dark"
            options={{
                wordWrap: "on",
            }} />
    )
}



export function PlainTextEditor({ variables, values, setVariables, displayRendered, handleEditorFocus }: { variables: Variables, values?: Values, setVariables: (variables: Variables) => void, displayRendered: boolean, handleEditorFocus: () => void }) {
    const [content, setContent] = useState<string>('');

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (DEBUG) console.log('[TEMPLATE] Parsing variables');
        setContent(e.target.value);
        setVariables(new Variables(e.target.value));
    };

    const filledContent = useMemo(() => {
        if (!values) return content;
        if (DEBUG) console.log('[TEMPLATE] Filling variables');
        const filled = variables.resolveWith(values);
        if (DEBUG) console.log('[TEMPLATE] Filled variables', filled);
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
//         if (DEBUG) console.log('[TEMPLATE] Setting up quill');
//         // On input, parse variables and update email
//         const handleInput = () => {
//             if (DEBUG) console.log('[TEMPLATE] Parsing variables');
//             const timestamp = new Date().getTime();

//             if (!quill) return;
//             const newVariables = (parseVariables(quill.getText()));
//             updateEmail({ sourceRichText: quill.getContents(), sourcePlainText: quill.getText() });

//             if (DEBUG) console.log('[TEMPLATE] Parsed variables in ' + (new Date().getTime() - timestamp) + 'ms ', newVariables);
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
//             if (DEBUG) console.log('[TEMPLATE] Rendered variables in ' + (new Date().getTime() - timestamp) + 'ms');
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