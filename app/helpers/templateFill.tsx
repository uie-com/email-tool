import { Button, Flex } from "@mantine/core";
import { useContext, useEffect, useMemo, useState } from "react";
import { EditorContext } from "../page";
import { EmailVariable, ValueDict } from "@/domain/schema";
import { VariableForm } from "./contentFill";

const DEBUG = true;
export function TemplateFill() {
    const [editorState, setEditorState] = useContext(EditorContext);
    const [originalTemplate, setOriginalTemplate] = useState<string | undefined>(editorState.email?.html);
    const [template, setTemplate] = useState<string | undefined>(editorState.email?.html);
    const [parsedVariables, setParsedVariables] = useState<EmailVariable[]>([]);
    const emailValues = useMemo(() => {
        if (DEBUG) console.log('Getting email values: ', editorState.email?.settings, editorState.email?.values);
        return { ...editorState.email?.settings, ...editorState.email?.values };
    }, [editorState.email?.settings, editorState.email?.values]);
    const [formValues, setFormValues] = useState<ValueDict>(emailValues);


    useEffect(() => {
        const fetchTemplate = async (url: string) => {
            if (DEBUG) console.log('Fetching template from: ', url);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            console.log('Fetched template: ', text);

            handleTemplateChange(text);
        }

        if (!originalTemplate && emailValues && emailValues['Template'] && emailValues['Template'].value) {
            fetchTemplate(emailValues['Template'].value as string);
        }
    }, [emailValues['Template']]);

    const handleValueInput = (newValues: ValueDict) => {
        if (DEBUG) console.log('New values: ', newValues);
        fillTemplate(originalTemplate ?? '', newValues);
        setFormValues({ ...formValues, ...newValues });
    }

    const handleTemplateChange = (content: string) => {
        if (DEBUG) console.log('Template changed: ', content);
        setOriginalTemplate(content);
        setParsedVariables(parseVariables(content));
        fillTemplate(content, formValues);
    }

    const fillTemplate = (newTemplate: string, newValues: ValueDict) => {
        if (DEBUG) console.log('Filling template with: ', { newTemplate: newTemplate, newValues: newValues });
        const filled = fillTextVariables(newTemplate ?? '', sanitizeValueDict(newValues));
        setTemplate(filled);
    }

    const handleBack = () => {
        setEditorState({ ...editorState, step: 1 });
        console.log('Returning to state: ', { ...editorState, step: 1 });
    }

    const handleSubmit = async () => {
        setEditorState({ ...editorState, step: 3 });
        console.log('Approved template. Editor state: ', { ...editorState, step: 3, email: { ...editorState.email, html: template, values: formValues } });
    }

    console.log('Current state: ', { editorState, template, parsedVariables, formValues });

    return (
        <Flex align="center" justify="center" direction='row' className="relative w-full h-full p-20 " gap={20}>
            <iframe
                style={{
                    minHeight: "100%",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    minWidth: "48rem",
                }}
                srcDoc={template}>
            </iframe>
            <Flex direction='column' className="" gap={20}>
                <Flex className="w-full" align="center" justify="space-between" gap={10}>
                    <Button variant="light" color="gray" onClick={handleBack}>Back</Button>
                    <Button variant="filled" onClick={handleSubmit}>Approve</Button>
                </Flex>
                <VariableForm variables={parsedVariables} values={formValues} setValue={handleValueInput} />
            </Flex>
        </Flex>
    );
}