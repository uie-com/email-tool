"use client";

import { Button, Flex, ScrollArea } from "@mantine/core";
import { useContext, useEffect, useMemo, useState } from "react";
import { EditorContext } from "@/domain/schema";
import { TemplateEditor, TemplateView } from "../components/view";
import { Values } from "@/domain/schema/valueCollection";
import { Variables } from "@/domain/schema/variableCollection";
import { VariableForm } from "../components/form";


const DEBUG = true;
export function TemplateFill() {
    const [editorState, setEditorState] = useContext(EditorContext);

    const [editorMode, setEditorMode] = useState<'variables' | 'code'>('variables');
    const [variables, setVariables] = useState<Variables>(new Variables(''));


    const handleValueInput = (values: Values) => {
        setEditorState({ ...editorState, email: { ...editorState.email, values: values } });
        if (DEBUG) console.log('Set values: ', values);
    }

    const handleBack = () => {
        setEditorState({ ...editorState, step: 1, email: { ...editorState.email } });
        console.log('Returning to state: ', { ...editorState, step: 1 });
    }

    const handleSubmit = async () => {
        console.log('Approved template. Editor state: ', { ...editorState, step: 3, email: { ...editorState.email, HTML: new Variables(editorState.email?.templateHTML ?? '').resolveWith(editorState.email?.values ?? new Values()) } });
        setEditorState((prev) => ({ ...prev, step: 3, email: { ...prev.email, HTML: new Variables(prev.email?.templateHTML ?? '').resolveWith(prev.email?.values ?? new Values()) } }));
    }

    const switchEditorMode = () => {
        setEditorMode((prev) => prev === 'variables' ? 'code' : 'variables');
    }

    return (
        <Flex align="center" justify="center" direction='row' className=" h-full  p-20" gap={20}>
            {
                editorMode === 'code' ?
                    <TemplateEditor className=" h-full " />
                    : null
            }
            <Flex direction='column' className="h-full" gap={20}>
                {
                    editorMode === 'code' ?
                        <Button variant="light" color="green" className=" min-h-10" onClick={switchEditorMode}>Return to Variables</Button>
                        : null
                }
                <TemplateView setVariables={setVariables} className={" !min-w-[48rem]  shrink h-full"} />
            </Flex>
            {
                editorMode === 'variables' ?
                    <Flex direction='column' className="" gap={20}>
                        <Button variant="light" color="green" onClick={switchEditorMode}>Edit HTML</Button>
                        <VariableForm variables={variables} values={editorState.email?.values} setValue={handleValueInput} />
                        <Flex className="w-full" align="center" justify="space-between" gap={10}>
                            <Button variant="light" color="gray" onClick={handleBack}>Back</Button>
                            <Button variant="filled" onClick={handleSubmit}>Approve</Button>
                        </Flex>
                    </Flex>
                    : null
            }
        </Flex>
    );
}