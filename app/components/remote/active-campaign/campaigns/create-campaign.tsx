import { EditorContext, GlobalSettingsContext } from "@/domain/context";
import { createCampaignMessage, createEmptyCampaign, deleteCampaign, editCampaignInternal, editMessage, getCampaign, getMessage, getTemplate, populateCampaign } from "@/domain/integrations/active-campaign/api";
import { createCampaignLink } from "@/domain/integrations/links";
import { openPopup } from "@/domain/interface/popup";
import { Anchor, Button, Loader, ThemeIcon } from "@mantine/core";
import { IconExternalLink, IconMail, IconMailCheck, IconMailPlus, IconMailQuestion } from "@tabler/icons-react";
import moment from "moment";
import { useContext } from "react";
import { RemoteStep, StateContent } from "../../step-template";

export function CreateCampaign({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [editorState, setEditorState] = useContext(EditorContext);
    const [globalSettings, setGlobalSettings] = useContext(GlobalSettingsContext);


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
            rightContent:
                // <Anchor href={createCampaignLink(editorState.email?.campaignId)} target="_blank">
                <Button variant="light" color="green.5" h={40} onClick={() => openPopup(createCampaignLink(editorState.email?.campaignId))} rightSection={<IconExternalLink />} >
                    Edit Campaign
                </Button>
            // </Anchor>
        }
    };

    const isReady = () => {
        return editorState.email?.templateId !== undefined && editorState.email?.templateId.length > 0;
    }

    const isDone = () => {
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

        const postCampaignResponse = await createEmptyCampaign({
            name: emailName,
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
        console.log("Created campaign message", messageResponse);

        const upgradedMessageResponse = await editMessage(messageResponse['id'], { editorVersion: "3", }, globalSettings.activeCampaignToken ?? '');
        const messageId = upgradedMessageResponse['id'];
        console.log("Upgraded message", upgradedMessageResponse);

        const res = await populateCampaign(campaignId + '', messageId + '', templateId ?? '', globalSettings.activeCampaignToken ?? '');
        console.log("Populated campaign message", res);

        const targetedCampaignResponse = await editCampaignInternal(campaignId, {
            listIds: [listId],
            segmentId,
        }, globalSettings.activeCampaignToken ?? '');
        console.log("Filled in campaign", targetedCampaignResponse);

        const scheduledCampaignResponse = await editCampaignInternal(campaignId, {
            scheduledDate,
            predictiveSendEnabled: false
        }, globalSettings.activeCampaignToken ?? '');
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

    const handleDeleteCampaign = async () => {
        const campaignId = editorState.email?.campaignId;
        if (!campaignId) return;

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
            tryAction={tryAction}
            tryUndo={handleDeleteCampaign}
            allowsUndo
        />
    )
}