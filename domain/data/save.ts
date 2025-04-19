import { createContext, Dispatch, SetStateAction } from "react";
import { EditorState, Email, EmailStates } from "../schema";
import { loadEmailStatesRemotely, saveEmailStateRemotely } from "./airtable";
import { clearEmailStates, saveEmails, markEmailStatesAsSavedRemote, getCurrentEmailId, getEmailStateById, saveEmailStateLocally, addAirtableIdToEmailState, getChangedEmailStates, setCurrentEmailId } from "./localStorage";

const DEBUG = true;

export const SavedEmailsContext = createContext<[EmailStates, (id: string) => Promise<boolean>]>([{} as EmailStates, async () => false]);


export async function syncEmails() {
    clearEmailStates();
    const emails = await loadEmailStatesRemotely();
    if (DEBUG) console.log('Loaded emails', emails);
    saveEmails('emails', emails);
    markEmailStatesAsSavedRemote();
}

export function saveState(editorState: EditorState) {
    if (!editorState?.email?.id) return;

    const savedId = getCurrentEmailId();

    if (savedId !== editorState.email?.id) {
        if (DEBUG) console.log('Switch to new email', editorState);
        setCurrentEmailId(editorState);
    }
}

export function saveStates(editorStates: EmailStates) {
    if (DEBUG) console.log('Saving email states', editorStates);
    saveEmails('emails', editorStates);

}

export function recoverState(editorState: EditorState, setEditorState: Dispatch<SetStateAction<EditorState>>) {
    if (editorState.email) return null;

    const recoveredEmailId = getCurrentEmailId();
    const recoveredState = getEmailStateById(recoveredEmailId);

    if (DEBUG) console.log('Recovered email state', recoveredState);

    if (!recoveredState) return null;

    setEditorState(recoveredState);
    return recoveredState;
}

export function saveEmailLocally(editorState: EditorState) {
    if (!editorState.email?.airtableId && !editorState.email?.id) return;
    if (editorState.step === 0 || editorState.email?.id && (editorState.email?.id.includes('{') || editorState.email?.id?.length < 8)) return;

    if (DEBUG) console.log('Saving email edits locally', editorState);
    saveEmailStateLocally(editorState.email?.airtableId ?? editorState.email?.id ?? '', editorState);
}

export async function saveEmailRemotely(editorState: EditorState, setEditorState: Dispatch<SetStateAction<EditorState>>) {
    if (Object.keys(getChangedEmailStates()).length === 0) return console.log('No local changes to save.', editorState);

    const editedEmails = getChangedEmailStates();
    if (DEBUG) console.log('Saving email edits remotely', editedEmails);

    for (const index in Object.keys(editedEmails)) {
        const key = Object.keys(editedEmails)[index];
        const editedEmail = editedEmails[key].email;

        if (editedEmails[key].step === 0 || editedEmails[key].email?.id && (editedEmails[key].email?.id.includes('{') || editedEmails[key].email?.id?.length < 8)) return console.log('No real email ID found, "' + editedEmail?.id + '" not saving');

        if (!editedEmail?.airtableId && !editedEmail?.id)
            return console.log('No email ID found, "' + editedEmail?.id + '" not saving');

        if (DEBUG) console.log('Saving email state for ' + key, editedEmails[key]);

        const airtableId = await saveEmailStateRemotely(editedEmails[key]);

        addAirtableIdToEmailState(airtableId, key);

        if (getCurrentEmailId() === key && !editorState.email?.airtableId) {
            console.log('Saved this new email to airtable ', { ...editorState, email: { ...editorState.email, airtableId: airtableId } });

            setEditorState((prev) => ({ ...prev, email: { ...prev.email, airtableId: airtableId } }));
        }
    };

    markEmailStatesAsSavedRemote();
}