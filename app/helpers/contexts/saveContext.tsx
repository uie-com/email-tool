"use client";

import { EditorContext } from "@/domain/schema";
import { deleteEmailStateRecord, loadEmailStatesRemotely, saveEmailStateRemotely } from "@/domain/data/airtable";
import { addAirtableIdToEmailState, getEmailStates, getChangedEmailStates, markEmailStatesAsSavedRemote, saveEmailStateLocally, clearEmailStates, saveEmails, getEmailStateById, getCurrentEmailId, deleteEmailState } from "@/domain/data/localStorage";
import { syncEmails, recoverState, saveEmailLocally, saveEmailRemotely, saveState, SavedEmailsContext, saveStates } from "@/domain/data/save";
import { EmailStates } from "@/domain/schema";
import { Values } from "@/domain/schema/valueCollection";
import { Variables } from "@/domain/schema/variableCollection";
import { LOCAL_SAVE_INTERVAL, REMOTE_SAVE_INTERVAL } from "@/domain/settings/save";
import { Loader } from "@mantine/core";
import { ReactNode, useContext, useEffect, useState, createContext, useRef } from "react";


const DEBUG = false;
export function SaveContext({ children }: { children: React.ReactNode }) {
    const [editorState, setEditorState] = useContext(EditorContext);

    const [emailStates, setEmailStates] = useState<EmailStates>({});
    const localTimeoutId = useRef<NodeJS.Timeout | null>(null);
    const remoteTimeoutId = useRef<NodeJS.Timeout | null>(null);

    const [needsSync, setNeedsSync] = useState(false);

    useEffect(() => {
        const onLoad = async () => {
            // Resume email state on load
            const recoveredId = getCurrentEmailId();
            const recoveredState = recoverState(editorState, setEditorState);

            if (recoveredId && !recoveredState)
                setNeedsSync(true);
            else
                setEmailStates(getEmailStates());

            // Download email states from airtable
            await syncEmails();

            if (needsSync) {
                recoverState(editorState, setEditorState);
                setNeedsSync(false);
                setEmailStates(getEmailStates());
            }
        }

        onLoad();
    }, []);

    useEffect(() => {
        if (!editorState.email) return;

        if (localTimeoutId.current)
            clearTimeout(localTimeoutId.current);
        localTimeoutId.current = setTimeout(() => {
            saveEmailLocally(editorState);
            setEmailStates(getEmailStates());
        }, LOCAL_SAVE_INTERVAL);

        if (remoteTimeoutId.current)
            clearTimeout(remoteTimeoutId.current);
        remoteTimeoutId.current = setTimeout(trySaveEmailRemotely, REMOTE_SAVE_INTERVAL);

        saveState(editorState);
    }, [JSON.stringify(editorState)]);

    const trySaveEmailRemotely = async () => {
        await saveEmailRemotely(editorState, setEditorState);
    }


    const handleEmailDelete = async (id: string) => {
        const status = await deleteEmailStateRecord(id);
        if (status) {
            setEmailStates((prevState) => {
                const newState = { ...prevState };
                delete newState[id];
                return newState;
            });
            deleteEmailState(id);
        }
        else {
            console.error(`Failed to delete email state with id ${id}`);
        }
        return status;
    }

    return (
        <SavedEmailsContext.Provider value={[emailStates, handleEmailDelete]}>
            {
                needsSync ?
                    (<Loader className="absolute top-0 left-0 right-0 bottom-0 z-50" size="lg" color="gray" variant="lines" />)
                    :
                    children
            }
        </SavedEmailsContext.Provider>
    );

}