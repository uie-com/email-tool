"use client";

import { compressText, decompressText } from "../parse/parse";
import { EditorState, Email, EmailStates } from "../schema";
import { Values } from "../schema/valueCollection";






export function saveEmailStateLocally(id: string, state: EditorState) {
    let emailDict = loadEmails('emails');
    if (!emailDict) {
        emailDict = {};
    }
    emailDict[id] = state;
    saveEmails('emails', emailDict);
}

export function deleteEmailStateLocally(id: string) {
    let emailDict = loadEmails('emails');
    if (!emailDict) {
        emailDict = {};
    }
    delete emailDict[id];
    saveEmails('emails', emailDict);
}

export function getEmailStateLocally(id: string) {
    const emails = loadEmails();
    if (emails[id]) {
        return emails[id];
    }
    return null;
}

export function getEmailStateById(id: string) {
    const emails = loadEmails();
    if (emails[id]) {
        return emails[id];
    } else {
        const key = Object.keys(emails).find((k) => emails[k].email?.id === id);
        if (key) {
            const state = emails[key];
            state.email = {
                ...state.email,
                values: new Values(state.email?.values?.initialValues ?? [])
            }
            if (state.step === 0)
                return null;
            return state;
        }
    }
    return null;
}

export function markEmailStatesAsSavedRemote() {
    const emails = loadEmails();
    saveEmails('remoteemails', emails);
}

export function getChangedEmailStates() {
    const emails = loadEmails();
    const remoteemails = loadEmails('remoteemails');
    if (!emails && !remoteemails) return {};
    if (!emails) return {};
    if (!remoteemails) return emails;
    const changedEmails: EmailStates = {};
    Object.keys(emails).forEach((localKey) => {
        if (!emails[localKey]) return;
        const remoteEquivalentKey = Object.keys(remoteemails).find((remoteKey) => remoteemails[remoteKey].email?.id === localKey);
        if (!remoteEquivalentKey || JSON.stringify(emails[localKey]) !== JSON.stringify(remoteemails[remoteEquivalentKey])) {
            console.log('Found changed email', emails[localKey], remoteemails[remoteEquivalentKey ?? '']);
            changedEmails[localKey] = emails[localKey];
        }
    });
    return changedEmails;
}

export function getEmailStates() {
    return loadEmails();
}

export function deleteEmailState(id: string) {
    const emails = loadEmails();
    if (!emails) {
        console.error('No emails found');
        return;
    }
    if (!emails[id]) {
        console.error('No email found for id', id);
        return;
    }
    delete emails[id];
    saveEmails('emails', emails);
}

export function addAirtableIdToEmailState(id: string, originalKey: string) {
    const emails = loadEmails();
    if (!emails) {
        console.error('No emails found');
        return;
    }
    if (!emails[originalKey]) {
        console.error('No email found for key', originalKey);
        return;
    }

    if (originalKey === id) {
        emails[id].email = {
            ...emails[originalKey].email,
            airtableId: id
        }
    } else {
        emails[id] = {
            ...emails[originalKey],
            email: {
                ...emails[originalKey].email,
                airtableId: id
            }
        }
        delete emails[originalKey];
    }

    saveEmails('emails', emails);
}

export function clearEmailStates() {
    if (typeof window === 'undefined' || !localStorage) return;
    localStorage.removeItem('emails');
    localStorage.removeItem('remoteemails');
}

function loadEmails(key: string = 'emails') {
    if (typeof window === 'undefined' || !localStorage) return {};
    let emails: any = localStorage.getItem(key);
    if (!emails) return {};
    try {
        emails = JSON.parse(decompressText(emails)) as EmailStates;
    } catch (e) {
        console.error('Error loading emails', e);
        return {};
    }
    return emails as EmailStates;
}

export function saveEmails(key: string = 'emails', emails: EmailStates) {
    if (typeof window === 'undefined' || !localStorage) return {};
    localStorage.setItem(key, compressText(JSON.stringify(emails)));
}

export function setCurrentEmailId(state: EditorState) {
    if (typeof window === 'undefined' || !localStorage) return;
    localStorage.setItem('currentEmail', state.email?.id ?? '');
}

export function getCurrentEmailId() {
    if (typeof window === 'undefined' || !localStorage) return '';
    const email = localStorage.getItem('currentEmail');
    if (!email) return '';
    return email;
}