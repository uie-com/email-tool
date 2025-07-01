import { EditorContext, GlobalSettingsContext } from "@/domain/context";
import { copyGoogleDocByUrl, deleteGoogleDocByUrl } from "@/domain/integrations/google-drive/googleActions";
import { createGoogleDocLink } from "@/domain/integrations/links";
import { openPopup } from "@/domain/interface/popup";
import { isValidHttpUrl } from "@/domain/values/validation";
import { Values } from "@/domain/values/valueCollection";
import { Anchor, Button, Flex, Loader, Text, TextInput, ThemeIcon } from "@mantine/core";
import { IconClipboardCheck, IconClipboardText, IconClipboardX, IconExternalLink, IconLink } from "@tabler/icons-react";
import { useContext, useEffect } from "react";
import { RemoteStep, StateContent } from "../step-template";

export function CreateReferenceDoc({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [globalSettings, setGlobalSettings] = useContext(GlobalSettingsContext);
    const [editorState, setEditorState] = useContext(EditorContext);

    useEffect(() => { }, [shouldAutoStart]);

    const stateContent: StateContent = {
        waiting: {
            icon: <ThemeIcon w={50} h={50} color="gray.2"><IconClipboardText size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Reference Document',
            subtitle: 'Create a Google Doc for content reference',
            rightContent: '',
        },
        ready: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconClipboardText size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Reference Document',
            subtitle: 'Create a Google Doc for content reference',
            rightContent: '',
        },
        manual: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconClipboardText size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Reference Document',
            subtitle: 'Create a Google Doc for content reference',
            rightContent: <Button variant="outline" color="blue.5" h={40} >Create Doc</Button>,
        },
        pending: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconClipboardText size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Creating Reference Document',
            subtitle: 'Creating a Google Doc for content reference...',
            rightContent: <Loader variant="bars" color="blue.5" size={30} />
        },
        failed: {
            icon: <ThemeIcon w={50} h={50} color="gray.6"><IconClipboardX size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Couldn\'t Find Reference Doc',
            subtitle: 'Input a document manually.',
            rightContent:
                <Anchor href={(editorState.email?.values?.resolveValue('Source Reference Doc', true))} target="_blank">
                    <Button variant="light" color="gray.9" h={40} rightSection={<IconExternalLink />} >
                        Open Source
                    </Button>
                </Anchor>,
            expandedContent:
                <Flex gap={20} direction="column" align="start" justify="space-between" w='100%' p={12}>
                    <Text size="xs">Either input a source document to duplicate and retry, <br />or input a completed reference document below and continue.</Text>
                    <TextInput description='Link to Source Reference Doc' value={editorState.email?.values?.resolveValue('Source Reference Doc', true)} w='100%' rightSection={<IconLink />}
                        onChange={(e) => {
                            const newValues = new Values(editorState.email?.values?.initialValues);
                            newValues.setValue('Source Reference Doc', { value: e.target.value, source: 'user' });
                            setEditorState((prev) => ({
                                ...prev,
                                email: {
                                    ...prev.email,
                                    values: newValues,
                                }
                            }));
                        }} />
                    <TextInput description='Link to Final Reference Doc' value={editorState.email?.referenceDocURL} w='100%' rightSection={<IconLink />}
                        onChange={(e) => {
                            setEditorState((prev) => ({
                                ...prev,
                                email: {
                                    ...prev.email,
                                    referenceDocURL: e.target.value,
                                }
                            }));
                        }} />
                </Flex>
        },
        succeeded: {
            icon: <ThemeIcon w={50} h={50} color="green.6"><IconClipboardCheck size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Created Reference Doc',
            subtitle: 'Created content reference doc.',
            rightContent:
                <Flex gap={10}>
                    {/* <ActionIcon variant="light" color="gray.5" h={40} w={40} onClick={() => copy((editorState.email?.referenceDocURL ?? ''))}>
                        <IconCopy />
                    </ActionIcon> */}
                    <Button variant="light" color="green.4" h={40} rightSection={<IconExternalLink />} onClick={() => openPopup((editorState.email?.referenceDocURL ?? ''))} >
                        Open Doc
                    </Button>
                </Flex>

        }
    };

    const isReady = () => {
        return true;
    }

    const isDone = () => {
        return editorState.email?.referenceDocURL !== undefined && editorState.email?.referenceDocURL.length > 0;
    }

    const tryAction = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {

        const email = editorState.email;
        const values = email?.values;

        if (!email || !values) return setMessage('No email found.');

        const sourceDoc = values.resolveValue("Source Reference Doc", true) ?? '';
        const docName = values.resolveValue("Template Name", true) ?? '';

        if (!sourceDoc || !isValidHttpUrl(sourceDoc)) {
            console.log("Invalid source doc", sourceDoc);
            return setMessage('Invalid source document link.');
        }

        const res = await copyGoogleDocByUrl(sourceDoc, docName, globalSettings.googleAccessToken ?? '');

        if (!res.success || !res.newFileId) {
            console.log("Error copying doc", res.error);
            return setMessage(res.error);
        }

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                referenceDocURL: createGoogleDocLink(res.newFileId),
            }
        }));

        return true;
    }

    const tryUndo = async () => {
        const referenceDocURL = editorState.email?.referenceDocURL;
        if (!referenceDocURL) return true;

        console.log("Deleting reference doc", referenceDocURL);
        const res = await deleteGoogleDocByUrl(referenceDocURL, globalSettings.googleAccessToken ?? '');
        if (!res.success) {
            console.log("Error deleting doc", res.error);
            return;
        }

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                referenceDocURL: undefined,
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