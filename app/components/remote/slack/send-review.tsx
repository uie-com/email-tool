import { GET_DEFAULT_PRIORITY, GET_REVIEW_INDEX, MARKETING_REVIEWERS, MARKETING_REVIEWER_IDS, PRIORITY_FLAGS, PRIORITY_ICONS, SLACK_LIST_URL } from "@/config/integration-settings";
import { REVIEW_ACTIVE_REFRESH_INTERVAL } from "@/config/save-settings";
import { EditorContext } from "@/domain/context";
import { SavedEmailsContext, loadState, markReviewedEmails } from "@/domain/email/save/saveData";
import { createEmailInSlack, deleteEmailInSlack } from "@/domain/integrations/slack/slackActions";
import { Anchor, Box, Button, Flex, Image, Loader, Select, Text, ThemeIcon } from "@mantine/core";
import { IconArrowBackUp, IconCheck, IconExternalLink, IconMessageCheck, IconMessageSearch, IconMessageX } from "@tabler/icons-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { RemoteStep, StateContent } from "../step-template";

export function SendReview({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [editorState, setEditorState] = useContext(EditorContext);
    const [emailStates, loadEmail, deleteEmail, editEmail] = useContext(SavedEmailsContext);

    const [reviewer, setReviewer] = useState(MARKETING_REVIEWERS[GET_REVIEW_INDEX(editorState.email?.templateId ?? '') % MARKETING_REVIEWERS.length]);
    const [priority, setPriority] = useState<string | undefined>(undefined);
    const defaultPriority = useMemo(() => GET_DEFAULT_PRIORITY(editorState.email), [editorState.email?.values?.resolveValue('Send Date', true)]);

    const [isPostPending, setIsPostPending] = useState(false);
    const [hasPosted, setHasPosted] = useState(false);

    const handleCreateTicket = async () => {
        if (isPostPending) return;
        setIsPostPending(true);

        const priorityFlag = PRIORITY_FLAGS[PRIORITY_ICONS.indexOf(priority ?? '')] ?? defaultPriority;
        const userId = MARKETING_REVIEWER_IDS[MARKETING_REVIEWERS.indexOf(reviewer)] ?? MARKETING_REVIEWER_IDS[0];
        const notionUrl = editorState.email?.notionURL ?? '';

        const res = await createEmailInSlack(notionUrl, editorState.email?.referenceDocURL ?? '', editorState.email?.values?.resolveValue('Subject', true), editorState.email?.values?.resolveValue('Email ID', true), userId, priorityFlag);
        console.log("Created email in slack", res);

        setHasPosted(true);
        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                hasSentReview: true,
            }
        }));
        setIsPostPending(false);
    }

    const handleDeleteTicket = async (forceRefresh: boolean = false) => {
        if (isPostPending) return;
        setIsPostPending(true);
        const res = await deleteEmailInSlack(editorState.email?.values?.resolveValue('Email ID', true));
        console.log("Deleted email in slack", res);

        setHasPosted(false);
        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                hasSentReview: false,
            }
        }));
        setIsPostPending(false);

        if (forceRefresh) {
            setTimeout(() => {
                window.location.reload();
            }, 2500);
        }
    }

    const tryAction = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                hasSentReview: true,
            }
        }));

        return await new Promise((resolve) => {
            setInterval(async () => {
                console.log('Refreshing reviews...', emailStates);
                const newSaves = await markReviewedEmails(emailStates);
                const saveMatch = newSaves.find((s) => s === editorState.email?.name);

                let fullSave = await loadState(saveMatch ?? '');
                if (fullSave) {
                    fullSave = {
                        ...fullSave,
                        email: {
                            ...fullSave.email,
                            isReviewed: true,
                        }
                    }
                    await editEmail(fullSave);
                }

                if (saveMatch)
                    resolve(true);

            }, REVIEW_ACTIVE_REFRESH_INTERVAL)
        });
    }

    const handleSkipReview = () => {
        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                hasSentReview: true,
                isReviewed: true,
            }
        }));
    }

    useEffect(() => { }, [editorState.email?.hasSentReview, editorState.email?.isReviewed]);


    const stateContent: StateContent = {
        waiting: {
            icon: <ThemeIcon w={50} h={50} color="gray.2"><IconMessageSearch size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Review Ticket',
            subtitle: 'Create email review item in Slack.',
            rightContent: '',
        },
        ready: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconMessageSearch size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Review Ticket',
            subtitle: 'Create email review item in Slack.',
            rightContent: '',
        },
        manual: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconMessageSearch size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Review Ticket',
            subtitle: 'Create email review item in Slack.',
            rightContent:
                !hasPosted ? <Button variant="light" color="gray.6" h={40} disabled={isPostPending} loading={isPostPending} > Already has Ticket</Button> :
                    <Button variant="outline" color="blue.5" h={40} leftSection={<IconCheck />} >Mark Sent</Button>
            ,
            expandedContent:
                <Flex gap={14} direction="column" align="start" justify="space-between" w='100%'>
                    <Flex gap={20} direction="row" p={10} align="start" justify="space-between" w='100%'>
                        <Flex gap={20} direction="column" align="start" justify="start" w={320}>
                            {
                                !hasPosted ?
                                    <Flex gap={10} direction="row" align="start" justify="space-between">

                                        <Box className=" relative w-full mt-2">
                                            <Select
                                                description='Reviewer'
                                                value={reviewer}
                                                data={MARKETING_REVIEWERS}
                                                onChange={(v) => setReviewer(v ?? '')}
                                                disabled={isPostPending || hasPosted}
                                            />
                                        </Box>
                                        <Box className=" relative w-24 mt-2">
                                            <Select
                                                description='Priority'
                                                value={priority}
                                                defaultValue={PRIORITY_ICONS[PRIORITY_FLAGS.indexOf(defaultPriority)]}
                                                data={PRIORITY_ICONS}
                                                onChange={(v) => setPriority(v ?? '')}
                                                disabled={isPostPending || hasPosted}
                                            />
                                        </Box>
                                    </Flex>
                                    :
                                    <Flex gap={20} direction="column" align="start" justify="space-between">
                                        <Text size="xs">Add screenshots and switch Review to 'Template Email Review' to post the review ticket. Then mark sent.</Text>

                                        <Box className=" relative w-full mt-2 overflow-hidden rounded-lg" w={200} h={100} >
                                            <Image src={'./tutorials/upload-screenshots.gif'} />
                                        </Box>
                                        <Box className=" relative w-full mt-2 overflow-hidden rounded-lg" w={200} h={270}>
                                            <Image src={'./tutorials/send-review.gif'} />
                                        </Box>
                                    </Flex>
                            }
                        </Flex>
                        {
                            !hasPosted ?
                                <Flex direction="column" align="end" justify="start" mt={10} mr={-5} gap={15}>
                                    <Button variant="outline" color="blue.5" mt={10} h={40} onClick={handleCreateTicket} disabled={isPostPending} loading={isPostPending}>Create Ticket</Button>
                                </Flex>
                                :
                                <Flex direction="column" align="end" justify="start" mt={10} mr={-5} gap={20}>
                                    <Anchor href={SLACK_LIST_URL} target="_blank">
                                        <Button variant="outline" color="blue.5" h={40} rightSection={<IconExternalLink />} >
                                            Open Slack List
                                        </Button>
                                    </Anchor>
                                    <Button variant="light" color="gray" h={40} leftSection={<IconArrowBackUp />} onClick={() => handleDeleteTicket()} >
                                        Delete Ticket
                                    </Button>
                                </Flex>

                        }
                    </Flex>
                    {/* <Box px={10}>
                        <Text size="xs">Remember to add screenshots and switch Review to 'Template Email Review'.</Text>
                        <Text size="xs" c="dimmed" >Remember to screenshot the final wait action for review.</Text>
                    </Box> */}
                </Flex>
        },
        pending: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconMessageSearch size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Waiting for Reviews',
            subtitle: 'Sent review ticket to ' + (reviewer ?? MARKETING_REVIEWER_IDS[0]) + '.',
            rightContent: <Loader variant="bars" color="blue.5" size={30} />,
            expandedContent:
                <Flex gap={14} direction="column" align="start" justify="space-between" w='100%'>
                    <Flex gap={20} direction="row" p={10} align="start" justify="space-between" w='100%'>
                        <Flex direction="row" align="end" justify="end" mt={10} mr={-5} gap={20} w='100%'>

                            <Button variant="outline" color="red" h={40} mr={'auto'} leftSection={<IconArrowBackUp />} onClick={() => handleDeleteTicket(true)} >
                                Delete Ticket
                            </Button>
                            <Button variant="light" color="gray" h={40} leftSection={<IconCheck />} onClick={() => handleSkipReview()} >
                                Mark Reviewed
                            </Button>
                            <Anchor href={SLACK_LIST_URL} target="_blank">
                                <Button variant="outline" color="blue.5" h={40} rightSection={<IconExternalLink />} >
                                    Open Slack List
                                </Button>
                            </Anchor>
                        </Flex>
                    </Flex>
                    {/* <Box px={10}>
                        <Text size="xs">Remember to add screenshots and switch Review to 'Template Email Review'.</Text>
                        <Text size="xs" c="dimmed" >Remember to screenshot the final wait action for review.</Text>
                    </Box> */}
                </Flex>
        },
        failed: {
            icon: <ThemeIcon w={50} h={50} color="orange.6"><IconMessageX size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Couldn\'t Find Review Ticket',
            subtitle: 'Try to send the review again.',
            rightContent:
                <Anchor href={SLACK_LIST_URL} target="_blank">
                    <Button variant="outline" color="blue.5" h={40} rightSection={<IconExternalLink />}>Open Slack</Button>
                </Anchor >
        },
        succeeded: {
            icon: <ThemeIcon w={50} h={50} color="green.6"><IconMessageCheck size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Email Approved',
            subtitle: 'Final email review marked as approved.',
            rightContent: null
            // rightContent: <ThemeIcon size={36} bg='none' c='blue' ml={12} mr={0}><IconConfetti strokeWidth={2.5} size={36} /></ThemeIcon>
        }
    };
    //
    const isReady = () => {
        return editorState.email?.templateId !== undefined
            && editorState.email?.templateId.length > 0
            && editorState.email?.sentTest !== undefined
            && (
                editorState.email?.sentTest === editorState.email?.templateId
                || editorState.email?.sentTest === editorState.email?.campaignId
            )
            && editorState.email?.notionURL !== undefined
            && editorState.email?.notionURL.length > 0
            && (
                (
                    editorState.email?.hasPostmarkAction !== undefined
                    && editorState.email?.hasPostmarkAction === editorState.email?.templateId
                    && editorState.email?.hasWaitAction !== undefined
                    && editorState.email?.hasWaitAction === true
                ) || (
                    editorState.email?.campaignId !== undefined
                    && editorState.email?.campaignId === editorState.email?.campaignId
                )
            )
    }

    const isDone = () => {
        return editorState.email?.isReviewed !== undefined && editorState.email?.isReviewed === true;
    }

    const tryUndo = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        await handleDeleteTicket();

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                hasSentReview: false,
                isReviewed: false,
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
            allowsUndo={false}
            allowsRedo={true}
        />
    )
}