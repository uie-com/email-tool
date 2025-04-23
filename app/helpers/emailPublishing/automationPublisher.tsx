"use client";

import { EditorContext } from "@/domain/schema";
import { ActionIcon, Anchor, Button, Flex, Group, HoverCard, Loader, Stack, Text, ThemeIcon } from "@mantine/core";
import { useContext, useEffect, useState, createContext, useMemo } from "react";
import { RequireValues } from "../components/require";
import { EmailViewCard } from "../components/email";
import { IconAlertCircle, IconChecklist, IconCopy, IconExternalLink, IconFileExport, IconMail, IconMailbox, IconMailCheck, IconMailPlus, IconMailQuestion, IconMessageCheck, IconMessageSearch, IconMessageX, IconProgressX, IconRefresh, IconSend, IconSendOff, IconTrash, IconUpload, IconX } from "@tabler/icons-react";
import { delCampaign, delTemplate, getCampaign, getMessage, getTemplate, populateCampaignMessageWithTemplate, postCampaign, postCampaignMessage, postTemplate, putCampaign, putCampaignInternal, putMessage, testCampaign } from "@/domain/data/activeCampaignActions";
import { createCampaignLink, createTemplateLink } from "@/domain/data/activeCampaign";
import { HadIssue, RemoteStep, StateContent } from "../components/remote";
import moment from "moment-timezone";
import { copy } from "@/domain/parse/parse";

export function AutomationPublisher() {
    const [editorState, setEditorState] = useContext(EditorContext);
    const [hadIssue, setHadIssue] = useState(false);


    const handleBack = () => {
        setEditorState((prev) => ({ ...prev, step: prev.step - 1, email: { ...prev.email } }));
    }

    return (
        <HadIssue.Provider value={[hadIssue, setHadIssue]}>
            <Flex align="center" justify="center" direction='column' className=" h-full w-[48rem] p-20" gap={20}>
                <RequireValues key={'rvc'} requiredValues={['Send Date', 'Email Name', 'Template Name', 'Automation ID', 'Subject', 'From Name', 'From Email', 'Reply To']} />
                <Group justify="start" align="start" className="w-full px-4">
                    <Button color='gray.7' variant="light" onClick={handleBack}>
                        Back
                    </Button>
                </Group>
                <EmailViewCard />
                <CreateTemplate shouldAutoStart={false} />
                {/* <CreateAutomation shouldAutoStart={false} /> */}
                <TestTemplate shouldAutoStart={false} />
                <MarkReviewed shouldAutoStart={false} />

            </Flex>
        </HadIssue.Provider>
    );
}

function CreateTemplate({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [editorState, setEditorState] = useContext(EditorContext);

    const stateContent: StateContent = {
        waiting: {
            icon: <ThemeIcon w={50} h={50} color="gray.2"><IconUpload size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Export to Active Campaigns',
            subtitle: 'Creates an editable Template with this HTML.',
            rightContent: '',
        },
        ready: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconUpload size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Export to Active Campaigns',
            subtitle: 'Creates an editable Template with this HTML.',
            rightContent: '',
        },
        manual: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconUpload size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Export to Active Campaigns',
            subtitle: 'Creates an editable Template with this HTML.',
            rightContent: <Button variant="outline" color="blue.5" h={40} >Export Template</Button>
        },
        pending: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconUpload size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Export to Active Campaigns',
            subtitle: 'Creating an editable Template with this HTML...',
            rightContent: <Loader variant="bars" color="blue.5" size={30} />
        },
        failed: {
            icon: <ThemeIcon w={50} h={50} color="orange.6"><IconAlertCircle size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Couldn\'t Create a Template',
            subtitle: 'You may need to create a Template manually.',
            rightContent:
                <Anchor href={createTemplateLink(editorState.email?.templateId ?? '')} target="_blank">
                    <Button variant="light" color="orange.9" h={40} rightSection={<IconExternalLink />} >
                        Edit Templates
                    </Button>
                </Anchor>
        },
        succeeded: {
            icon: <ThemeIcon w={50} h={50} color="green.6"><IconChecklist size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Created Template',
            subtitle: 'Created a Template with this HTML.',
            rightContent:
                <Flex gap={10}>
                    <ActionIcon variant="light" color="gray.5" h={40} w={40} onClick={() => copy(editorState.email?.templateId)}>
                        <IconCopy />
                    </ActionIcon>
                    <Anchor href={editorState.email?.campaignId ? createCampaignLink(editorState.email?.campaignId) : createTemplateLink(editorState.email?.templateId)} target="_blank">
                        <Button variant="light" color="green.5" h={40} rightSection={<IconExternalLink />} >
                            Edit Template
                        </Button>
                    </Anchor>
                </Flex>

        }
    };

    const isReady = () => {
        return editorState.email?.HTML !== undefined && editorState.email?.HTML.length > 0;
    }

    const isDone = () => {
        return editorState.email?.templateId !== undefined && editorState.email?.templateId.length > 0;
    }

    const tryAction = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        const email = editorState.email;
        const values = email?.values;

        if (!email || !values) return setMessage('No email found.');

        const html = email.HTML ?? '';
        const emailName = values.resolveValue("Template Name", true) ?? '';

        if (html.trim().length === 0)
            return setMessage('Template HTML is required and wasn\'t found.');
        if (emailName.trim().length === 0)
            return setMessage('Email Name is required and wasn\'t found.');

        const template = (await postTemplate(emailName, html)).template;
        console.log("Created template " + emailName, template);

        if (!template.id) return setMessage(template);

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                templateId: template.id,
            }
        }));

        return true;
    }

    const deleteTemplate = async () => {
        const templateId = editorState.email?.templateId;
        if (!templateId) return;

        console.log("Deleting template", templateId);
        const res = await delTemplate(templateId);
        console.log("Deleted template", res);

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                templateId: undefined,
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
            tryUndo={deleteTemplate}
            allowsUndo
        />
    )
}

