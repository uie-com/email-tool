import { createContext, Dispatch, SetStateAction } from "react";
import { EditorState, Email, Saves } from "../schema";
import { deleteEmailStateRecord, loadAirtableSaves, saveStateToAirtable } from "./airtable";
import { saveStringToLocalStorage, loadStringFromLocalStorage } from "./localStorage";

const DEBUG = true;

export const SavedEmailsContext = createContext<[Saves, (id?: string) => Promise<boolean>]>([{} as Saves, async () => false]);

const CURRENT_EMAIL_NAME_KEY = 'currentEmail';
const EMAILS_KEY = 'emails';
const REMOTE_SAVE_SNAPSHOT_KEY = 'remoteEmails';


export async function recoverCurrentEditorState() {
    const currentEmailName = getCurrentEmailName();
    if (DEBUG) console.log('[SAVE] Recovering email state', currentEmailName);
    if (!currentEmailName) return undefined;

    const localEmails = loadLocally();
    const currentState = localEmails.find((state) => state.email?.name === currentEmailName);
    if (DEBUG) console.log('[SAVE] Found local email state', currentState);
    if (currentState)
        return reconstructEmail(currentState);

    const remoteEmails = await loadAirtableSaves();
    const currentRemoteState = remoteEmails.find((state) => state.email?.name === currentEmailName);
    if (DEBUG) console.log('[SAVE] Found remote email state', currentRemoteState);
    if (currentRemoteState)
        return reconstructEmail(currentRemoteState);

    console.log('[SAVE] No email state found for id', currentEmailName);
    return undefined;
}

export function saveStateLocally(state?: EditorState) {
    if (DEBUG) console.log('[SAVE] Saving email state locally', state);
    if (!state?.email?.name) return DEBUG ? console.log('[SAVE] No email name found, not saving', state) : undefined;

    const emails = loadLocally();
    const existingState = emails.find((s) => s.email?.name === state.email?.name);
    if (existingState) {
        if (DEBUG) console.log('[SAVE] Found existing email state', existingState);
        const index = emails.indexOf(existingState);
        emails[index] = state;
    } else {
        if (DEBUG) console.log('[SAVE] No existing email state found, adding new one', state);
        emails.push(state);
    }

    if (DEBUG) console.log('[SAVE] Finished editing email array', emails);
    saveCurrentEmailName(state.email?.name ?? '');
    saveLocally(emails, EMAILS_KEY);
}

export async function deleteState(id: string) {
    if (DEBUG) console.log('[SAVE] Deleting email state', id);

    const isDone = await deleteEmailStateRecord(id);

    const emails = loadLocally();
    const index = emails.findIndex((state) => state.email?.airtableId === id);
    const localIndex = emails.findIndex((state) => state.email?.name === id);
    if (index === -1) {
        console.error('No remote email state found for id', id);

        if (localIndex !== -1) {
            if (DEBUG) console.log('[SAVE] Found local email state, deleting it', emails[localIndex]);
            emails.splice(localIndex, 1);
            saveLocally(emails, EMAILS_KEY);
        } else
            console.error('[SAVE] No local email state found for id', id);

        return true;
    }

    if (index !== -1 && isDone) {
        if (DEBUG) console.log('[SAVE] Deleted email state from remote storage', emails);

        emails.splice(index, 1);
        saveLocally(emails, EMAILS_KEY);
        saveSnapshot();
    } else
        console.error('[SAVE] Failed to delete email state from remote storage', emails);

    return isDone;
}

export async function loadRemotely() {
    const res = await loadAirtableSaves();
    if (DEBUG) console.log('[SAVE] Loaded remote emails', res);
    saveLocally(res, EMAILS_KEY);
    saveSnapshot();
    return reconstructEmails(res);
}

export async function saveRemotely() {
    const emails = loadLocally();
    const unsavedStates = getUnsavedStates();
    if (DEBUG) console.log('[SAVE] Saving emails remotely', unsavedStates);
    for (const state of unsavedStates) {
        const airtableId = await saveStateToAirtable(JSON.stringify(state));
        const emails = addAirtableIdToEmailState(airtableId, state.email?.name);
        saveLocally(emails, EMAILS_KEY);
        saveSnapshot();
    }
}

function getUnsavedStates() {
    const localEmails = loadLocally();
    const remoteEmails = loadLocally(REMOTE_SAVE_SNAPSHOT_KEY);

    const filteredEmails = localEmails.filter((state) => {
        return remoteEmails.find((remoteState) => {
            if (state.email?.name === remoteState.email?.name
                || state.email?.airtableId === remoteState.email?.airtableId) {
                return JSON.stringify(state) !== JSON.stringify(remoteState);
            }
            return false;
        }) !== undefined || !state.email?.airtableId;
    });

    return filteredEmails;
}

