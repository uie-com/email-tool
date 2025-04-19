import { isValidHttpUrl } from "@/domain/parse/parseUtility";
import { Values } from "@/domain/schema/valueCollection";
import { Variables, Variable } from "@/domain/schema/variableCollection";
import { PRE_APPROVED_VALUES } from "@/domain/settings/settings";
import { Flex, MantineSize, TextInput, Textarea } from "@mantine/core";
import { DateInput, TimeInput } from "@mantine/dates";
import { IconCalendar, IconCalendarEventFilled, IconCalendarFilled, IconCalendarMonthFilled, IconCalendarWeek, IconCalendarWeekFilled, IconLink, IconLinkOff } from "@tabler/icons-react";
import dayjs from "dayjs";
import moment, { Moment } from "moment-timezone";
import { useMemo, useState } from "react";

const DEBUG = false;
export function VariableForm({ variables, values, setValue }: { variables: Variables, values?: Values, setValue: (values: Values) => void }) {
    const formVariables = useMemo(() => {
        return variables.getDisplayVariables(values)
    }, [variables, values]);

    return (
        <Flex direction="column" align="stretch" justify="center" className="h-full" gap={20} key={'form'}>
            {formVariables && formVariables.map((variable, index) => {
                if (values?.isHidden(variable.key) || PRE_APPROVED_VALUES.includes(variable.key))
                    return null;
                return (
                    <VariableInput
                        key={'ve' + index}
                        index={index}
                        variable={variable}
                        value={
                            variable.type === 'String' ? values?.getCurrentValue(variable.key) : values?.resolveValue(variable.key, true, true)
                        }
                        setValue={(value) => {
                            if (!values) values = new Values();
                            values.setValue(variable.key,
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

export function VariableInput({ variable, value, setValue, index, variant, variableName, className, size, disabled }: { variable?: Variable, value: any, setValue: (value: any) => void, index: number, variant?: string, variableName?: string, className?: string, size?: MantineSize, disabled?: boolean }) {
    const [inputState, setInputState] = useState<string | null>(
        typeof value !== 'string' || value.length === 0 ? 'empty' : (
            isValidHttpUrl(value) ? 'link' :
                value.indexOf('./') === 0 ? 'link' :
                    value.length > 0 ? 'broken' : null
        )
    );


    if (!variable)
        variable = new Variable('{' + variableName + '}', 0);




    const sharedProps = {
        disabled: variable.hasParent || disabled,
        variant: variant,
        className: className,
        size: size,
        classNames: {
            input: size === 'xl' ? '!text-3xl' : undefined
        },
        name: 'noAutofillSearch',
        label: variant === "unstyled" ? undefined : variable.name,
        placeholder: 'No ' + variable.name,
    };

    if (variable.type === 'String' && !((isValidHttpUrl(value as string) || value.indexOf('./') === 0) && (typeof value === 'string' && value.length > 5))) {
        return (
            <Textarea
                key={'vi' + index}
                value={value as string ?? ''}
                onChange={e => setValue(e.target.value)}
                autosize={true}
                minRows={1}
                maxRows={variant === "unstyled" ? undefined : 5}
                {...sharedProps}

            />
        )
    } else if (variable.type === 'Number') {

    } else if (variable.type === 'Date') {
        let date: Moment | undefined | Date = moment(value), time = '00:00';
        if (!date.isValid()) {
            date = undefined;
        } else {
            date = moment(value).toDate();
            time = moment(value).format('HH:mm');
        }
        return (
            <Flex direction="row" align={'end'} key={'vi' + index} gap={variant === 'unstyled' ? 0 : 2} >
                {variant === 'unstyled' ? <IconCalendarEventFilled size={18} opacity={0.8} className=" relative bottom-[0.55rem] mr-1.5" strokeWidth={1.5} /> : null}
                <DateInput
                    key={'vi' + index + 'date'}
                    valueFormat="dddd, MMMM D, YYYY"
                    value={date}
                    onChange={e => setValue(e)}
                    {...sharedProps}
                    styles={{ input: { minWidth: '1px' } }}
                />

                <TimeInput
                    value={time}
                    onChange={e => {
                        const [hours, minutes] = e.target.value.split(':');
                        const newDate = dayjs(value).hour(parseInt(hours)).minute(parseInt(minutes)).toDate();
                        setValue(newDate);
                    }}
                    {...sharedProps}
                    key={'vi' + index + 'time'}
                    mb={variant === 'unstyled' ? -0.25 : 0}
                />
            </Flex>
        )
    } else if (variable.type === 'Link' || variable.type === 'Banner' || variable.type === 'Image' || ((isValidHttpUrl(value as string) || value.indexOf('./') === 0) && (typeof value === 'string' && value.length > 5))) {
        return (
            <TextInput
                key={'vi' + index}
                value={value as string ?? ''}
                onChange={e => {
                    if (e.target.value === '') {
                        setInputState('empty');
                    } else if (isValidHttpUrl(e.target.value) || e.target.value.indexOf('./') === 0) {
                        setInputState('link');
                    } else {
                        setInputState('broken');
                    }
                    setValue(e.target.value)
                }}
                rightSection={inputState && (
                    inputState === 'empty' ? (null) :
                        inputState === 'link' ? (
                            <IconLink size={25} opacity={1} color='#228BE6' className=" cursor-pointer hover:stroke-blue-400 transition-all" strokeWidth={1.75} onMouseUp={() => {
                                window.open(value as string, '_blank');
                            }} />)
                            : inputState === 'broken' ?
                                (<IconLinkOff size={20} opacity={1} strokeWidth={1.5} />)
                                : null
                )}
                {...sharedProps}
                classNames={{ input: 'underline !text-[#228BE6]' }}

            />
        )
    } else if (variable.type === 'Body') {
        <Textarea
            key={'vi' + index}
            value={value as string}
            onChange={e => setValue(e.target.value)}
            autosize={true}
            minRows={2}
            maxRows={variant === "unstyled" ? undefined : 5}
            {...sharedProps}
        />
    }
}