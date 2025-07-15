import { NOTION_CALENDAR } from "@/config/integration-settings";
import { EditorContext, GlobalSettingsContext } from "@/domain/context";
import { SavedEmailsContext, isPreApprovedTemplate } from "@/domain/email/save/saveData";
import { createNotionUri } from "@/domain/integrations/links";
import { createNotionCard, deleteNotionCard, findNotionCard, updateNotionCard } from "@/domain/integrations/notion/notionActions";
import { Anchor, Button, Flex, Loader, Text, TextInput, ThemeIcon } from "@mantine/core";
import { IconExternalLink, IconLink, IconListDetails, IconPlaylistX } from "@tabler/icons-react";
import moment from "moment";
import { useContext, useState } from "react";
import { RemoteStep, StateContent } from "../step-template";

export function GetNotionPage({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [globalSettings, setGlobalSettings] = useContext(GlobalSettingsContext);
    const [editorState, setEditorState] = useContext(EditorContext);
    const [emailStates, loadEmail, deleteEmail, editEmail] = useContext(SavedEmailsContext);

    const [didCreate, setDidCreate] = useState(false);
    const [updatingCard, setUpdatingCard] = useState(false);

    if (editorState.email?.values?.getCurrentValue('Is Variation') === 'Is Variation') {
        return null; // Skip if this is a variation email
    }

    const stateContent: StateContent = {
        waiting: {
            icon: <ThemeIcon w={50} h={50} color="gray.2"><IconListDetails size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Link Notion Card',
            subtitle: 'Finds or creates a Notion card for the email.',
            rightContent: '',
        },
        ready: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconListDetails size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Link Notion Card',
            subtitle: 'Finds or creates a Notion card for the email.',
            rightContent: '',
        },
        manual: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconListDetails size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Link Notion Card',
            subtitle: 'Finds or creates a Notion card for the email.',
            rightContent: <Button variant="outline" color="blue.5" h={40} >Find Card</Button>
        },
        pending: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconListDetails size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: (updatingCard ? 'Adding Ref Doc to ' : (didCreate ? 'New' : 'Found')) + ' Notion Card',
            subtitle: (didCreate ? 'Created' : 'Found') + ' a Notion card for the email....',
            rightContent: <Loader variant="bars" color="blue.5" size={30} />
        },
        failed: {
            icon: <ThemeIcon w={50} h={50} color="orange.6"><IconPlaylistX size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Couldn\'t Create Notion Card',
            subtitle: 'Couldn\'t find or create a Notion card.',
            rightContent:
                <Anchor href={(NOTION_CALENDAR)} target="_blank">
                    <Button variant="light" color="orange.9" h={40} rightSection={<IconExternalLink />} >
                        Open Notion
                    </Button>
                </Anchor>,
            expandedContent:
                <Flex gap={20} direction="column" align="start" justify="space-between" w='100%' p={12}>
                    <Text size="xs">Input the Link to the Notion Card to Continue</Text>
                    <TextInput description='Link to Notion Card' value={editorState.email?.notionURL} w='100%' rightSection={<IconLink />}
                        onChange={(e) => {
                            setEditorState((prev) => ({
                                ...prev,
                                email: {
                                    ...prev.email,
                                    notionURL: e.target.value,
                                }
                            }));
                        }} />

                </Flex>
        },
        succeeded: {
            icon: <ThemeIcon w={50} h={50} color="green.6"><IconListDetails size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: (didCreate ? 'Created' : 'Found') + ' Notion Card',
            subtitle: 'Notion card ' + (didCreate ? 'created' : 'found') + ' and linked.',
            rightContent:
                <Flex gap={10}>
                    {/* <ActionIcon variant="light" color="gray.5" h={40} w={40} onClick={() => copy((editorState.email?.notionURL ?? ''))}>
                        <IconCopy />
                    </ActionIcon> */}
                    <Anchor href={createNotionUri(editorState.email?.notionURL ?? '')} target="_blank" ml={5}>
                        <Button variant="light" color="green.5" h={40} pl={18} rightSection={<IconExternalLink strokeWidth={1.5} />} >
                            Open Card
                        </Button>
                    </Anchor>
                </Flex>

        }
    };

    const isReady = () => {
        return editorState.email?.referenceDocURL !== undefined && editorState.email?.referenceDocURL.length > 0;
    }

    const isDone = () => {
        return editorState.email?.notionURL !== undefined && editorState.email?.notionURL.length > 0;
    }

    const tryAction = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        const email = editorState.email;
        const values = email?.values;

        if (!email || !values) return setMessage('No email found.');

        const emailName = values.resolveValue("QA Email Name", true) ?? '';
        const sendDate = moment(values.resolveValue("Send Date", true) ?? '').toISOString(true);
        const shareReviewBy = values.resolveValue((values.resolveValue("Share Reviews By", true) ?? ''), true);
        const referenceDocURL = email?.referenceDocURL ?? '';


        const isPreApproved = isPreApprovedTemplate(editorState.email?.template, emailStates);


        setDidCreate(false);

        let res = await findNotionCard(sendDate, emailName, shareReviewBy);
        if (!res || !res.success) {
            console.log("Error querying Notion", res);
            if (res.error)
                setMessage(res?.error ?? 'Error searching Notion: ' + res?.error);
            else
                setMessage('No Notion card found. Created one called ' + emailName + ' for ' + sendDate);
        }

        if (!res.url) {
            setDidCreate(true);

            const notionCard = await createNotionCard(sendDate, emailName);
            if (notionCard && notionCard.success && notionCard.url && notionCard.id) {
                res = notionCard;
            } else {
                return setMessage('Error creating Notion card: ' + notionCard?.error);
            }
        }

        setUpdatingCard(true);

        const notionId = res.id;
        const updateRes = await updateNotionCard(notionId ?? '', referenceDocURL, false, isPreApproved);
        if (!updateRes.success) {
            console.log("Error updating Notion card", updateRes.error);
            return setMessage('Error updating Notion card: ' + updateRes.error);
        }
        console.log("Updated Notion card", updateRes);

        setUpdatingCard(false);

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                notionURL: res.url,
                notionId: res.id,
            }
        }));

        const a = document.createElement('a');
        a.href = createNotionUri(res.url);
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        return true;
    }

    const tryUndo = async () => {
        const notionId = editorState.email?.notionId;
        if (!notionId) return true;

        console.log("Deleting notion card", notionId);
        const res = await deleteNotionCard(notionId);
        if (!res.success) {
            console.log("Error deleting notion card", res.error);
            return true;
        }

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                notionURL: undefined,
                notionId: undefined,
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
            allowsUndo
        />
    )
}