function CreateCampaign({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [editorState, setEditorState] = useContext(EditorContext);

    const stateContent: StateContent = {
        waiting: {
            icon: <ThemeIcon w={50} h={50} color="gray.2"><IconMailPlus size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Campaign',
            subtitle: 'Link the Template to a new Campaign.',
            rightContent: '',
        },
        ready: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconMailPlus size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Campaign',
            subtitle: 'Link the Template to a new Campaign.',
            rightContent: '',
        },
        manual: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconMailPlus size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Campaign',
            subtitle: 'Link the Template to a new Campaign.',
            rightContent: <Button variant="outline" color="blue.5" h={40} >Create Campaign</Button>
        },
        pending: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconMail size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Campaign',
            subtitle: 'Creating a Campaign with this Template...',
            rightContent: <Loader variant="bars" color="blue.5" size={30} />
        },
        failed: {
            icon: <ThemeIcon w={50} h={50} color="orange.6"><IconMailQuestion size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: editorState.email?.campaignId ? 'Couldn\'t Link the Campaign' : 'Couldn\'t Create the Campaign',
            subtitle: editorState.email?.campaignId ? 'You may need to edit the Campaign manually.' : 'You may need to create the Campaign manually.',
            rightContent:
                <Anchor href={createCampaignLink(editorState.email?.campaignId)} target="_blank">
                    <Button variant="light" color="orange.9" h={40} rightSection={<IconExternalLink />} >
                        {editorState.email?.campaignId ? 'Edit Campaign' : 'Edit Campaigns'}
                    </Button>
                </Anchor>
        },
        succeeded: {
            icon: <ThemeIcon w={50} h={50} color="green.6"><IconMailCheck size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Created Campaign',
            subtitle: 'Scheduled a Campaign with Template.',
            rightContent: <Anchor href={createCampaignLink(editorState.email?.campaignId)} target="_blank">
                <Button variant="light" color="green.5" h={40} rightSection={<IconExternalLink />} >
                    Edit Campaign
                </Button>
            </Anchor>
        }
    };

    const isReady = () => {
        return editorState.email?.templateId !== undefined && editorState.email?.templateId.length > 0;
    }

    const isDone = () => {
        console.log("Already has campaign? ", editorState.email?.campaignId !== undefined && editorState.email?.campaignId.length > 0 ? true : false);
        return editorState.email?.campaignId !== undefined && editorState.email?.campaignId.length > 0;
    }

    const tryAction = async (setMessage: (m: string) => void): Promise<boolean | void> => {
        const email = editorState.email;
        const values = email?.values;

        if (!email || !values) return setMessage('No email found.');

        const emailName = values.resolveValue("Campaign Name", true) ?? '';
        const templateId = email.templateId;

        const listId = values.resolveValue("List ID", true) ?? '';
        const segmentId = values.resolveValue("Segment ID", true) ?? '';

        const sendDate = values.resolveValue("Send Date", true) ?? '';

        const subject = values.resolveValue("Subject", true) ?? '';
        const preHeader = values.resolveValue("Preview", true) ?? '';
        const fromName = values.resolveValue("From Name", true) ?? '';
        const fromEmail = values.resolveValue("From Email", true) ?? '';
        const replyToEmail = values.resolveValue("Reply To", true) ?? '';

        const notFound = (...vs: (string | undefined | null)[]) => vs.map((v) => v === undefined || v === null || (typeof v === 'string' && v.trim().length === 0)).find((v) => v);
        if (notFound(emailName, templateId, listId, segmentId, subject, fromName, fromEmail, replyToEmail))
            return setMessage('A value that is required for publishing wasn\'t found.');

        if (!moment(sendDate).isValid())
            return setMessage('Send Date is required and wasn\'t found.');
        const scheduledDate = moment(sendDate).tz("America/New_York").format();

        const postCampaignResponse = await postCampaign({
            name: emailName,
        }); // Create an empty campaign object
        console.log("Created empty campaign", postCampaignResponse);
        const campaignId = postCampaignResponse['id'];

        const messageResponse = await postCampaignMessage(campaignId, {
            subject,
            fromEmail,
            replyToEmail,
            preHeader,
            fromName,
            editorVersion: 3,
        });
        console.log("Created campaign message", messageResponse);

        const upgradedMessageResponse = await putMessage(messageResponse['id'], { editorVersion: "3", });
        const messageId = upgradedMessageResponse['id'];
        console.log("Upgraded message", upgradedMessageResponse);

        const res = await populateCampaignMessageWithTemplate(campaignId + '', messageId + '', templateId ?? '');
        console.log("Populated campaign message", res);

        const targetedCampaignResponse = await putCampaignInternal(campaignId, {
            listIds: [listId],
            segmentId,
        });
        console.log("Filled in campaign", targetedCampaignResponse);

        const scheduledCampaignResponse = await putCampaignInternal(campaignId, {
            scheduledDate,
            predictiveSendEnabled: false
        });
        console.log("Filled in campaign", scheduledCampaignResponse);

        const usedTemplate = await getTemplate(templateId ?? '');
        const finalMessage = await getMessage(messageId);
        const finalCampaign = await getCampaign(campaignId);
        console.log("Final result: ", { usedTemplate, finalMessage, finalCampaign });

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                messageId: finalMessage.message.id,
                campaignId: finalCampaign.campaign.id,
            }
        }));

        return true;
    }

    const deleteCampaign = async () => {
        const campaignId = editorState.email?.campaignId;
        if (!campaignId) return;

        console.log("Deleting campaign", campaignId);
        const res = await delCampaign(campaignId);
        console.log("Deleted campaign", res);

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                campaignId: undefined,
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
            tryUndo={deleteCampaign}
            allowsUndo
        />
    )
}



