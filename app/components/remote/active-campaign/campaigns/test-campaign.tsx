import { EditorContext } from "@/domain/context";
import { sendCampaignTestEmail } from "@/domain/integrations/active-campaign/api";
import { createCampaignLink } from "@/domain/integrations/links";
import { Values } from "@/domain/values/valueCollection";
import { Anchor, Box, Button, Flex, Loader, TextInput, ThemeIcon } from "@mantine/core";
import { IconExternalLink, IconMailbox, IconSend, IconSendOff } from "@tabler/icons-react";
import { useContext, useState } from "react";
import { RemoteStep, StateContent } from "../../step-template";

export function TestCampaign({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [editorState, setEditorState] = useContext(EditorContext);
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
                <Flex gap={20} direction="column" align="start" justify="space-between" w='100%' className="p-2 ">
                    <Box className="relative w-full mt-2 ">
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
        return editorState.email?.messageId !== undefined && editorState.email?.messageId.length > 0
            && editorState.email?.campaignId !== undefined && editorState.email?.campaignId.length > 0;
    }

    const isDone = () => {
        return editorState.email?.sentTest !== undefined && editorState.email?.sentTest === editorState.email?.campaignId;
    }

    const tryAction = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        const email = editorState.email;
        const values = email?.values;

        if (!email || !values) return setMessage('No email found.');

        const messageId = parseInt(email.messageId ?? '');
        const campaignId = parseInt(email.campaignId ?? '');
        const testEmail = values.resolveValue("Test Email", true) ?? '';
        const testSubject = values.resolveValue("Test Subject", true) ?? '';
        const testNumber = values.resolveValue("Test Number", true) ?? '';

        const notFound = (...vs: (string | number | undefined | null)[]) => vs.map((v) => v === undefined || v === null || (typeof v === 'string' && v.trim().length === 0)).find((v) => v);
        if (notFound(messageId, campaignId, testEmail, testSubject))
            return setMessage('A value that is required for publishing wasn\'t found.');

        const response = await sendCampaignTestEmail({
            messageId: messageId ?? '',
            campaignId: campaignId ?? '',
            toEmail: testEmail ?? '',
            subject: `#${testNumber} ${testSubject}`,
        });
        console.log("Send Test Email", response);

        values.setValue("Test Number", { value: (parseInt(testNumber ?? '0') + 1).toString() });

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                sentTest: editorState.email?.campaignId,
                values: new Values(values.initialValues)
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
            allowsRedo
            allowsUndo={false}
        />
    )
}