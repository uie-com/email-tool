import { CopyOverlay } from "@/app/components/common/copy-overlay";
import { EditorContext } from "@/domain/context";
import { createAutomationLink } from "@/domain/integrations/links";
import { Box, Button, Flex, Text, TextInput, ThemeIcon } from "@mantine/core";
import { IconCalendarCheck, IconCalendarEvent, IconCalendarX, IconCheck, IconExternalLink } from "@tabler/icons-react";
import moment from "moment";
import { useContext } from "react";
import { RemoteStep, StateContent } from "../../step-template";


export function CreateWaitAction({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [editorState, setEditorState] = useContext(EditorContext);

    const openPopup = (url: string) => {
        return window.open(url, '_blank', 'noopener,noreferrer,popup');
    }

    const stateContent: StateContent = {
        waiting: {
            icon: <ThemeIcon w={50} h={50} color="gray.2"><IconCalendarEvent size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Wait Action',
            subtitle: 'Setup a wait until action to schedule the email.',
            rightContent: '',
        },
        ready: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconCalendarEvent size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Wait Action',
            subtitle: 'Setup a wait until action to schedule the email.',
            rightContent: <Button variant="outline" color="blue.5" h={40} leftSection={<IconCheck />} >Complete</Button>,
            expandedContent:
                <Flex gap={14} direction="column" align="start" justify="space-between" w='100%'>
                    <Flex gap={20} direction="row" p={10} align="start" justify="space-between" w='100%'>
                        <Flex gap={20} direction="column" align="start" justify="start" w={320}>
                            <Flex gap={10} direction="row" align="start" justify="space-between">
                                <Box className=" relative w-full mt-2">
                                    <TextInput description='Month' value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('MMMM')} onChange={() => { }} />
                                    <CopyOverlay name="Month" value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('MMMM')} />
                                </Box>
                                <Box className=" relative w-full mt-2">
                                    <TextInput description='Date' value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('D')} onChange={() => { }} />
                                    <CopyOverlay name="Date" value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('D')} />
                                </Box>
                                <Box className=" relative w-full mt-2">
                                    <TextInput description='Year' value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('YYYY')} onChange={() => { }} />
                                    <CopyOverlay name="Year" value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('YYYY')} />
                                </Box>
                            </Flex>
                            <Flex gap={10} direction="row" align="start" justify="space-between">
                                <Box className=" relative w-full">
                                    <TextInput description='Time' value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('H (hA)')} onChange={() => { }} />
                                    <CopyOverlay name="Time" value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('H (hA)')} />
                                </Box>
                                <Box className=" relative w-full">
                                    <TextInput description='Timezone' value={'America/New_York'} onChange={() => { }} />
                                    <CopyOverlay name="Timezone" value={'America/New_York'} />
                                </Box>
                            </Flex>
                        </Flex>
                        {/* <Anchor href={createAutomationLink(editorState.email?.values?.resolveValue('Automation ID', true))} target="_blank"> */}
                        <Button variant="outline" color="blue.5" h={40} mt={10} mr={-5} rightSection={<IconExternalLink />} onClick={() => openPopup(createAutomationLink(editorState.email?.values?.resolveValue('Automation ID', true)))} >Open Automation</Button>
                        {/* </Anchor> */}
                    </Flex>
                    <Box px={10}>
                        <Text size="xs" c="dimmed" >Remember to screenshot the final wait action for review.</Text>
                    </Box>
                </Flex>
        },
        manual: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconCalendarEvent size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Wait Action',
            subtitle: 'Setup a wait until action to schedule the email.',
            rightContent: <Button variant="outline" color="blue.5" h={40} leftSection={<IconCheck />} >Complete</Button>,
            expandedContent:
                <Flex gap={14} direction="column" align="start" justify="space-between" w='100%'>
                    <Flex gap={20} direction="row" p={10} align="start" justify="space-between" w='100%'>
                        <Flex gap={20} direction="column" align="start" justify="start" w={320}>
                            <Flex gap={10} direction="row" align="start" justify="space-between">
                                <Box className=" relative w-full mt-2">
                                    <TextInput description='Month' value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('MMMM')} />
                                    <CopyOverlay name="Month" value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('MMMM')} />
                                </Box>
                                <Box className=" relative w-full mt-2">
                                    <TextInput description='Date' value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('D')} />
                                    <CopyOverlay name="Date" value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('D')} />
                                </Box>
                                <Box className=" relative w-full mt-2">
                                    <TextInput description='Year' value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('YYYY')} />
                                    <CopyOverlay name="Year" value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('YYYY')} />
                                </Box>
                            </Flex>
                            <Flex gap={10} direction="row" align="start" justify="space-between">
                                <Box className=" relative w-full">
                                    <TextInput description='Time' value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('H (hA)')} />
                                    <CopyOverlay name="Time" value={moment(editorState.email?.values?.resolveValue('Send Date', true)).format('H (hA)')} />
                                </Box>
                                <Box className=" relative w-full">
                                    <TextInput description='Timezone' value={'America/New_York'} />
                                    <CopyOverlay name="Timezone" value={'America/New_York'} />
                                </Box>
                            </Flex>
                        </Flex>
                        {/* <Anchor href={createAutomationLink(editorState.email?.values?.resolveValue('Automation ID', true))} target="_blank"> */}
                        <Button variant="outline" color="blue.5" h={40} mt={10} mr={-5} rightSection={<IconExternalLink />} onClick={() => openPopup(createAutomationLink(editorState.email?.values?.resolveValue('Automation ID', true)))} >Open Automation</Button>
                        {/* </Anchor> */}
                    </Flex>
                    <Box px={10}>
                        <Text size="xs" c="dimmed" >Remember to screenshot the final wait action for review.</Text>
                    </Box>
                </Flex>
        },
        pending: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconCalendarEvent size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Wait Action',
            subtitle: 'Setup a wait until action to schedule the email.',
            rightContent: <Button variant="outline" color="blue.5" h={40} leftSection={<IconCheck />} >Complete</Button>,
        },
        failed: {
            icon: <ThemeIcon w={50} h={50} color="orange.6"><IconCalendarX size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Couldn\'t Create Wait Action',
            subtitle: 'Setup a wait until action to schedule the email.',
            rightContent: <Button variant="outline" color="blue.5" h={40} leftSection={<IconCheck />} >Complete</Button>,

        },
        succeeded: {
            icon: <ThemeIcon w={50} h={50} color="green.6"><IconCalendarCheck size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Created Wait Action',
            subtitle: 'Email scheduled with wait action.',
            rightContent:
                // <Anchor href={createAutomationLink(editorState.email?.values?.resolveValue('Automation ID', true))} target="_blank">
                <Button variant="light" color="green.5" h={40} rightSection={<IconExternalLink />} onClick={() => openPopup(createAutomationLink(editorState.email?.values?.resolveValue('Automation ID', true)))}>
                    Edit Automation
                </Button>
            // </Anchor>
        }
    };

    const isReady = () => {
        return editorState.email?.templateId !== undefined && editorState.email?.templateId.length > 0 &&
            editorState.email?.hasPostmarkAction !== undefined && editorState.email?.hasPostmarkAction === editorState.email?.templateId;
    }

    const isDone = () => {
        return editorState.email?.hasWaitAction !== undefined && editorState.email?.hasWaitAction === true;
    }

    const tryUndo = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                hasWaitAction: false,
            }
        }));

        return true;
    }

    const tryAction = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                hasWaitAction: true,
            }
        }));

        return true;
    }

    return (
        <RemoteStep
            shouldAutoStart={shouldAutoStart}
            stateContent={stateContent}
            isReady={isReady}
            isDone={isDone}
            tryAction={tryAction}
            tryUndo={tryUndo}
            allowsUndo={true}
        />
    )
}