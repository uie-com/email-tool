import { PRE_APPROVED_VALUES } from "@/config/email-settings/email-settings";
import { REQUIRED_VARIABLES } from "@/config/variable-settings";
import { fuzzyParseDateToIsoString } from "@/domain/date/dates";
import { isValidHttpUrl } from "@/domain/values/validation";
import { Values } from "@/domain/values/valueCollection";
import { Variable, Variables } from "@/domain/variables/variableCollection";
import { Flex, HoverCard, Loader, MantineSize, Textarea, ThemeIcon } from "@mantine/core";
import { DateInput, TimeInput } from "@mantine/dates";
import { IconCalendarEventFilled, IconExternalLink, IconExternalLinkOff, IconRefresh } from "@tabler/icons-react";
import dayjs from "dayjs";
import moment, { Moment } from "moment-timezone";
import { useMemo, useState } from "react";

const DEBUG = false;
const prependVariables = [new Variable('{Send Date}', 0), new Variable('{Subject}', 0), new Variable('{Preview}', 0), new Variable('{Send Type}', 0)];
const appendVariables = [new Variable('{Global Styles}', 0)];

export function VariableForm({ variables, values, setValue, showHidden, highlightMissing }: { variables: Variables, values?: Values, setValue: (values: Values) => void, showHidden?: boolean, highlightMissing: boolean }) {
    const formVariables = useMemo(() => {
        return variables.getDisplayVariables(values, prependVariables, showHidden ? appendVariables : [])
    }, [variables, values]);

    return (
        <Flex direction="column" align="stretch" justify="center" className="h-full" gap={20} key={'form'}>
            {formVariables && formVariables.map((variable, index) => {
                if (!showHidden && (values?.isHidden(variable.key) || PRE_APPROVED_VALUES.includes(variable.key)))
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
                        highlightMissing={highlightMissing}
                    />)
            }
            )}
        </Flex>
    );
}

export function VariableInput({ variable, value, setValue, index, variant, variableName, className, size, disabled, highlightMissing }: { variable?: Variable, value: any, setValue: (value: any) => void, index: number, variant?: string, variableName?: string, className?: string, size?: MantineSize, disabled?: boolean, highlightMissing?: boolean }) {
    const linkState = useMemo(() => {
        if (!value || value === '' || typeof value !== 'string') {
            return ('empty');
        } else if (typeof value === 'string' && (isValidHttpUrl(value?.trim()) || value.indexOf('./') === 0)) {
            return ('link');
        } else {
            return ('broken');
        }
    }, [value]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const isRequired = useMemo(() => {
        return variable?.writtenAs.includes('*') || REQUIRED_VARIABLES.includes(variable?.key || '');
    }, [variable?.writtenAs]);

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
        label: variant === "unstyled" ? undefined : variable.name.replaceAll('*', ''),
        placeholder: 'No ' + variable.name,
        withAsterisk: isRequired,
        error: isRequired && highlightMissing && (!value || (typeof value === 'string' && value.trim().length === 0)) ? variable.name + ' is required.' : undefined,
    };

    if (isRefreshing) {
        return <Loader color="black" type="dots" opacity={0.1} />
    }

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
        let date: Moment | undefined | Date = value ? moment(value) : undefined, time = '08:00';
        if (!date?.isValid()) {
            date = undefined;
        } else {
            date = moment(value).toDate();
            time = moment(value).format('HH:mm');
        }

        const handleDatePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            const parsedDate = fuzzyParseDateToIsoString(text);
            if (parsedDate) {
                setValue(parsedDate);
            } else {
                console.warn('Invalid date pasted:', text);
            }
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
                    onPasteCapture={handleDatePaste}
                />

                <TimeInput
                    value={time}
                    onChange={e => {
                        const [hours, minutes] = e.target.value.split(':');
                        const newDate = dayjs(value).hour(parseInt(hours)).minute(parseInt(minutes)).toDate();
                        setValue(newDate);
                    }}
                    {...sharedProps}
                    label={''}
                    key={'vi' + index + 'time'}
                    mb={variant === 'unstyled' ? -0.25 : 0}
                    onPasteCapture={handleDatePaste}
                />
            </Flex>
        )
    } else if (variable.key === 'template') {

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
                                        <IconRefresh size={26} opacity={1} className=" cursor-pointer  hover:stroke-blue-500 rounded-sm transition-all hover:bg-blue-100 pb-0.5 " strokeWidth={1.75}
                                            onMouseUp={() => {
                                                setIsRefreshing(true);
                                                setValue('');
                                                setTimeout(() => {
                                                    setValue(value as string);
                                                    setIsRefreshing(false);
                                                }, 400);
                                            }}
                                        />
                                    </ThemeIcon>)
                                    : linkState === 'broken'
                                        ? (<IconExternalLinkOff size={20} opacity={1} strokeWidth={1.5} className="transition-all cursor-pointer " onMouseUp={() => { window.open(value as string, '_blank'); }} />)
                                        : null)}

                    </>
                }
                autosize={true}
                minRows={2}
                maxRows={variant === "unstyled" ? undefined : 10}
                {...sharedProps}
                className="relative"
                classNames={{ input: '!text-[#228BE6]' }}
            // leftSection={
            //     <iframe src={value as string ?? ''} className="absolute left-0 right-0 "></iframe>
            // }
            />
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
                                    <HoverCard disabled={value.includes('leaders') || variable.name.includes('Banner')}>
                                        <HoverCard.Target>
                                            <ThemeIcon color="blue" pb={1} variant="light" className=" !absolute top-1.5 right-1 rounded-full" style={{ background: 'none' }}>
                                                <IconExternalLink size={26} opacity={1} className=" cursor-pointer  hover:stroke-blue-500 rounded-sm transition-all hover:bg-blue-100 pb-0.5 " strokeWidth={1.75} onMouseUp={() => { window.open(value as string, '_blank'); }} />
                                            </ThemeIcon>
                                        </HoverCard.Target>
                                        <HoverCard.Dropdown className="!w-[250px] !h-[375px] !p-0 overflow-hidden">
                                            <div className=" scale-[0.25] origin-top-left">
                                                <div className="w-[1000px] h-[1500px] relative">
                                                    <iframe src={value} className="absolute top-0 left-0 w-full h-full"></iframe>
                                                </div>
                                            </div>
                                        </HoverCard.Dropdown>
                                    </HoverCard>
                                )
                                    : linkState === 'broken'
                                        ? (<IconExternalLinkOff size={20} opacity={1} strokeWidth={1.5} className="transition-all cursor-pointer " onMouseUp={() => { window.open(value as string, '_blank'); }} />)
                                        : null)}

                    </>
                }
                autosize={true}
                minRows={2}
                maxRows={variant === "unstyled" ? undefined : 10}
                {...sharedProps}
                className="relative"
                classNames={{ input: '!text-[#228BE6]' }}
            // leftSection={
            //     <iframe src={value as string ?? ''} className="absolute left-0 right-0 "></iframe>
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