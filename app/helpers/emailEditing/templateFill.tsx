"use client";

import { Box, Button, Flex, ScrollArea, Text } from "@mantine/core";
import { useContext, useEffect, useMemo, useState } from "react";
import { EditorContext } from "@/domain/schema";
import { TemplateEditor, TemplateView } from "../components/template";
import { Values } from "@/domain/schema/valueCollection";
import { Variables } from "@/domain/schema/variableCollection";
import { VariableForm } from "../components/form";
import { fixTemplate } from "@/domain/parse/parseTemplates";


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
        console.log('Approved template. Editor state: ', { ...editorState, step: 3, email: { ...editorState.email, HTML: new Variables(fixTemplate(editorState.email?.templateHTML ?? '', editorState.email?.values ?? new Values()) ?? '').resolveWith(editorState.email?.values ?? new Values()) } });
        setEditorState((prev) => ({ ...prev, step: 3, email: { ...prev.email, HTML: new Variables(fixTemplate(editorState.email?.templateHTML ?? '', editorState.email?.values ?? new Values()) ?? '').resolveWith(editorState.email?.values ?? new Values()) } }));
    }

    const switchEditorMode = () => {
        setEditorMode((prev) => prev === 'variables' ? 'code' : 'variables');
    }

    return (
        <Flex justify="center" className={" h-[calc(100vh)] p-20 " + (editorMode === 'code' ? "flex-col 2xl:flex-row" : 'flex-row')} gap={20}>

            <Flex direction='column' className={"h-full w-full " + (editorMode === 'code' ? " max-h-[36rem] max-w-none 2xl:max-w-[36rem] 2xl:max-h-full" : '')} gap={20}>
                {
                    editorMode === 'code' ?
                        <Button variant="light" color="green" className=" min-h-10 max-w-48 ml-auto" onClick={switchEditorMode}>Return to Variables</Button>
                        : null
                }
                <TemplateView setVariables={setVariables} className={" w-full h-full !min-w-[28rem]   "} showToggle />
            </Flex>
            {
                editorMode === 'variables' ?
                    <Flex direction='column' className=" h-full py-6 pr-2 w-1/2 " gap={20}>
                        <Flex className="w-full" align="center" justify="space-between" gap={10}>
                            <Button variant="light" color="gray" miw='6rem' onClick={handleBack}>Back</Button>
                            <Button variant="light" color="green" w='100%' onClick={switchEditorMode}>Edit HTML</Button>
                        </Flex>
                        <ScrollArea className=" overflow-y-scroll pb-4 pt-2 ">
                            <VariableForm variables={variables} values={editorState.email?.values} setValue={handleValueInput} />
                        </ScrollArea>
                        <Flex className="w-full" align="center" justify="start" gap={10}>
                            {/* <Button variant="light" color="gray" onClick={handleBack}>Back</Button> */}
                            <Button variant="filled" onClick={handleSubmit} className=" ml-auto">Approve Email</Button>
                        </Flex>
                    </Flex>

                    : null
            }
            {
                editorMode === 'code' ?
                    <TemplateEditor />

                    : null
            }
        </Flex>
    );
}