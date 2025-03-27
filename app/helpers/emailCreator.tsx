import { FormSchema } from "@/domain/schema";
import { Autocomplete, Button, Combobox, Flex, TextInput, useCombobox } from "@mantine/core";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { EditorContext } from "../page";
import { createProgramForm, createTagsFromForm } from "@/domain/parse/parsePrograms";
import { PROGRAM_SCHEMA } from "@/domain/settings/programs";
import { focusOnNext, focusOnPrev } from "@/domain/form";

export function EmailCreator() {
    const [editorState, setEditorState] = useContext(EditorContext);
    const [values, setValues] = useState<{ [key: string]: string }>({});


    const formSchema = useMemo(() => {
        return createProgramForm(PROGRAM_SCHEMA, values);
    }, [values]);

    const handleValueChange = (key: string, value: string) => {
        const newValues = Object.keys(values).filter((key) => {
            return Object.keys(formSchema).includes(key);
        }).reduce<{ [key: string]: string }>((acc, key) => {
            acc[key] = values[key];
            return acc;
        }, {});

        setValues({ ...newValues, [key]: value });
    }

    const handleSubmit = () => {
        console.log('Starting an email with: ', values);
        const attributes = createTagsFromForm(values);
        setEditorState({ step: 1, email: { attributes } });
    }

    const handleReset = () => {
        setValues({});
    }

    return (
        <Flex align="center" justify="center" direction='column' className="h-full w-full relative" gap={20}>
            <Flex align="start" justify="center" direction='column' className="rounded-lg p-4 min-w-96 bg-gray-50 border-1 border-gray-200" gap={20}>
                <h1>Create new email</h1>
                <FormBuilder form={formSchema} values={values} handleValueChange={handleValueChange} />
                <Flex align="center" justify="center" gap={10}>
                    <Button variant="light" color="gray" onClick={handleReset}>Reset</Button>
                    <Button variant="filled" onClick={handleSubmit}>Create</Button>
                </Flex>
            </Flex>
        </Flex>
    )
}

function FormBuilder({ form, values, handleValueChange }: { form: FormSchema, values: { [key: string]: string }, handleValueChange: (key: string, value: string) => void }) {

    return (
        <>
            {Object.keys(form).map((key, index) => {
                return (
                    <QuickAutocomplete
                        key={key}
                        defaultValue={(form[key].default ?? '')}
                        label={key}
                        data={form[key].options}
                        onChange={(value) => {
                            handleValueChange(key, value);
                        }}
                    />
                )
            })}
        </>
    )
}

function QuickAutocomplete({ defaultValue, label, data, onChange }: { defaultValue: string, label: string, data: string[], onChange: (value: string) => void }) {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const [value, setValue] = useState(defaultValue);
    const [lostFocus, setLostFocus] = useState(false);

    const filteredOptions = data.filter((item) => item.toLowerCase().includes(value.toLowerCase()));
    const options = filteredOptions.map((item) => (
        <Combobox.Option value={item} key={item}>
            {item}
        </Combobox.Option>
    ));

    useEffect(() => {
        // we need to wait for options to render before we can select first one
        combobox.selectFirstOption();
    }, [value]);

    return (
        <Combobox
            onOptionSubmit={(optionValue) => {
                setValue(optionValue);
                combobox.closeDropdown();
                onChange(optionValue);
                focusOnNext(document);
            }}
            store={combobox}
            withinPortal={false}
        >
            <Combobox.Target>
                <TextInput
                    label={label}
                    placeholder={label}
                    name={label + '-search'}
                    id={label}
                    value={value}
                    onChange={(event) => {
                        setValue(event.currentTarget.value);
                        onChange(event.currentTarget.value);
                    }}
                    onClick={() => combobox.openDropdown()}
                    onFocus={() => combobox.openDropdown()}
                    onBlur={() => {
                        combobox.closeDropdown()
                        setLostFocus(true);
                    }}
                    onKeyDown={(event) => {
                        if (event.key === 'Backspace' && lostFocus && value !== '') {
                            setValue('');
                            onChange('');
                        } else if (event.key === 'Backspace' && value === '') {
                            focusOnPrev(document);
                            event.preventDefault();
                        }
                        else if (event.key === 'Enter') {

                        }
                        else {
                            combobox.openDropdown();
                            setLostFocus(false);
                        }
                    }}
                />
            </Combobox.Target>

            <Combobox.Dropdown>
                <Combobox.Options>
                    {options.length === 0 ? <Combobox.Empty>Press Enter to use Other Value</Combobox.Empty> : options}
                </Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    )
}