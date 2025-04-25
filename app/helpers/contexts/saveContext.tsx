"use client";

import { EditorContext, EditorState } from "@/domain/schema";
import { deleteEmailStateRecord, loadAirtableSaves, saveStateToAirtable } from "@/domain/data/airtable";
import { } from "@/domain/data/localStorage";
import { SavedEmailsContext, recoverCurrentEditorState, saveStateLocally, saveLocally, loadLocally, saveRemotely, deleteState, loadRemotely } from "@/domain/data/saveData";
import { Saves } from "@/domain/schema";
import { Values } from "@/domain/schema/valueCollection";
import { Variables } from "@/domain/schema/variableCollection";
import { LOCAL_SAVE_INTERVAL, REMOTE_SAVE_INTERVAL } from "@/domain/settings/save";
import { Box, Flex, Loader } from "@mantine/core";
import { ReactNode, useContext, useEffect, useState, createContext, useRef } from "react";


const DEBUG = false;
export function SaveContext({ children }: { children: React.ReactNode }) {
    const [editorState, setEditorState] = useContext(EditorContext);
    const lastEditorState = useRef<EditorState | undefined>(undefined);

    const [saves, setSaves] = useState<Saves>([]);

    const localTimeoutId = useRef<NodeJS.Timeout | null>(null);
    const remoteTimeoutId = useRef<NodeJS.Timeout | null>(null);

    const [isLoading, setIsLoading] = useState(true);


    // Load last editor state on load
    useEffect(() => {
        const recoverState = async () => {
            // Resume email state on load
            setIsLoading(true);

            const state = await recoverCurrentEditorState();
            setEditorState(state ?? { step: 0 });

            setIsLoading(false);
        }

        const loadSaves = async () => {
            const saves = await loadRemotely();
            setSaves(saves);
        }

        loadSaves();
        recoverState();
    }, []);

    // Save on any edit
    useEffect(() => {
        if (!editorState.email || editorState.step === 0) return;

        if (localTimeoutId.current)
            clearTimeout(localTimeoutId.current);
        localTimeoutId.current = setTimeout(() => {
            saveStateLocally(editorState);
            setSaves(loadLocally());
        }, LOCAL_SAVE_INTERVAL);

        if (remoteTimeoutId.current)
            clearTimeout(remoteTimeoutId.current);
        remoteTimeoutId.current = setTimeout(async () => {
            await saveRemotely();
            setSaves(loadLocally());
        }, REMOTE_SAVE_INTERVAL);

        if (lastEditorState.current?.email?.name !== editorState.email?.name) {
            console.log('[SAVE] Saving old email during switch:', lastEditorState);
            saveStateLocally(lastEditorState.current);
        }
        lastEditorState.current = editorState;

        // saveStateLocally(editorState);
        // setSaves(loadLocally());

    }, [JSON.stringify(editorState)]);

    const handleEmailDelete = async (id?: string) => {
        if (!id) return false;

        if (DEBUG) console.log('[SAVE] Deleting email:', id, ' from state:', editorState);
        if (id === editorState.email?.airtableId || id === editorState.email?.name) {
            if (DEBUG) console.log('[SAVE] Deleting current email, resetting editor', editorState.email?.name);
            lastEditorState.current = undefined;
            setEditorState({ step: 0 });
        }

        const done = await deleteState(id);

        setSaves(loadLocally());

        return done;
    }

    console.log('[SAVE] Saves:', saves);
    console.log('[SAVE] Editor state:', editorState);

    return (
        <SavedEmailsContext.Provider value={[saves, handleEmailDelete]}>
            {
                isLoading ?
                    (
                        <Flex className="absolute top-0 left-0 right-0 bottom-0 z-50 backdrop-blur-xl" align={"center"} justify="center">
                            <Loader size="lg" color="gray" variant="lines" />
                        </Flex>
                    )
                    :
                    children
            }
        </SavedEmailsContext.Provider>
    );

}