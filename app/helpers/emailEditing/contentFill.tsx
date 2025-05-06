"use client";

import { fillQuillVariables } from "@/domain/parse/parseVariables";
import { Email } from "@/domain/schema";
import { useContext, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";

import 'quill/dist/quill.snow.css';
import { Flex, Textarea, TextInput } from "@mantine/core";
import { DateInput, TimeInput } from "@mantine/dates";
import { IconLink, IconLinkOff } from "@tabler/icons-react";
import { EditorContext } from "@/domain/schema/context";
import { Variable, Variables } from "@/domain/schema/variableCollection";
import { Values } from "@/domain/schema/valueCollection";
import { VariableForm } from "../components/form";
import { PlainTextEditor } from "../components/template";


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
        <Flex align="center" justify="center" className="w-full h-full" gap={20} style={{ position: 'relative' }}>
            <PlainTextEditor variables={variables} values={values} setVariables={handleVariableChange} displayRendered={displayRendered} handleEditorFocus={handleEditorFocus} />
            <VariableForm variables={variables} values={values} setValue={handleValueInput} />
        </Flex>

    );
}



