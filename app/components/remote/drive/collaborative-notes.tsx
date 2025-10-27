import { EditorContext, GlobalSettingsContext } from "@/domain/context";
import { createVariableEdits } from "@/domain/integrations/google-drive/collabNotes";
import { createSiblingGoogleDoc, getGoogleDocContentByUrl } from "@/domain/integrations/google-drive/googleActions";
import { saveNotesDoc, undoSaveNotesDoc } from "@/domain/integrations/google-drive/notesActions";
import { createGoogleDocLink } from "@/domain/integrations/links";
import { openPopup } from "@/domain/interface/popup";
import { isValidHttpUrl } from "@/domain/values/validation";
import { Values } from "@/domain/values/valueCollection";
import { Variables } from "@/domain/variables/variableCollection";
import { ActionIcon, Anchor, Button, Flex, Loader, Text, TextInput, ThemeIcon } from "@mantine/core";
import { IconExternalLink, IconFileAlert, IconFileText, IconFileTypePdf, IconLink, IconSticker2 } from "@tabler/icons-react";
import { useContext, useEffect, useState } from "react";
import { RemoteStep, StateContent } from "../step-template";

export function CreateCollaborativeNotes({ shouldAutoStart, hasResolvedRemote }: { shouldAutoStart: boolean, hasResolvedRemote: boolean }) {
    const [globalSettings, setGlobalSettings] = useContext(GlobalSettingsContext);
    const [editorState, setEditorState] = useContext(EditorContext);
    const [needsNotes, setNeedsNotes] = useState<boolean | undefined>(undefined);

    useEffect(() => { }, [shouldAutoStart, hasResolvedRemote]);

    if (editorState.email?.templateHTML && needsNotes === undefined) {
        const email = editorState.email;
        if (!email || !email.values) return false;
        const values = email.values;
        const templateNeedsNotes = email.templateHTML?.includes('{Collab Notes Link}');
        const hadPDFLink = values.resolveValue('Collab PDF Link', true) !== undefined && values.resolveValue('Collab PDF Link', true).length > 0 && values.getValueObj('Collab PDF Link')?.currentSource === 'schedule';

        setNeedsNotes(templateNeedsNotes && !hadPDFLink);
    }


    if (!needsNotes) return <></>;

    const stateContent: StateContent = {
        waiting: {
            icon: <ThemeIcon w={50} h={50} color="gray.2"><IconSticker2 size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Collaborative Notes',
            subtitle: 'Create Google Doc and PDF notes.',
            rightContent: '',
        },
        ready: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconSticker2 size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Collaborative Notes Document',
            subtitle: 'Create Google Doc and PDF notes.',
            rightContent: '',
        },
        manual: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconSticker2 size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Create Collaborative Notes Document',
            subtitle: 'Create Google Doc and PDF notes.',
            rightContent: <Button variant="outline" color="blue.5" h={40} >Link Notes</Button>,
        },
        pending: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconSticker2 size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Creating Collaborative Notes',
            subtitle: 'Creating documents for participant notes...',
            rightContent: <Loader variant="bars" color="blue.5" size={30} />
        },
        failed: {
            icon: <ThemeIcon w={50} h={50} color="gray.6"><IconFileAlert size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Couldn\'t Create Notes',
            subtitle: 'Input a document manually.',
            rightContent:
                <Anchor href={(editorState.email?.values?.resolveValue('Template Collab Notes Doc', true))} target="_blank">
                    <Button variant="light" color="gray.9" h={40} rightSection={<IconExternalLink />} >
                        Open Source
                    </Button>
                </Anchor>,
            expandedContent:
                <Flex gap={20} direction="column" align="start" justify="space-between" w='100%' p={12}>
                    <Text size="xs">Either input a source document to duplicate and retry, <br />or input a completed notes document below and continue.</Text>
                    <TextInput description='Link to Template Doc' value={editorState.email?.values?.resolveValue('Template Collab Notes Doc', true)} w='100%' rightSection={<IconLink />}
                        onChange={(e) => {
                            const newValues = new Values(editorState.email?.values?.initialValues);
                            newValues.setValue('Template Collab Notes Doc', { value: e.target.value, source: 'user' });
                            setEditorState((prev) => ({
                                ...prev,
                                email: {
                                    ...prev.email,
                                    values: newValues,
                                }
                            }));
                        }} />
                    <TextInput description='Link to Final Notes Doc' value={editorState.email?.values?.resolveValue('Collab Notes Link', true)} w='100%' rightSection={<IconLink />}
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
            icon: <ThemeIcon w={50} h={50} color="green.6"><IconSticker2 size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Created Collaborative Notes',
            subtitle: 'Created Google Doc and PDF notes.',
            rightContent:
                <Flex gap={10}>
                    <ActionIcon variant="light" color="green.4" h={40} w={40} onClick={() => openPopup((editorState.email?.values?.resolveValue('Collab PDF Link', true)))}>
                        <IconFileTypePdf />
                    </ActionIcon>
                    <ActionIcon variant="light" color="green.4" h={40} w={40} onClick={() => openPopup((editorState.email?.values?.resolveValue('Collab Notes Link', true)))}>
                        <IconFileText />
                    </ActionIcon>
                    {/* <Button variant="light" color="green.4" h={40} rightSection={<IconExternalLink />} onClick={() => openPopup((editorState.email?.values?.resolveValue('Collab Notes Link', true)))} >
                        Open Doc
                    </Button> */}
                </Flex>

        }
    };

    const isDone = () => {
        return editorState.email?.values?.resolveValue('Collab Notes Link', true) !== undefined
            && editorState.email?.values?.resolveValue('Collab Notes Link', true).length > 0
            && editorState.email?.values?.resolveValue('Collab PDF Link', true) !== undefined
            && editorState.email?.values?.resolveValue('Collab PDF Link', true).length > 0
            && editorState.email?.areNotesSaved === true;
    }

    const isReady = () => {
        return hasResolvedRemote && editorState.email?.notionURL !== undefined && editorState.email?.notionURL.length > 0 || isDone();
    }



    const tryAction = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {

        const email = editorState.email;
        const values = email?.values;

        if (!email || !values) return setMessage('No email found.');

        let url = values.resolveValue('Collab Notes Link', true);

        if (!url || url.length === 0) {
            const sourceDoc = values.resolveValue("Source Collab Notes Doc", true) ?? '';

            if (!sourceDoc || !isValidHttpUrl(sourceDoc)) {
                console.log("Invalid source doc", sourceDoc);
                return setMessage('Invalid source document link.');
            }

            const contentRes = await getGoogleDocContentByUrl(sourceDoc, globalSettings.googleAccessToken ?? '');

            if (!contentRes.success || !contentRes.content || !contentRes.title) {
                console.log("Error getting doc content", contentRes.error);
                return setMessage(contentRes.error);
            }

            const requests = createVariableEdits(contentRes, values);

            console.log("Resolved edits: ", requests);

            const newTitle = new Variables(contentRes.title).resolveWith(values);

            const createRes = await createSiblingGoogleDoc(sourceDoc, newTitle, requests, globalSettings.googleAccessToken ?? '');

            const { success, newFileId, error } = createRes;
            if (!success || !newFileId) {
                console.log("Error creating sibling doc", error);
                return setMessage(error ?? 'Error creating collaborative notes document.');
            }
            url = createGoogleDocLink(newFileId);
            console.log("Created new collaborative notes doc with ID: ", newFileId);
            values.setValue('Collab Notes Link', { value: url, source: 'remote' });


            setEditorState((prev) => ({
                ...prev,
                email: {
                    ...prev.email,
                    values: new Values(values.initialValues),
                }
            }));
        }

        const notesName = values.resolveValue('Collab Notes ID', true) ?? '';
        let pdfUrl = values.resolveValue('Collab PDF Link', true) ?? '';
        let ids = [values.resolveValue('id', true)];
        let originalIds = [values.resolveValue('Original ID', true)];

        if (values.getCurrentValue('Is Combined Workshop Session') === 'Is Combined Workshop Session') {
            ids = [values.getCurrentValue('Lecture ID'), values.getCurrentValue('Coaching ID')];
            originalIds = [values.getCurrentValue('Original Lecture ID'), values.getCurrentValue('Original Coaching ID')];
        }
        if (values.getCurrentValue('Is Combined Options Session') === 'Is Combined Options Session') {
            ids = [values.getCurrentValue('First ID'), values.getCurrentValue('Second ID')];
            originalIds = [values.getCurrentValue('Original First ID'), values.getCurrentValue('Original Second ID')];
        }

        const pdfRes = await saveNotesDoc(notesName, url, ids, values.resolveValue('Calendar Table ID', true), originalIds, pdfUrl);
        console.log("Saved notes doc as PDF", pdfRes);

        if (!pdfRes.success) {
            console.log("Error saving notes doc", pdfRes.error);
            return setMessage(pdfRes.error ?? 'Error saving collaborative notes document.');
        }

        pdfUrl = pdfRes.pdfUrl;


        values.setValue('Collab PDF Link', { value: pdfUrl, source: 'remote' });
        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                areNotesSaved: true,
                values: new Values(values.initialValues),
            }
        }));

        return true;
    }

    const tryUndo = async () => {
        const values = editorState.email?.values;
        if (!values) return true;
        const collabNotesLink = editorState.email?.values?.resolveValue('Collab Notes Link', true);
        const collabNotesPDFLink = editorState.email?.values?.resolveValue('Collab PDF Link', true);

        if (!collabNotesLink) return true;

        let ids = [values.resolveValue('id', true)];
        let originalIds = [values.resolveValue('Original ID', true)];

        if (values.getCurrentValue('Is Combined Workshop Session') === 'Is Combined Workshop Session') {
            ids = [values.getCurrentValue('Lecture ID'), values.getCurrentValue('Coaching ID')];
            originalIds = [values.getCurrentValue('Original Lecture ID'), values.getCurrentValue('Original Coaching ID')];
        }
        if (values.getCurrentValue('Is Combined Options Session') === 'Is Combined Options Session') {
            ids = [values.getCurrentValue('First ID'), values.getCurrentValue('Second ID')];
            originalIds = [values.getCurrentValue('Original First ID'), values.getCurrentValue('Original Second ID')];
        }


        const undoRes = await undoSaveNotesDoc(ids, values.resolveValue('Calendar Table ID', true), originalIds);

        if (!undoRes.success) {
            console.log("Error undoing save notes doc", undoRes.error);
            return true;
        }

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                values: new Values(values.initialValues),
                areNotesSaved: false,
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