function TestTemplate({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [editorState, setEditorState] = useContext(EditorContext);
    const testEmail = useMemo(() => {
        return editorState.email?.values?.resolveValue("Test Email", true) ?? '';
    }, [editorState.email?.values?.initialValues]);

    const stateContent: StateContent = {
        waiting: {
            icon: <ThemeIcon w={50} h={50} color="gray.2"><IconSend size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Send Test Email',
            subtitle: 'Sends test email to ' + testEmail + '.',
            rightContent: '',
        },
        ready: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconSend size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Send Test Email',
            subtitle: 'Sends test email to ' + testEmail + '.',
            rightContent: '',
        },
        manual: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconSend size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Send Test Email',
            subtitle: 'Sends test email to ' + testEmail + '.',
            rightContent: <Button variant="outline" color="blue.5" h={40} >Send Test</Button>
        },
        pending: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconSend size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Sending Test Email',
            subtitle: 'Sending test email...',
            rightContent: <Loader variant="bars" color="blue.5" size={30} />
        },
        failed: {
            icon: <ThemeIcon w={50} h={50} color="orange.6"><IconSendOff size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Couldn\'t Send Test Email',
            subtitle: 'You may need to continue in Active Campaign.',
            rightContent:
                <Anchor href={createCampaignLink(editorState.email?.campaignId)} target="_blank">
                    <Button variant="light" color="orange.9" h={40} rightSection={<IconExternalLink />} >
                        Open Campaign
                    </Button>
                </Anchor>
        },
        succeeded: {
            icon: <ThemeIcon w={50} h={50} color="green.6"><IconMailbox size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Sent Test Email',
            subtitle: 'Sent test email to ' + testEmail + '.',
            rightContent: null
        }
    };

    const isReady = () => {
        return editorState.email?.templateId !== undefined && editorState.email?.templateId.length > 0;
    }

    const isDone = () => {
        return editorState.email?.hasSentTest !== undefined && editorState.email?.hasSentTest === true;

    }

    const tryAction = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {

        const email = editorState.email;
        const values = email?.values;

        if (!email || !values) return setMessage('No email found.');

        const emailName = values.resolveValue("Template Name", true) ?? '';
        const templateId = email.templateId;

        const subject = values.resolveValue("Subject", true) ?? '';
        const preHeader = values.resolveValue("Preview", true) ?? '';
        const fromName = values.resolveValue("From Name", true) ?? '';
        const fromEmail = values.resolveValue("From Email", true) ?? '';
        const replyToEmail = values.resolveValue("Reply To", true) ?? '';

        const notFound = (...vs: (string | undefined | null)[]) => vs.map((v) => v === undefined || v === null || (typeof v === 'string' && v.trim().length === 0)).find((v) => v);
        if (notFound(emailName, templateId, subject, fromName, fromEmail, replyToEmail))
            return setMessage('A value that is required for publishing wasn\'t found.');

        const postCampaignResponse = await postCampaign({
            name: "TEST CAMPAIGN: " + emailName + " (Delete Me)",
        }); // Create an empty campaign object
        console.log("Created empty campaign", postCampaignResponse);
        const campaignId = postCampaignResponse['id'];

        const messageResponse = await postCampaignMessage(campaignId, {
            subject,
            fromEmail,
            replyToEmail,
            preHeader,
            fromName,
            editorVersion: 3,
        });
        console.log("Created temp campaign message", messageResponse);

        const upgradedMessageResponse = await putMessage(messageResponse['id'], { editorVersion: "3", });
        const messageId = upgradedMessageResponse['id'];
        console.log("Upgraded message", upgradedMessageResponse);

        const res = await populateCampaignMessageWithTemplate(campaignId + '', messageId + '', templateId ?? '');
        console.log("Populated temp campaign message", res);

        const usedTemplate = await getTemplate(templateId ?? '');
        const finalMessage = await getMessage(messageId);
        const finalCampaign = await getCampaign(campaignId);
        console.log("Final temp campaign result: ", { usedTemplate, finalMessage, finalCampaign });

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                messageId: finalMessage.message.id,
                campaignId: finalCampaign.campaign.id,
            }
        }));

        const response = await testCampaign({
            messageId: messageId ?? '',
            campaignId: campaignId ?? '',
            toEmail: testEmail ?? '',
            subject: subject,
        });
        console.log("Sent Test Email", response);


        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                hasSentTest: true,
            }
        }));

        console.log("Deleting temp campaign", campaignId);
        const delRes = await delCampaign(campaignId);
        console.log("Deleted temp campaign", delRes);

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                campaignId: undefined,
                messageId: undefined,
                hasSentTest: true,
            }
        }));

        return true;
    }

    const deleteCampaign = async () => {
        const campaignId = editorState.email?.campaignId;
        if (!campaignId) return true;

        console.log("Deleting campaign", campaignId);
        const res = await delCampaign(campaignId);
        console.log("Deleted campaign", res);

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                campaignId: undefined,
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
            tryUndo={deleteCampaign}
            tryAction={tryAction}
            allowsRedo
            allowsUndo={false}
        />
    )
}



