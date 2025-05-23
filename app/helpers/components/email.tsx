import { getStatusFromEmail, STATUS_COLORS } from "@/domain/schema";
import { Badge, Box, Button, Flex, Group, Pill, ScrollArea, Text, ThemeIcon, Title } from "@mantine/core";
import { JSX, use, useContext, useEffect, useMemo, useState } from "react";
import { VariableInput } from "./form";
import { Values } from "@/domain/schema/valueCollection";
import { TemplateView } from "./template";
import { IconCalendarEventFilled, IconCopy, IconCopyCheck, IconCopyCheckFilled, IconCopyleftFilled, IconRosetteDiscountCheck, IconRosetteDiscountCheckFilled } from "@tabler/icons-react";
import moment from "moment-timezone";
import { CopyOverlay } from "./clipboard";
import { PROGRAM_COLORS } from "@/domain/settings/interface";
import { EditorContext } from "@/domain/schema/context";
import { isPreApprovedTemplate, SavedEmailsContext } from "@/domain/data/saveData";


export const EMAIL_EDIT_VALUES = ['Email Name', 'Send Date', 'Send Type', 'Subject', 'Preview'];
export function EmailEditCard({ rightContent }: { rightContent?: JSX.Element }) {
    const [editorState, setEditorState] = useContext(EditorContext);
    const emailValues = useMemo(() => new Values(editorState.email?.values?.initialValues) ?? new Values(), [JSON.stringify(editorState.email?.values)]);

    useEffect(() => { }, [JSON.stringify(emailValues)]);

    const setValue = (name: string, value: any) => {
        emailValues.setValue(name, { value: value, source: 'user' });
        setEditorState({ ...editorState, email: { ...editorState.email, values: emailValues } });
    }
    return (
        <Flex align="stretch" justify="start" direction='row' className="p-4 border-gray-200 rounded-lg w-[38rem] border-1 overflow-hidden relative" gap={25}>
            <PreApprovalBadge className=" !absolute top-0 right-0 scale-[300%]" />
            <div className={" relative w-[9rem] h-[16rem]"}>
                <TemplateView setVariables={() => { }} className=" absolute top-0 left-0 h-[64rem] w-[36rem] origin-top-left scale-25" showToggle={false} />
            </div>
            <Flex align="start" justify="start" direction='column' className=" h-[16rem] relative " gap={0}>
                <ScrollArea className="" >
                    <Flex>
                        <Flex align='center' justify='start' bg='gray.1' className=" rounded-full px-3 h-7 -ml-0.5 " >
                            <VariableInput
                                variableName={'Send Date'}
                                value={emailValues?.resolveValue('Send Date', true)}
                                index={0}
                                setValue={(v) => setValue('Send Date', v)}
                                variant="unstyled"
                                className=" font-medium"
                                size="sm"
                            />
                        </Flex>
                    </Flex>
                    <VariableInput
                        variableName={'Email'}
                        value={emailValues?.resolveValue('Email Name', true)}
                        index={0}
                        setValue={(v) => setValue('Email Name', v)}
                        variant="unstyled"
                        className=" font-bold -mb-4 mt-0.5"
                        size="xl"
                    />
                    <VariableInput
                        variableName={'Subject'}
                        value={emailValues?.resolveValue('Subject', true)}
                        index={0}
                        setValue={(v) => setValue('Subject', v)}
                        variant="unstyled"
                        className=" font-semibold w-[24rem] mt-2 -mb-2.5 ml-0.5"
                        size="md"
                    />
                    <VariableInput
                        variableName={'Preview'}
                        value={emailValues?.resolveValue('Preview', true)}
                        index={0}
                        setValue={(v) => setValue('Preview', v)}
                        variant="unstyled"
                        className="w-[24rem] font-normal opacity-50 ml-0.5"
                        size="md"
                    />
                </ScrollArea>

                {
                    rightContent !== undefined ? (
                        rightContent
                    ) : (<Text className="absolute bottom-0 right-1" opacity={0.25} size="xs"> {emailValues?.resolveValue('Send Type', true)}</Text>)
                }

            </Flex>
        </Flex >
    );
}

