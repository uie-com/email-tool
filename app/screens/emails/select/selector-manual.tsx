import { VariableInput } from "@/app/components/variables/variable-form";
import { MULTI_SELECT_MANUAL_EMAIL_PARAMS } from "@/config/email-types";
import { EditorContext } from "@/domain/context";
import { createProgramForm, Form } from "@/domain/email/identifiers/parsePrograms";
import { focusOnNext, focusOnPrev } from "@/domain/interface/focus";
import { Email } from "@/domain/schema";
import { Values } from "@/domain/values/valueCollection";
import { normalizeName } from "@/domain/variables/normalize";
import { Button, Combobox, Flex, MultiSelect, TextInput, useCombobox } from "@mantine/core";
import { useContext, useEffect, useMemo, useState } from "react";

export function EmailCreator() {
    const [editorState, setEditorState] = useContext(EditorContext);
    const [values, setValues] = useState<{ [key: string]: string | Date }>({
        'Send Date': new Date(),
        'Audience': '',
    });


    const formSchema = useMemo(() => {
        return createProgramForm(values);
    }, [values]);

    const handleValueChange = (key: string, value: string | Date) => {
        if (key === 'Send To') {
            values['Audience'] = value as string;
            value = (value as string).split(',')[0].trim();
        }

        const newValues = Object.keys(values).filter((key) => {
            return Object.keys(formSchema).includes(key) || key === 'Send Date' || key === 'Audience';
        }).reduce<{ [key: string]: string | Date }>((acc, key) => {
            acc[key] = values[key];
            return acc;
        }, {});

        setValues({ ...newValues, [key]: value });
    }

    const handleSubmit = async () => {
        const emailValues = new Values();
        emailValues.addDict(values, 'email');
        emailValues.setValue('Creation Type', { value: 'manual', source: 'email' });
        const email = new Email(emailValues);

        console.log('Starting an email as ', email);
        setEditorState({ step: 1, email: email });
    }

    const handleReset = () => {
        setValues({});
    }

    return (
        <Flex align="start" justify="center" direction='column' className="" gap={20}>
            <VariableInput value={values['Send Date']} variableName={'Send Date'} setValue={(v) => handleValueChange('Send Date', v)} index={0} />
            <FormBuilder form={formSchema} values={values} handleValueChange={handleValueChange} />
            <Flex align="center" justify="center" gap={10}>
                <Button variant="light" color="gray" onClick={handleReset}>Reset</Button>
                <Button variant="filled" onClick={handleSubmit}>Create</Button>
            </Flex>
        </Flex>
    )
}

function FormBuilder({ form, values, handleValueChange }: { form: Form, values: { [key: string]: string | Date }, handleValueChange: (key: string, value: string | Date) => void }) {

    return (
        <>
            {Object.keys(form).map((key, index) => {
                if (MULTI_SELECT_MANUAL_EMAIL_PARAMS.includes(key))
                    return (
                        <MultiSelect
                            key={key}
                            label={key}
                            data={form[key].options}
                            onChange={(value) => {
                                handleValueChange(key, value.join(', '));
                            }}
                            searchable
                            clearable
                            placeholder={`Select ${key}`}
                            maxDropdownHeight={300}
                            style={{ width: '100%' }}
                        />
                    )
                return (
                    <QuickAutocomplete
                        key={key}
                        defaultValue={(form[key].default ?? '')}
                        label={key}
                        data={form[key].options}
                        index={index}
                        onChange={(value) => {
                            handleValueChange(key, value);
                        }}
                    />
                )
            })}
        </>
    )
}

function QuickAutocomplete({ defaultValue, label, data, onChange, index }: { defaultValue: string, label: string, data: string[], onChange: (value: string) => void, index?: number }) {
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
        if (!options[0]) return;
        const option = options[0].props.value;
        combobox.selectFirstOption();

        if (option && value.length > 0 && normalizeName(option ?? '') === normalizeName(value) && !lostFocus) {
            setValue(option ?? '');
            onChange(option ?? '');
            setLostFocus(true);
            combobox.closeDropdown();
            focusOnNext(document);
        }
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
                    id={'input' + index}
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
