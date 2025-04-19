import { EditorContext } from "@/domain/schema";
import { useContext, useEffect, useMemo, useState } from "react";

import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Flex, Text, Title, Pill, Group } from '@mantine/core';
import { VariableInput } from "./form";
import { Values } from "@/domain/schema/valueCollection";


export function RequireValues({ requiredValues, handleReturn }: { requiredValues: string[], handleReturn?: () => void }) {
    const [editorState, setEditorState] = useContext(EditorContext);
    const [missingValues, setMissingValues] = useState<string[]>([]);
    const [originalMissingValues, setOriginalMissingValues] = useState<string[]>([]);

    const [opened, { open, close }] = useDisclosure(false);

    const handleClose = () => {
        if (!handleReturn)
            handleBack();
        else
            handleReturn();
        close();
    }

    const handleBack = () => {
        setEditorState((prev) => ({ ...prev, step: prev.step - 1 }));
        close();
    }

    const handleContinue = () => {
        close();
        setOriginalMissingValues([]);
    }

    useEffect(() => {
        const missingValues = requiredValues.map((value) => {
            return editorState.email?.values?.resolveValue(value) ? undefined : value;
        }).filter((value) => value !== undefined)

        if (missingValues.length > 0)
            open();

        setMissingValues(missingValues);
        if (originalMissingValues.length === 0)
            setOriginalMissingValues(missingValues);

    }, [JSON.stringify(editorState.email?.values), requiredValues]);

    const setValue = (name: string, value: any) => {
        const newValues = new Values(editorState.email?.values?.initialValues);
        newValues.setValue(name, { value: value, source: 'user' });
        setEditorState((prev) => ({ ...prev, email: { ...prev.email, values: newValues } }));
    }

    return (
        <Modal key={'rv' + requiredValues} opened={opened} onClose={handleClose} centered withCloseButton={false}>
            <Flex gap={20} direction='column' align='start' justify='center' className="h-full" p={10}>
                <Title order={3} fw={600}>The following values are required <br></br> for this step:</Title>
                <ul>
                    {originalMissingValues.map((value) => (
                        <VariableInput
                            variableName={value}
                            value={editorState.email?.values?.resolveValue(value, true)}
                            index={0}
                            setValue={(v) => setValue(value, v)}
                            className=""
                            size="sm"
                        />
                    ))}
                </ul>
                <Group>
                    <Button color="gray" onClick={handleBack}>Return</Button>
                    <Button onClick={handleContinue} disabled={missingValues.length > 0}>Continue</Button>
                </Group>


            </Flex>
        </Modal>
    );
}