export function EmailViewCard() {
    const [editorState, setEditorState] = useContext(EditorContext);
    const emailValues = useMemo(() => new Values(editorState.email?.values?.initialValues) ?? new Values(), [JSON.stringify(editorState.email?.values)]);

    useEffect(() => { }, [JSON.stringify(emailValues)]);


    const handleContinue = () => {
        setEditorState((prev) => ({ ...prev, step: prev.step + 1, email: { ...prev.email } }));
    }


    if (editorState.step === 2)
        return (
            <EmailEditCard rightContent={
                <Group className=" absolute bottom-0 right-1">

                    <Button color='blue' onClick={handleContinue}>
                        Confirm
                    </Button>
                </Group>}
            />
        );
    else if (editorState.step === 3)
        return (
            <Flex align="stretch" justify="start" direction='row' className="p-4 border-gray-200 rounded-lg w-full border-1 overflow-hidden relative" gap={25}>
                <PreApprovalBadge className=" !absolute top-0 right-0 scale-[300%]" />

                <div className={" relative w-[9rem] h-[16rem]"}>
                    <TemplateView setVariables={() => { }} className=" absolute top-0 left-0 h-[64rem] w-[36rem] origin-top-left scale-25" showToggle={false} />
                    <CopyOverlay name="HTML" value={editorState.email?.HTML} />
                </div>
                <Flex align="start" justify="start" direction='column' className=" h-[16rem] relative w-full px-1.5 " gap={0}>

                    <Box className=" w-full h-full overflow-x-visible overflow-y-visible" >
                        <Flex direction='row' gap={10} >
                            <Flex align='center' justify='start' bg='gray.1' className=" rounded-full pl-3 pr-4 h-9 -ml-0.5 relative " gap={8}>
                                <IconCalendarEventFilled size={20} strokeWidth={3} className=" -mt-0.5" />
                                <Text size="md" fw={500}>{moment(emailValues?.resolveValue('Send Date', true)).format('dddd, MMMM Do YYYY [at] hh:mma')}</Text>
                                <CopyOverlay name="Send Date" value={moment(emailValues?.resolveValue('Send Date', true)).format('dddd, MMMM Do YYYY [at] hh:mma')} />
                            </Flex>
                        </Flex>

                        <Box className=" relative w-full mt-3">
                            <Title fw={600} className=" !text-3xl ">{emailValues?.resolveValue('Email Name Shorthand', true)}</Title>
                            <CopyOverlay name="Email Name Shorthand" />
                        </Box>

                        <Box className=" relative w-full mt-3 ml-[1px]">
                            <Text fw={500} className=" !text-md">{emailValues?.resolveValue('Subject', true)}</Text>
                            <CopyOverlay name="Subject" />
                        </Box>

                        <Box className=" relative w-full mt-4  ml-[1px]">
                            <Text fw={500} className=" !text-md">{emailValues?.resolveValue('Preview', true)}</Text>
                            <CopyOverlay name="Preview" />
                        </Box>

                        <Box className=" absolute right-2 bottom-6">
                            <Text fw={300} className=" opacity-60">{emailValues?.resolveValue('Template Name', true)}</Text>
                            <CopyOverlay name="Template Name" value={emailValues?.resolveValue('Template Name', true)} />
                        </Box>

                        <Box className=" absolute right-2 bottom-0">
                            <Text fw={300} className=" opacity-20">{emailValues?.resolveValue('Email Tag', true)}</Text>
                            <CopyOverlay name="Email Tag" value={emailValues?.resolveValue('Email Tag', true)} />
                        </Box>
                    </Box>
                </Flex>
            </Flex >
        );
}

function PreApprovalBadge({ className }: { className?: string }) {
    const [editorState, setEditorState] = useContext(EditorContext);
    const [emailStates, loadEmail, deleteEmail, editEmail] = useContext(SavedEmailsContext);

    const isPreApproved = isPreApprovedTemplate(editorState.email?.template, emailStates);

    if (!isPreApproved)
        return null;

    return (
        <ThemeIcon
            className={className}
            c="gray.2"
            bg='none'
            size={32}
        >
            <IconRosetteDiscountCheck size={36} strokeWidth={2} />
        </ThemeIcon>
    )
}