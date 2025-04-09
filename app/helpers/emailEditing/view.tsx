import { Values } from "@/domain/schema/valueCollection";
import { Variables } from "@/domain/schema/variableCollection";
import { Textarea } from "@mantine/core";
import { useState, useMemo, useEffect } from "react";

const DEBUG = false;

export function TemplateView({ setVariables, values }: { setVariables: (v: Variables) => void, values: Values }) {
    const [originalTemplate, setOriginalTemplate] = useState<string | undefined>();

    useEffect(() => {
        const fetchTemplate = async () =>
            values.finalValue('template').then(setOriginalTemplate);

        if (!originalTemplate && values.getCurrentValue('template')) {
            fetchTemplate();
        }
    }, [values.getCurrentValue('template')]);

    useEffect(() => {
        if (DEBUG) console.log('Template changed: ', originalTemplate);
        setOriginalTemplate(originalTemplate);
        setVariables(new Variables(originalTemplate ?? ''));
    }, [originalTemplate]);

    const filledTemplate = useMemo(() => {
        if (!originalTemplate) return '';
        const variables = new Variables(originalTemplate);
        const filled = variables.resolveWith(values, []);
        if (DEBUG) console.log('Filled template', filled);
        return filled;
    }, [originalTemplate, values]);

    return (
        <iframe
            style={{
                minHeight: "100%",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
                minWidth: "48rem",
            }}
            srcDoc={filledTemplate}>
        </iframe>
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