function MarkReviewed({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [editorState, setEditorState] = useContext(EditorContext);

    const stateContent: StateContent = {
        waiting: {
            icon: <ThemeIcon w={50} h={50} color="gray.2"><IconMessageSearch size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Review Email',
            subtitle: '',
            rightContent: '',
        },
        ready: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconMessageSearch size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Review Email',
            subtitle: '',
            rightContent: '',
        },
        manual: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconMessageSearch size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Review Email',
            subtitle: '',
            rightContent: <Button variant="outline" color="blue.5" h={40} >Mark Reviewed</Button>
        },
        pending: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconMessageSearch size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Review Email',
            subtitle: '',
            rightContent: <Loader variant="bars" color="blue.5" size={30} />
        },
        failed: {
            icon: <ThemeIcon w={50} h={50} color="orange.6"><IconMessageX size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Couldn\'t Mark Reviewed',
            subtitle: '',
            rightContent: <Button variant="outline" color="blue.5" h={40} >Mark Reviewed</Button>
        },
        succeeded: {
            icon: <ThemeIcon w={50} h={50} color="green.6"><IconMessageCheck size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Email Reviewed',
            subtitle: '',
            rightContent: null
        }
    };
    //
    const isReady = () => {
        return editorState.email?.templateId !== undefined && editorState.email?.templateId.length > 0
            && editorState.email?.hasSentTest !== undefined && editorState.email?.hasSentTest === true;
    }

    const isDone = () => {
        return editorState.email?.isReviewed !== undefined && editorState.email?.isReviewed === true;
    }

    const tryUndo = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                isReviewed: false,
                isSentOrScheduled: false,
            }
        }));

        return true;
    }

    const tryAction = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                isReviewed: true,
                isSentOrScheduled: true,
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