function addAirtableIdToEmailState(id?: string, originalKey?: string): Saves {
    const states = loadLocally();
    if (!states || !states.length) return [];
    if (!id || !originalKey || originalKey === id) return states;

    const markedEmails = states.map((state) => {
        if (state.email?.name === originalKey) {
            return {
                ...state,
                email: {
                    ...state.email,
                    airtableId: id
                }
            }
        }
        return state;
    });

    return markedEmails;
}

function saveSnapshot() {
    const emails = loadLocally();
    if (DEBUG) console.log('[SAVE] Saving snapshot', emails);
    saveLocally(emails, REMOTE_SAVE_SNAPSHOT_KEY);
}

export function loadLocally(key: string = EMAILS_KEY): Saves {
    const str = loadStringFromLocalStorage(key);
    try {
        if (!str) return [];
        let emails = JSON.parse(str) as Saves;
        emails = reconstructEmails(emails);
        if (DEBUG) console.log('[SAVE] Loaded emails', emails);
        return emails;
    }
    catch (e) {
        console.error('Couldn\'t load saved emails from local storage.', e);
        return [];
    }
}

export function saveLocally(emails: Saves, key: string = EMAILS_KEY) {
    if (DEBUG) console.log('[SAVE] Saving emails locally', emails);
    saveStringToLocalStorage(key, JSON.stringify(emails));
}

export function saveCurrentEmailName(id: string) {
    console.log('[SAVE] Saving current email name', id);
    saveStringToLocalStorage(CURRENT_EMAIL_NAME_KEY, id);
}

export function getCurrentEmailName() {
    const id = loadStringFromLocalStorage(CURRENT_EMAIL_NAME_KEY);
    if (DEBUG) console.log('[SAVE] Loaded current email name', id);
    return id;
}

function reconstructEmails(states: Saves) {
    return states.map((state) => ({ ...state, email: new Email(undefined, state.email) }));
}

function reconstructEmail(state: EditorState) {
    return { ...state, email: new Email(undefined, state.email) };
}






// export async function syncEmails() {
//     clearEmailStates();
//     const emails = await loadAirtableSaves();
//     if (DEBUG) console.log('[SAVE] Loaded emails', emails);
//     saveEmails('emails', emails);
//     markEmailStatesAsSavedRemote();
// }

// export function saveState(editorState: EditorState) {
//     if (!editorState?.email?.name) return;

//     const savedId = getCurrentEmailName();

//     if (savedId !== editorState.email?.name) {
//         if (DEBUG) console.log('[SAVE] Switch to new email', editorState);
//         setCurrentEmailId(editorState);
//     }
// }

// export function saveStates(editorStates: Saves) {
//     if (DEBUG) console.log('[SAVE] Saving email states', editorStates);
//     saveEmails('emails', editorStates);

// }

// export function recoverState(editorState: EditorState, setEditorState: Dispatch<SetStateAction<EditorState>>) {
//     if (editorState.email) return null;

//     const recoveredEmailId = getCurrentEmailName();
//     const recoveredState = getEmailStateById(recoveredEmailId);

//     if (DEBUG) console.log('[SAVE] Recovered email state', recoveredState);

//     if (!recoveredState) return null;

//     setEditorState(recoveredState);
//     return recoveredState;
// }

// export function saveEmailLocally(editorState: EditorState) {
//     if (!editorState.email?.airtableId && !editorState.email?.name) return;
//     if (editorState.step === 0 || editorState.email?.name && (editorState.email?.name.includes('{') || editorState.email?.name?.length < 8)) return;

//     if (DEBUG) console.log('[SAVE] Saving email edits locally', editorState);
//     saveEmailStateLocally(editorState.email?.airtableId ?? editorState.email?.name ?? '', editorState);
// }

// export async function saveEmailRemotely(editorState: EditorState, setEditorState: Dispatch<SetStateAction<EditorState>>) {
//     if (Object.keys(getChangedEmailStates()).length === 0) return console.log('[SAVE] No local changes to save.', editorState);

//     const editedEmails = getChangedEmailStates();
//     if (DEBUG) console.log('[SAVE] Saving email edits remotely', editedEmails);

//     for (const index in Object.keys(editedEmails)) {
//         const key = Object.keys(editedEmails)[index];
//         const editedEmail = editedEmails[key].email;

//         if (editedEmails[key].step === 0 || editedEmails[key].email?.name && (editedEmails[key].email?.name.includes('{') || editedEmails[key].email?.name?.length < 8)) return console.log('[SAVE] No real email ID found, "' + editedEmail?.name + '" not saving');

//         if (!editedEmail?.airtableId && !editedEmail?.name)
//             return console.log('[SAVE] No email ID found, "' + editedEmail?.name + '" not saving');

//         if (DEBUG) console.log('[SAVE] Saving email state for ' + key, editedEmails[key]);

//         const airtableId = await saveStateToAirtable(editedEmails[key]);

//         addAirtableIdToEmailState(airtableId, key);

