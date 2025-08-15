import { SCHEDULE_AIRTABLE_LINK } from "@/config/integration-settings";
import { EditorContext } from "@/domain/context";
import { SavedEmailsContext } from "@/domain/email/save/saveData";
import { addEmailToPostmarkSchedule, removeEmailFromPostmarkSchedule, testPostmarkScheduleEmail } from "@/domain/integrations/airtable/postmarkScheduleActions";
import { openPopup } from "@/domain/interface/popup";
import { ActionIcon, Button, Loader, ThemeIcon } from "@mantine/core";
import { IconExternalLink, IconMailbox, IconMailCog, IconMailStar, IconMailX } from "@tabler/icons-react";
import { useContext } from "react";
import { RemoteStep, StateContent } from "../step-template";

export function SchedulePostmark({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [editorState, setEditorState] = useContext(EditorContext);
    const [emailStates, loadEmail, deleteEmail, editEmail] = useContext(SavedEmailsContext);

    const stateContent: StateContent = {
        waiting: {
            icon: <ThemeIcon w={50} h={50} color="gray.2"><IconMailStar size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Send to Postmark Tool',
            subtitle: 'Send test and mark as ready for review.', //‘Queue email for testing and review.’
            rightContent: '',
        },
        ready: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconMailStar size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Send to Postmark Tool',
            subtitle: 'Send test and mark as ready for review.',
            rightContent: '',
        },
        manual: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconMailStar size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Send to Postmark Tool',
            subtitle: 'Send test and mark as ready for review.',
            rightContent: <Button variant="outline" color="blue.5" h={40} >Send</Button>
        },
        pending: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconMailCog size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Sending to Postmark Tool',
            subtitle: 'Queueing email for testing and review...',
            rightContent: <Loader variant="bars" color="blue.5" size={30} />
        },
        failed: {
            icon: <ThemeIcon w={50} h={50} color="orange.6"><IconMailX size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Couldn\'t Send to Postmark Tool',
            subtitle: 'You may need to add it manually.',
            rightContent:
                // <Anchor href={createTemplateLink(editorState.email?.templateId ?? '')} target="_blank">
                <Button variant="light" color="orange.9" h={40} rightSection={<IconExternalLink />} onClick={() => openPopup(SCHEDULE_AIRTABLE_LINK)} >
                    Edit Schedule
                </Button>
            // </Anchor>
        },
        succeeded: {
            icon: <ThemeIcon w={50} h={50} color="green.6"><IconMailbox size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Added to Postmark Tool',
            subtitle: 'Queued email for testing and review.',
            rightContent:
                <ActionIcon variant="light" color="gray.5" h={40} w={40} onClick={() => openPopup(SCHEDULE_AIRTABLE_LINK + '/' + editorState.email?.postmarkToolId)} >
                    <IconExternalLink />
                </ActionIcon>
        }
    };

    const isReady = () => {
        return editorState.email?.templateId !== undefined && editorState.email?.templateId.length > 0 &&
            editorState.email?.hasRendered !== undefined && editorState.email?.hasRendered === editorState.email?.templateId;
    }

    const isDone = () => {
        return editorState.email?.sentTest !== undefined && editorState.email?.sentTest === editorState.email?.templateId &&
            editorState.email?.hasPostmarkAction !== undefined && editorState.email?.hasPostmarkAction === editorState.email?.templateId &&
            editorState.email?.hasWaitAction !== undefined && editorState.email?.hasWaitAction === true &&
            editorState.email?.usesPostmarkTool !== undefined && editorState.email?.usesPostmarkTool === true;
    }

    const tryAction = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        const email = editorState.email;
        const values = email?.values;

        if (!email || !values) return setMessage('No email found.');

        let uuid = email.uuid;
        const emailId = values.resolveValue('Email ID', true);
        const subject = values.resolveValue('Subject', true);
        const automationId = values.resolveValue('Automation ID', true);
        const sendDate = new Date(values.resolveValue('Send Date', true)).toISOString();
        const templateId = email.templateId;
        const tag = values.resolveValue('Email Tag', true) || 'default';

        if (editorState.email && !uuid) {
            console.log('No UUID found for email');
            editorState.email.uuid = crypto.randomUUID();
            await editEmail(editorState);
        }

        if (!emailId || !subject || !automationId || !sendDate || !templateId || !uuid) {
            console.log('Missing required values to add email to schedule');
            return setMessage('Missing required values to add email to schedule.');
        }

        if (!email.hasPostmarkAction && !email.hasWaitAction && !email.usesPostmarkTool) {
            const success = await addEmailToPostmarkSchedule(uuid, emailId, subject, automationId, new Date(sendDate), templateId, tag);
            console.log("Published email to Postmark Tool: " + success);

            if (!success) return setMessage('Failed to add email to schedule. Please try again.');

            setEditorState((prev) => ({
                ...prev,
                email: {
                    ...prev.email,
                    sentTest: templateId,
                    hasPostmarkAction: templateId,
                    hasWaitAction: true,
                    usesPostmarkTool: true,
                    postmarkToolId: success
                }
            }));

        } else {
            const testSuccess = await testPostmarkScheduleEmail(uuid);

            console.log("Tested email in Postmark Tool: " + testSuccess);
            if (!testSuccess) return setMessage('Failed to retest email in Postmark Tool. Please try again.');
        }

        return true;
    }

    const handleUndo = async () => {
        const id = editorState.email?.postmarkToolId;
        if (!id || !editorState.email) return;

        const deleteSuccess = await removeEmailFromPostmarkSchedule(id);
        console.log("Removed email from Postmark Tool: " + deleteSuccess);

        if (!deleteSuccess) return;

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                sentTest: undefined,
                hasPostmarkAction: undefined,
                postmarkToolId: undefined,
                hasWaitAction: false,
                usesPostmarkTool: false,
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
            tryUndo={handleUndo}
            allowsRedo
            allowsUndo
            noUndoOnRedo
        />
    )
}