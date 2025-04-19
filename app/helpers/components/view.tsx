import { EditorContext } from "@/domain/schema";
import { Value, Values } from "@/domain/schema/valueCollection";
import { Variables } from "@/domain/schema/variableCollection";
import { Loader, Textarea } from "@mantine/core";
import { Editor } from "@monaco-editor/react";
import { useState, useMemo, useEffect, useContext } from "react";

const DEBUG = false;

export function TemplateView({ setVariables, className }: { setVariables: (v: Variables) => void, className?: string }) {
    const [editorState, setEditorState] = useContext(EditorContext);
    const [filledTemplate, setFilledTemplate] = useState<string>('');
    const values = editorState.email?.values ?? new Values();

    useEffect(() => {
        const fetchTemplate = async () => {
            const templateObject = values.getValueObj('template');
            if (!templateObject) return;
            const templateValue = templateObject.source('user', 'settings');
            if (DEBUG) console.log('Fetching template', templateValue);
            if (!templateValue) return;
            try {
                await templateValue?.populateRemote(values);
                if (DEBUG) console.log('Fetched template', templateValue);
                setEditorState({ ...editorState, email: { ...editorState.email, templateHTML: templateValue.source('remote').currentValue, template: templateObject.source('user', 'settings').currentValue } });
            } catch {
                console.error('Error fetching template', templateValue);
                setEditorState({ ...editorState, email: { ...editorState.email, templateHTML: '', template: templateObject.source('user', 'settings').currentValue } });
            }
        }

        if (values && values.getCurrentValue('template') && values.getValueObj('template')?.source('user', 'settings').currentValue !== editorState.email?.template) {
            fetchTemplate();
        }
    }, [values, values.getValueObj('template')]);

    useEffect(() => {
        const templateHTML = editorState.email?.templateHTML;
        if (!templateHTML) return;
        const variables = new Variables(templateHTML);
        setVariables(new Variables(templateHTML ?? ''));
        const filled = variables.resolveWith(values);
        if (DEBUG) console.log('Filled template', filled);
        setFilledTemplate(filled);
    }, [editorState.email?.templateHTML, JSON.stringify(values)]);


    if (filledTemplate.length < 100)
        return (
            <div className="flex items-center justify-center h-full border-[1px] border-gray-200 rounded-lg">
                <Loader></Loader>
            </div>
        )
    return (
        <iframe
            className={className}
            style={{
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
            }}
            srcDoc={filledTemplate}>
        </iframe>
    )
}

export function TemplateEditor({ className }: { className?: string }) {
    const [editorState, setEditorState] = useContext(EditorContext);

    const handleChange = (value: string | undefined) => {
        if (DEBUG) console.log('Template changed: ', value);
        setEditorState((prev) => ({ ...prev, email: { ...prev.email, templateHTML: value } }));
    }


    if (!editorState.email?.templateHTML || editorState.email?.templateHTML.length < 100)
        return (
            <div className="flex items-center justify-center h-full border-[1px] border-gray-200 rounded-lg">
                <Loader></Loader>
            </div>
        )

    return (
        <Editor height="100%" defaultLanguage="html" defaultValue={editorState.email.templateHTML} onChange={handleChange} className={"rounded-lg overflow-hidden " + className} theme="vs-dark" />
    )
}



export function PlainTextEditor({ variables, values, setVariables, displayRendered, handleEditorFocus }: { variables: Variables, values?: Values, setVariables: (variables: Variables) => void, displayRendered: boolean, handleEditorFocus: () => void }) {
    const [content, setContent] = useState<string>('');

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (DEBUG) console.log('Parsing variables');
        setContent(e.target.value);
        setVariables(new Variables(e.target.value));
    };

    const filledContent = useMemo(() => {
        if (!values) return content;
        if (DEBUG) console.log('Filling variables');
        const filled = variables.resolveWith(values);
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