//         if (getCurrentEmailName() === key && !editorState.email?.airtableId) {
//             console.log('[SAVE] Saved this new email to airtable ', { ...editorState, email: { ...editorState.email, airtableId: airtableId } });

//             setEditorState((prev) => ({ ...prev, email: { ...prev.email, airtableId: airtableId } }));
//         }
//     };

//     markEmailStatesAsSavedRemote();
// }




// export function saveEmailStateLocally(id: string, state: EditorState) {
//     let emailDict = loadEmails('emails');
//     if (!emailDict) {
//         emailDict = {};
//     }
//     emailDict[id] = state;
//     saveEmails('emails', emailDict);
// }

// export function deleteEmailStateLocally(id: string) {
//     let emailDict = loadEmails('emails');
//     if (!emailDict) {
//         emailDict = {};
//     }
//     delete emailDict[id];
//     saveEmails('emails', emailDict);
// }

// export function getEmailStateLocally(id: string) {
//     const emails = loadEmails();
//     if (emails[id]) {
//         return emails[id];
//     }
//     return null;
// }

// export function getEmailStateById(id: string) {
//     const emails = loadEmails();
//     if (emails[id]) {
//         return emails[id];
//     } else {
//         const key = Object.keys(emails).find((k) => emails[k].email?.name === id);
//         if (key) {
//             const state = emails[key];
//             state.email = {
//                 ...state.email,
//                 values: new Values(state.email?.values?.initialValues ?? [])
//             }
//             if (state.step === 0)
//                 return null;
//             return state;
//         }
//     }
//     return null;
// }

// export function markEmailStatesAsSavedRemote() {
//     const emails = loadEmails();
//     saveEmails('remoteemails', emails);
// }

// export function getChangedEmailStates() {
//     const emails = loadEmails();
//     const remoteemails = loadEmails('remoteemails');
//     if (!emails && !remoteemails) return {};
//     if (!emails) return {};
//     if (!remoteemails) return emails;
//     const changedEmails: Saves = {};
//     Object.keys(emails).forEach((localKey) => {
//         if (!emails[localKey]) return;
//         const remoteEquivalentKey = Object.keys(remoteemails).find((remoteKey) => remoteemails[remoteKey].email?.name === localKey);
//         if (!remoteEquivalentKey || JSON.stringify(emails[localKey]) !== JSON.stringify(remoteemails[remoteEquivalentKey])) {
//             console.log('[SAVE] Found changed email', emails[localKey], remoteemails[remoteEquivalentKey ?? '']);
//             changedEmails[localKey] = emails[localKey];
//         }
//     });
//     return changedEmails;
// }

// export function getEmailStates() {
//     return loadEmails();
// }

// export function deleteEmailState(id: string) {
//     const emails = loadEmails();
//     if (!emails) {
//         console.error('No emails found');
//         return;
//     }
//     if (!emails[id]) {
//         console.error('No email found for id', id);
//         return;
//     }
//     delete emails[id];
//     saveEmails('emails', emails);
// }

// // export function addAirtableIdToEmailState(id: string, originalKey: string) {
// //     const emails = loadEmails();
// //     if (!emails) {
// //         console.error('No emails found');
// //         return;
// //     }
// //     if (!emails[originalKey]) {
// //         console.error('No email found for key', originalKey);
// //         return;
// //     }

// //     if (originalKey === id) {
// //         emails[id].email = {
// //             ...emails[originalKey].email,
// //             airtableId: id
// //         }
// //     } else {
// //         emails[id] = {
// //             ...emails[originalKey],
// //             email: {
// //                 ...emails[originalKey].email,
// //                 airtableId: id
// //             }
// //         }
// //         delete emails[originalKey];
// //     }

// //     saveEmails('emails', emails);
// // }

// export function clearEmailStates() {
//     if (typeof window === 'undefined' || !localStorage) return;
//     localStorage.removeItem('emails');
//     localStorage.removeItem('remoteemails');
// }

// function loadEmails(key: string = 'emails') {
//     if (typeof window === 'undefined' || !localStorage) return {};
//     let emails: any = localStorage.getItem(key);
//     if (!emails) return {};
//     try {
//         emails = JSON.parse(decompressText(emails)) as Saves;
//     } catch (e) {
//         console.error('Error loading emails', e);
//         return {};
//     }
//     return emails as Saves;
// }

// export function saveEmails(key: string = 'emails', emails: Saves) {
//     if (typeof window === 'undefined' || !localStorage) return {};
//     localStorage.setItem(key, compressText(JSON.stringify(emails)));
// }

// export function setCurrentEmailId(state: EditorState) {
//     if (typeof window === 'undefined' || !localStorage) return;
//     localStorage.setItem('currentEmail', state.email?.name ?? '');
// }

// // export function getCurrentEmailId() {
// //     if (typeof window === 'undefined' || !localStorage) return '';
// //     const email = localStorage.getItem('currentEmail');
// //     if (!email) return '';
// //     return email;
// // }