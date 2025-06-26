import { CopyOverlay } from "@/app/components/common/copy-overlay";
import { EditorContext } from "@/domain/context";
import { createAutomationLink } from "@/domain/integrations/links";
import { openPopup } from "@/domain/interface/popup";
import { Box, Button, Flex, Text, Textarea, ThemeIcon } from "@mantine/core";
import { IconCheck, IconExternalLink, IconMail, IconMailCheck, IconMailX } from "@tabler/icons-react";
import { useContext } from "react";
import { RemoteStep, StateContent } from "../../step-template";


export function CreatePostmarkAction({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [editorState, setEditorState] = useContext(EditorContext);

    const stateContent: StateContent = {
        waiting: {
            icon: <ThemeIcon w={50} h={50} color="gray.2"><IconMail size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Postmark Action',
            subtitle: 'Setup a Postmark step inside the automation.',
            rightContent: '',
        },
        ready: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconMail size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Postmark Action',
            subtitle: 'Setup a Postmark step inside the automation.',
            rightContent: <Button variant="outline" color="blue.5" h={40} leftSection={<IconCheck />} >Complete</Button>,
            expandedContent:
                <Flex gap={14} direction="column" align="start" justify="space-between" w='100%'>
                    <Flex gap={20} direction="row" p={10} align="start" justify="space-between" w='100%'>
                        <Flex gap={20} direction="column" align="start" justify="start" w={320}>
                            <Box className=" relative w-full mt-2">
                                <Textarea description='ActiveCampaign Template' value={editorState.email?.values?.resolveValue('Template Name', true)} autosize onChange={() => { }} />
                                <CopyOverlay name="Template Name" />
                            </Box>
                            <Box className=" relative w-full">
                                <Textarea description='Subject' value={editorState.email?.values?.resolveValue('Subject', true)} autosize onChange={() => { }} />
                                <CopyOverlay name="Subject" />
                            </Box>
                            <Box className=" relative w-full">
                                <Textarea description='Postmark Tag' value={editorState.email?.values?.resolveValue('Email Tag', true)} autosize onChange={() => { }} />
                                <CopyOverlay name="Email Tag" />
                            </Box>
                        </Flex>
                        {/* <Anchor href={createAutomationLink(editorState.email?.values?.resolveValue('Automation ID', true))} target="_blank"> */}
                        <Button variant="outline" color="blue.5" h={40} mt={10} mr={-5} rightSection={<IconExternalLink />} onClick={() => openPopup(createAutomationLink(editorState.email?.values?.resolveValue('Automation ID', true)))} >Open Automation</Button>
                        {/* </Anchor> */}
                    </Flex>
                    <Box px={10}>
                        {/* <Text size="xs" c="dimmed">Use Cmd + Shift + Option + Click to open the Automation in new window.</Text> */}
                        <Text size="xs">Make sure to create an exit preventer at the end of the automation.</Text>
                        {
                            editorState.email?.values?.resolveValue('Program', true) === 'Stand Out' ?
                                <Text size="xs">For Stand Out, always clean up past email sends.</Text>
                                : null
                        }
                        <Text size="xs" c="dimmed">Allow pop-ups to open links in new window.</Text>
                        <Text size="xs" c="dimmed" >Remember to screenshot the final action for review.</Text>
                    </Box>
                </Flex>
        },
        manual: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconMail size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Postmark Action',
            subtitle: 'Setup a Postmark step inside the automation.',
            rightContent: <Button variant="outline" color="blue.5" h={40} leftSection={<IconCheck />} >Complete</Button>,
            expandedContent:
                <Flex gap={14} direction="column" align="start" justify="space-between" w='100%'>
                    <Flex gap={20} direction="row" p={10} align="start" justify="space-between" w='100%'>
                        <Flex gap={20} direction="column" align="start" justify="start" w={320}>
                            <Box className=" relative w-full mt-2">
                                <Textarea description='ActiveCampaign Template' value={editorState.email?.values?.resolveValue('Template Name', true)} autosize />
                                <CopyOverlay name="Template Name" />
                            </Box>
                            <Box className=" relative w-full">
                                <Textarea description='Subject' value={editorState.email?.values?.resolveValue('Subject', true)} autosize />
                                <CopyOverlay name="Subject" />
                            </Box>
                            <Box className=" relative w-full">
                                <Textarea description='Postmark Tag' value={editorState.email?.values?.resolveValue('Email Tag', true)} autosize />
                                <CopyOverlay name="Email Tag" />
                            </Box>
                        </Flex>
                        {/* <Anchor href={createAutomationLink(editorState.email?.values?.resolveValue('Automation ID', true))} target="_blank"> */}
                        <Button variant="outline" color="blue.5" h={40} mt={10} mr={-5} rightSection={<IconExternalLink />} onClick={() => openPopup(createAutomationLink(editorState.email?.values?.resolveValue('Automation ID', true)))} >Open Automation</Button>
                        {/* </Anchor> */}
                    </Flex>
                    <Box px={10}>
                        {/* <Text size="xs" c="dimmed">Make sure to allow pop-ups, or use Cmd + Shift + Option + Click to open the Automation in new window.</Text> */}
                        <Text size="xs">Make sure to create an exit preventer at the end of the automation.</Text>
                        <Text size="xs" c="dimmed">Allow pop-ups to open links in new window.</Text>
                        <Text size="xs" c="dimmed" >Remember to screenshot the final action for review.</Text>
                    </Box>
                </Flex>
        },
        pending: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconMail size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Postmark Action',
            subtitle: 'Setup a Postmark step inside the automation.',
            rightContent: <Button variant="outline" color="blue.5" h={40} leftSection={<IconCheck />} >Complete</Button>,
        },
        failed: {
            icon: <ThemeIcon w={50} h={50} color="orange.6"><IconMailX size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Couldn\'t Create Postmark Action',
            subtitle: 'Setup a Postmark step inside the automation.',
            rightContent: <Button variant="outline" color="blue.5" h={40} leftSection={<IconCheck />} >Complete</Button>,

        },
        succeeded: {
            icon: <ThemeIcon w={50} h={50} color="green.6"><IconMailCheck size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Created Postmark Action',
            subtitle: 'Postmark action added to automation.',
            rightContent: null
        }
    };

    const isReady = () => {
        return editorState.email?.templateId !== undefined && editorState.email?.templateId.length > 0 &&
            editorState.email?.hasRendered !== undefined && editorState.email?.hasRendered === editorState.email?.templateId
        // && editorState.email?.referenceDocURL !== undefined && editorState.email?.referenceDocURL.length > 0;
    }

    const isDone = () => {
        return editorState.email?.templateId !== undefined && editorState.email?.templateId.length > 0 &&
            editorState.email?.hasPostmarkAction !== undefined && editorState.email?.hasPostmarkAction === editorState.email?.templateId;
    }

    const tryUndo = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                hasPostmarkAction: undefined,
            }
        }));

        return true;
    }

    const tryAction = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                hasPostmarkAction: editorState.email?.templateId,
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