import { EditorContext, GlobalSettingsContext } from "@/domain/context";
import { createCampaignMessage, createEmptyCampaign, deleteCampaign, editMessage, getCampaign, getMessage, getTemplate, populateCampaign, sendCampaignTestEmail } from "@/domain/integrations/active-campaign/api";
import { createCampaignLink } from "@/domain/integrations/links";
import { Values } from "@/domain/values/valueCollection";
import { Anchor, Box, Button, Flex, Loader, TextInput, ThemeIcon } from "@mantine/core";
import { IconExternalLink, IconMailbox, IconSend, IconSendOff } from "@tabler/icons-react";
import { useContext, useState } from "react";
import { RemoteStep, StateContent } from "../../step-template";

export function TestTemplate({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [editorState, setEditorState] = useContext(EditorContext);
    const [globalSettings, setGlobalSettings] = useContext(GlobalSettingsContext);

    const [testEmail, setTestEmail] = useState<string | undefined>(editorState.email?.values?.resolveValue("Test Email", true));

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
            rightContent: <Button variant="outline" color="blue.5" h={40} >Send Test</Button>,
            expandedContent:
                <Flex gap={20} direction="column" align="start" justify="space-between" w='100%' className=" p-2">
                    <Box className=" relative w-full mt-2">
                        <TextInput description='Test Email' value={testEmail} onChange={(e) => setTestEmail(e.target.value)} />
                    </Box>
                </Flex>
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
        return editorState.email?.templateId !== undefined && editorState.email?.templateId.length > 0
            && editorState.email?.hasRendered !== undefined && editorState.email?.hasRendered === editorState.email?.templateId
            && editorState.email?.hasPostmarkAction !== undefined && editorState.email?.hasPostmarkAction === editorState.email?.templateId
            && editorState.email?.hasRendered !== undefined && editorState.email?.hasRendered === editorState.email?.templateId
    }

    const isDone = () => {
        return editorState.email?.sentTest !== undefined && editorState.email?.sentTest === editorState.email?.templateId;

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
        const testNumber = values.resolveValue("Test Number", true) ?? '';
        const testSubject = values.resolveValue("Test Subject", true) ?? '';

        const notFound = (...vs: (string | undefined | null)[]) => vs.map((v) => v === undefined || v === null || (typeof v === 'string' && v.trim().length === 0)).find((v) => v);
        if (notFound(emailName, templateId, subject, fromName, fromEmail, replyToEmail))
            return setMessage('A value that is required for publishing wasn\'t found.');

        const postCampaignResponse = await createEmptyCampaign({
            name: "TEST CAMPAIGN: " + emailName + " (Delete Me)",
        }); // Create an empty campaign object
        console.log("Created empty campaign", postCampaignResponse);
        const campaignId = postCampaignResponse['id'];

        const messageResponse = await createCampaignMessage(campaignId, {
            subject,
            fromEmail,
            replyToEmail,
            preHeader,
            fromName,
            editorVersion: 3,
        }, globalSettings.activeCampaignToken ?? '');
        console.log("Created temp campaign message", messageResponse);

        const upgradedMessageResponse = await editMessage(messageResponse['id'], { editorVersion: "3", }, globalSettings.activeCampaignToken ?? '');
        const messageId = upgradedMessageResponse['id'];
        console.log("Upgraded message", upgradedMessageResponse);

        const res = await populateCampaign(campaignId + '', messageId + '', templateId ?? '', globalSettings.activeCampaignToken ?? '');
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

        const response = await sendCampaignTestEmail({
            messageId: messageId ?? '',
            campaignId: campaignId ?? '',
            toEmail: testEmail ?? '',
            subject: testSubject.length > 0 ? `#${testNumber} ${testSubject}` : subject,
        });
        console.log("Sent Test Email", response);

        values.setValue("Test Number", { value: (parseInt(testNumber ?? '0') + 1).toString() });

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                sentTest: templateId,
                values: new Values(values.initialValues)
            }
        }));

        console.log("Deleting temp campaign", campaignId);
        const delRes = await deleteCampaign(campaignId, globalSettings.activeCampaignToken ?? '');
        console.log("Deleted temp campaign", delRes);

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                campaignId: undefined,
                messageId: undefined,
                sentTest: templateId,
                values: new Values(values.initialValues)
            }
        }));

        return true;
    }

    const handleDeleteCampaign = async () => {
        const campaignId = editorState.email?.campaignId;
        if (!campaignId) return true;

        console.log("Deleting campaign", campaignId);
        const res = await deleteCampaign(campaignId, globalSettings.activeCampaignToken ?? '');
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
            tryUndo={handleDeleteCampaign}
            tryAction={tryAction}
            allowsRedo
            allowsUndo={false}
        />
    )
}