"use client";

import { useContext, useState } from "react";

import { PlainTextEditor } from "@/app/components/template/html-preview";
import { VariableForm } from "@/app/components/variables/variable-form";
import { EditorContext } from "@/domain/context";
import { Values } from "@/domain/values/valueCollection";
import { Variables } from "@/domain/variables/variableCollection";
import { Flex } from "@mantine/core";
import 'quill/dist/quill.snow.css';


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

    const handleEditorFocus = () => {
        setDisplayRendered(false);
    }

    return (
        <Flex dir="column" align="center" justify="center" className="w-full h-full" gap={20} style={{ position: 'relative' }}>
            <Flex align="center" justify="center" className="w-full h-full" gap={20} style={{ position: 'relative' }}>
                <PlainTextEditor variables={variables} values={values} setVariables={handleVariableChange} displayRendered={displayRendered} handleEditorFocus={handleEditorFocus} />
                <VariableForm variables={variables} values={values} setValue={handleValueInput} />
            </Flex>

        </Flex>


    );
}



