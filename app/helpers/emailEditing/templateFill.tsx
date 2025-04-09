import { Button, Flex } from "@mantine/core";
import { useContext, useEffect, useMemo, useState } from "react";
import { EditorContext } from "../../page";
import { TemplateView } from "./view";
import { Values } from "@/domain/schema/valueCollection";
import { Variables } from "@/domain/schema/variableCollection";
import { VariableForm } from "./form";


const DEBUG = true;
export function TemplateFill() {
    const [editorState, setEditorState] = useContext(EditorContext);

    const [variables, setVariables] = useState<Variables>(new Variables(''));
    const [values, setValues] = useState<Values>(new Values(editorState.email?.values?.initialValues ?? []));


    const handleValueInput = (values: Values) => {
        setValues(values);
        if (DEBUG) console.log('Set values: ', values);
    }

    const handleBack = () => {
        setEditorState({ ...editorState, step: 1 });
        console.log('Returning to state: ', { ...editorState, step: 1 });
    }

    const handleSubmit = async () => {
        setEditorState({ ...editorState, step: 3 });
        // console.log('Approved template. Editor state: ', { ...editorState, step: 3, email: { ...editorState.email, html: template, values: formValues } });
    }

    return (
        <Flex align="center" justify="center" direction='row' className="relative w-full h-full p-20 " gap={20}>
            <TemplateView setVariables={setVariables} values={values} />
            <Flex direction='column' className="" gap={20}>
                <Flex className="w-full" align="center" justify="space-between" gap={10}>
                    <Button variant="light" color="gray" onClick={handleBack}>Back</Button>
                    <Button variant="filled" onClick={handleSubmit}>Approve</Button>
                </Flex>
                <VariableForm variables={variables} values={values} setValue={handleValueInput} />
            </Flex>
        </Flex>
    );
}