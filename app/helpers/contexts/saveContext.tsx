"use client";

import { EditorContext, EditorState } from "@/domain/schema";
import { SavedEmailsContext, recoverCurrentEditorState, saveStateLocally, saveLocally, loadLocally, saveRemotely, deleteState, loadRemotely } from "@/domain/data/saveData";
import { Saves } from "@/domain/schema";
import { Values } from "@/domain/schema/valueCollection";
import { Variables } from "@/domain/schema/variableCollection";
import { LOCAL_SAVE_INTERVAL, REMOTE_SAVE_INTERVAL } from "@/domain/settings/save";
import { Box, Flex, Loader, Text } from "@mantine/core";
import { ReactNode, useContext, useEffect, useState, createContext, useRef } from "react";


const DEBUG = false;
export function SaveContextProvider({ children }: { children: React.ReactNode }) {
    const [editorState, setEditorState] = useContext(EditorContext);
    const lastEditorState = useRef<EditorState | undefined>(undefined);

    const [saves, setSaves] = useState<Saves>([]);

    const localTimeoutId = useRef<NodeJS.Timeout | null>(null);
    const remoteTimeoutId = useRef<NodeJS.Timeout | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState<'' | 'Loading...' | 'Loaded' | '...' | 'Saving...' | 'Saved'>('');

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
            setSaveStatus('Loading...');
            const saves = await loadRemotely();
            setSaves(saves);
            setSaveStatus('Loaded');
            setTimeout(() => {
                setSaveStatus('');
            }, 4000);

        }

        loadSaves();
        recoverState();
    }, []);

    // Save on any edit
    useEffect(() => {
        if (!editorState.email || editorState.step === 0) return;
        setSaveStatus((p) => p === 'Loading...' ? 'Loading...' : '...');

        if (localTimeoutId.current)
            clearTimeout(localTimeoutId.current);
        localTimeoutId.current = setTimeout(() => {
            saveStateLocally(editorState);
            setSaves(loadLocally());
        }, LOCAL_SAVE_INTERVAL);

        if (remoteTimeoutId.current)
            clearTimeout(remoteTimeoutId.current);
        remoteTimeoutId.current = setTimeout(async () => {
            setSaveStatus('Saving...');

            await saveRemotely();
            setSaves(loadLocally());
            setSaveStatus('Saved');

            // setTimeout(() => {
            //     setSaveStatus('');
            // }, 4000);
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
        setSaveStatus('Saving...');

        console.log('[SAVE] Deleting email:', id, ' from state:', editorState);
        if (id === editorState.email?.airtableId || id === editorState.email?.name) {
            if (DEBUG) console.log('[SAVE] Deleting current email, resetting editor', editorState.email?.name);
            lastEditorState.current = undefined;
            setEditorState({ step: 0 });
        }

        const done = await deleteState(id);

        setSaves(loadLocally());
        setSaveStatus('Saved');

        return done;
    }

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
                    <>
                        {children}
                        <Text className="absolute bottom-5 right-5 p-0 block" c='dimmed' size="sm">
                            {saveStatus}
                        </Text>
                    </>
            }
        </SavedEmailsContext.Provider>
    );

}