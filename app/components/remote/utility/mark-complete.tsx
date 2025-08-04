import { EditorContext } from "@/domain/context";
import { markPostmarkScheduleEmailReady, markPostmarkScheduleEmailReviewing } from "@/domain/integrations/airtable/postmarkScheduleActions";
import { updateNotionCard } from "@/domain/integrations/notion/notionActions";
import { markEmailSentInSlack, markEmailUnsentInSlack } from "@/domain/integrations/slack/slackActions";
import { Button, Loader, ThemeIcon } from "@mantine/core";
import { IconRosetteDiscountCheckFilled, IconRosetteDiscountCheckOff } from "@tabler/icons-react";
import moment from "moment";
import { useContext, useMemo } from "react";
import { RemoteStep, StateContent } from "../step-template";

export function MarkComplete({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [editorState, setEditorState] = useContext(EditorContext);

    const sentOrScheduled = useMemo(() => {
        const sendDate = editorState.email?.values?.resolveValue('Send Date', true);
        const hoursUntilSend = moment(sendDate).diff(moment(), 'hours');
        return hoursUntilSend > 1 ? 'Scheduled' : 'Sent';
    }, [editorState.email?.values?.resolveValue('Send Date', true)]);

    const stateContent: StateContent = {
        waiting: {
            icon: <ThemeIcon w={50} h={50} color="gray.2"><IconRosetteDiscountCheckFilled size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Confirm ' + sentOrScheduled,
            subtitle: 'Confirm email has been ' + sentOrScheduled.toLowerCase() + '.',
            rightContent: '',
        },
        ready: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconRosetteDiscountCheckFilled size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Confirm ' + sentOrScheduled,
            subtitle: 'Confirm email has been ' + sentOrScheduled.toLowerCase() + '.',
            rightContent: '',
        },
        manual: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconRosetteDiscountCheckFilled size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Confirm ' + sentOrScheduled,
            subtitle: 'Confirm email has been ' + sentOrScheduled.toLowerCase() + '.',
            rightContent: <Button variant="outline" color="blue.5" h={40} >Mark {sentOrScheduled}</Button>
        },
        pending: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconRosetteDiscountCheckFilled size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Confirm ' + sentOrScheduled,
            subtitle: 'Confirming email has been ' + sentOrScheduled.toLowerCase() + '.',
            rightContent: <Loader variant="bars" color="blue.5" size={30} />
        },
        failed: {
            icon: <ThemeIcon w={50} h={50} color="orange.6"><IconRosetteDiscountCheckOff size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Can\'t confirm if ' + sentOrScheduled,
            subtitle: 'Confirm email has been ' + sentOrScheduled.toLowerCase() + '.',
            rightContent: <Button variant="outline" color="blue.5" h={40} >Mark {sentOrScheduled}</Button>
        },
        succeeded: {
            icon: <ThemeIcon w={50} h={50} color="green.6"><IconRosetteDiscountCheckFilled size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Confirmed ' + sentOrScheduled,
            subtitle: 'Confirmed email has been ' + sentOrScheduled.toLowerCase() + '.',
            rightContent: null
        }
    };

    const isReady = () => {
        return editorState.email?.isReviewed !== undefined && editorState.email?.isReviewed === true;
    }

    const isDone = () => {
        return editorState.email?.isSentOrScheduled !== undefined
            && (
                editorState.email?.isSentOrScheduled === editorState.email?.templateId
                || editorState.email?.isSentOrScheduled === editorState.email?.campaignId
            );
    }

    const tryUndo = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {

        if (editorState.email?.usesPostmarkTool) {
            const success = await markPostmarkScheduleEmailReviewing(editorState.email);
            if (!success) {
                setMessage('Failed to mark email as not ready in Postmark Tool. Please try again.');
            }
        }

        const slackRes = await markEmailUnsentInSlack(editorState.email?.uuid ?? '');
        if (!slackRes.success) {
            console.log("Error marking email unsent in slack", slackRes.error);
            setMessage('Error marking email unsent in slack: ' + slackRes.error);
        }
        console.log("Marked email unsent in slack", slackRes);

        const notionRes = await updateNotionCard(editorState.email?.notionId ?? '', editorState.email?.referenceDocURL ?? '', false);
        if (!notionRes.success) {
            console.log("Error marking email unsent in notion", notionRes.error);
            setMessage('Error marking email unsent in notion: ' + notionRes.error);
        }
        console.log("Marked email unsent in notion", notionRes);

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                isSentOrScheduled: undefined,
            }
        }));

        return true;
    }

    const tryAction = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {

        if (editorState.email?.usesPostmarkTool) {
            const success = await markPostmarkScheduleEmailReady(editorState.email);
            if (!success) {
                setMessage('Failed to mark email as ready in Postmark Tool. Please try again.');
            }
        }

        const slackRes = await markEmailSentInSlack(editorState.email?.uuid ?? '');
        if (!slackRes.success) {
            console.log("Error marking email sent in slack", slackRes.error);
            setMessage('Error marking email sent in slack: ' + slackRes.error);
        }
        console.log("Marked email sent in slack", slackRes);

        const notionRes = await updateNotionCard(editorState.email?.notionId ?? '', editorState.email?.referenceDocURL ?? '', true);
        if (!notionRes.success) {
            console.log("Error marking email sent in notion", notionRes.error);
            setMessage('Error marking email sent in notion: ' + notionRes.error);
        }
        console.log("Marked email sent in notion", notionRes);

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                isSentOrScheduled: editorState.email?.templateId,
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