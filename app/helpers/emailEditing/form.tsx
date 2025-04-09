import { isValidHttpUrl } from "@/domain/parse/parseUtility";
import { Values } from "@/domain/schema/valueCollection";
import { Variables, Variable } from "@/domain/schema/variableCollection";
import { Flex, TextInput, Textarea } from "@mantine/core";
import { DateInput, TimeInput } from "@mantine/dates";
import { IconLink, IconLinkOff } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useMemo, useState } from "react";

export function VariableForm({ variables, values, setValue }: { variables: Variables, values?: Values, setValue: (values: Values) => void }) {
    const formVariables = useMemo(() => {
        return variables.getDisplayVariables(values)
    }, [variables, values]);

    return (
        <Flex direction="column" align="start" justify="center" className="h-full" gap={20} key={'form'}>
            {formVariables && formVariables.map((variable, index) => {
                return (
                    <VariableInput
                        key={'ve' + index}
                        index={index}
                        variable={variable}
                        value={values?.getCurrentValue(variable.name)}
                        setValue={(value) => {
                            if (!values) values = new Values();
                            values.setValue(variable.name,
                                { value: value, source: 'user' }
                            );
                            setValue(new Values(values.initialValues));
                        }}
                    />)
            }
            )}
        </Flex>
    );
}

function VariableInput({ variable, value, setValue, index }: { variable: Variable, value: any, setValue: (value: any) => void, index: number }) {
    const [inputState, setInputState] = useState<string | null>('empty');
    const disabled = variable.hasParent;
    if (inputState === '' && value !== undefined && value !== null) {
        setInputState('empty');
    }

    if (variable.type === 'String') {
        return (
            <TextInput
                key={'vi' + index}
                label={variable.writtenName}
                value={value as string ?? ''}
                onChange={e => setValue(e.target.value)}
                disabled={disabled}
                name="noAutofillSearch"
            />
        )
    } else if (variable.type === 'Number') {

    } else if (variable.type === 'Date') {
        return (
            <Flex direction="row" align={'end'} key={'vi' + index} gap={2} >
                <DateInput
                    valueFormat="dddd, MMMM D, YYYY"
                    label={variable.writtenName}
                    value={value as Date}
                    onChange={e => setValue(e)}
                    disabled={disabled}
                    name="noAutofillSearch"
                />
                <TimeInput
                    value={value as Date ? dayjs((value as Date))?.format('HH:mm') : '00:00'}
                    onChange={e => {
                        const [hours, minutes] = e.target.value.split(':');
                        const newDate = dayjs(value).hour(parseInt(hours)).minute(parseInt(minutes)).toDate();
                        setValue(newDate);
                    }}
                    disabled={disabled}
                    name="noAutofillSearch"
                />
            </Flex>
        )
    } else if (variable.type === 'Banner') {

    } else if (variable.type === 'Image') {

    } else if (variable.type === 'Link') {
        return (
            <TextInput
                key={'vi' + index}
                label={variable.writtenName}
                value={value as string ?? ''}
                onChange={e => {
                    if (e.target.value === '') {
                        setInputState('empty');
                    } else if (isValidHttpUrl(e.target.value)) {
                        setInputState('link');
                    } else {
                        setInputState('broken');
                    }
                    setValue(e.target.value)
                }}
                disabled={disabled}
                name="noAutofillSearch"
                rightSection={inputState && (
                    inputState === 'empty' ? (null) :
                        inputState === 'link' ? (<IconLink size={20} opacity={1} strokeWidth={1.5} />) :
                            inputState === 'broken' ? (<IconLinkOff size={20} opacity={1} strokeWidth={1.5} />) : null
                )}
            />
        )
    } else if (variable.type === 'Body') {
        <Textarea key={'vi' + index}
            label={variable.writtenName}
            value={value as string}
            onChange={e => setValue(e.target.value)}
            disabled={disabled}
            name="noAutofillSearch"
            autosize={true}
            minRows={2}
            maxRows={5}
        />
    }
}