import { isValidHttpUrl } from "@/domain/parse/parseUtility";
import { Values } from "@/domain/schema/valueCollection";
import { Variables, Variable } from "@/domain/schema/variableCollection";
import { PRE_APPROVED_VALUES } from "@/domain/settings/settings";
import { Flex, MantineSize, TextInput, Textarea, ThemeIcon } from "@mantine/core";
import { DateInput, TimeInput } from "@mantine/dates";
import { IconCalendar, IconCalendarEventFilled, IconCalendarFilled, IconCalendarMonthFilled, IconCalendarWeek, IconCalendarWeekFilled, IconExternalLink, IconExternalLinkOff, IconLink, IconLinkOff } from "@tabler/icons-react";
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
    const linkState = useMemo(() => {
        if (value === '' || typeof value !== 'string') {
            return ('empty');
        } else if (isValidHttpUrl(value.trim()) || value.indexOf('./') === 0) {
            return ('link');
        } else {
            return ('broken');
        }
    }, [value]);
    const [showPreview, setShowPreview] = useState(false);

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
                maxRows={variant === "unstyled" ? undefined : 10}
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
            <Textarea
                key={'vi' + index}
                onChange={e => setValue(e.target.value)}
                value={value as string ?? ''}
                rightSection={
                    <>
                        {linkState && (
                            linkState === 'empty' ? (null) :
                                linkState === 'link' ? (
                                    <ThemeIcon color="blue" pb={1} variant="light" className=" !absolute top-1.5 right-1 rounded-full" style={{ background: 'none' }}>
                                        <IconExternalLink size={26} opacity={1} className=" cursor-pointer  hover:stroke-blue-500 rounded-sm transition-all hover:bg-blue-100 pb-0.5 " strokeWidth={1.75} onMouseUp={() => { window.open(value as string, '_blank'); }} />
                                    </ThemeIcon>)
                                    : linkState === 'broken'
                                        ? (<IconExternalLinkOff size={20} opacity={1} strokeWidth={1.5} className=" cursor-pointer transition-all" onMouseUp={() => { window.open(value as string, '_blank'); }} />)
                                        : null)}

                    </>
                }
                onFocus={() => setShowPreview(true)}
                onBlur={() => setShowPreview(false)}
                autosize={true}
                minRows={2}
                maxRows={variant === "unstyled" ? undefined : 10}
                {...sharedProps}
                className="relative"
                classNames={{ input: '!text-[#228BE6]' }}
            // leftSection={
            //     <iframe src={value as string ?? ''} className=" absolute left-0 right-0"></iframe>
            // }
            />
        )
    } else if (variable.type === 'Body') {
        <Textarea
            key={'vi' + index}
            value={value as string}
            onChange={e => setValue(e.target.value)}
            autosize={true}
            minRows={2}
            maxRows={variant === "unstyled" ? undefined : 10}
            {...sharedProps}
        />
    }
}