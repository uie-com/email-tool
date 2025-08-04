import { SCHEDULE_AIRTABLE_LINK } from "@/config/integration-settings";
import { EditorContext } from "@/domain/context";
import { addEmailToPostmarkSchedule, removeEmailFromPostmarkSchedule, testPostmarkScheduleEmail } from "@/domain/integrations/airtable/postmarkScheduleActions";
import { openPopup } from "@/domain/interface/popup";
import { Button, Loader, ThemeIcon } from "@mantine/core";
import { IconAlertCircle, IconChecklist, IconExternalLink, IconUpload } from "@tabler/icons-react";
import { useContext } from "react";
import { RemoteStep, StateContent } from "../step-template";

export function SchedulePostmark({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [editorState, setEditorState] = useContext(EditorContext);

    const stateContent: StateContent = {
        waiting: {
            icon: <ThemeIcon w={50} h={50} color="gray.2"><IconUpload size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Send to Postmark Tool',
            subtitle: 'Add email to queue for testing.',
            rightContent: '',
        },
        ready: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconUpload size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Send to Postmark Tool',
            subtitle: 'Add email to queue for testing.',
            rightContent: '',
        },
        manual: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconUpload size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Send to Postmark Tool',
            subtitle: 'Add email to queue for testing.',
            rightContent: <Button variant="outline" color="blue.5" h={40} >Export Template</Button>
        },
        pending: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconUpload size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Sending to Postmark Tool',
            subtitle: 'Adding to transactional email schedule...',
            rightContent: <Loader variant="bars" color="blue.5" size={30} />
        },
        failed: {
            icon: <ThemeIcon w={50} h={50} color="orange.6"><IconAlertCircle size={30} strokeWidth={2.5} /></ThemeIcon>,
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
            icon: <ThemeIcon w={50} h={50} color="green.6"><IconChecklist size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Added to Postmark Tool',
            subtitle: 'Email has been added to test queue.',
            rightContent: null
        }
    };

    const isReady = () => {
        return editorState.email?.templateId !== undefined && editorState.email?.templateId.length > 0 &&
            editorState.email?.hasRendered !== undefined && editorState.email?.hasRendered === editorState.email?.templateId;
    }

    const isDone = () => {
        return editorState.email?.templateId !== undefined && editorState.email?.templateId.length > 0;
    }

    const tryAction = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        const email = editorState.email;
        const values = email?.values;

        if (!email || !values) return setMessage('No email found.');

        const uuid = values.resolveValue('UUID');
        const emailId = values.resolveValue('Email ID');
        const subject = values.resolveValue('Subject');
        const automationId = values.resolveValue('Automation ID');
        const sendDate = new Date(values.resolveValue('Send Date')).toISOString();
        const templateId = email.templateId;

        if (!emailId || !subject || !automationId || !sendDate || !templateId || !uuid) {
            console.error('Missing required values to add email to schedule');
            return false;
        }

        if (email.hasPostmarkAction === undefined && !email.hasWaitAction && !email.usesPostmarkTool) {
            const success = await addEmailToPostmarkSchedule(email);
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
                }
            }));

        } else {
            const testSuccess = await testPostmarkScheduleEmail(email);

            console.log("Tested email in Postmark Tool: " + testSuccess);
            if (!testSuccess) return setMessage('Failed to retest email in Postmark Tool. Please try again.');
        }

        return true;
    }

    const handleUndo = async () => {
        const uuid = editorState.email?.values?.resolveValue('UUID');
        if (!uuid || !editorState.email) return;

        const deleteSuccess = await removeEmailFromPostmarkSchedule(editorState.email);
        console.log("Removed email from Postmark Tool: " + deleteSuccess);

        if (!deleteSuccess) return;

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                sentTest: undefined,
                hasPostmarkAction: undefined,
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
        />
    )
}