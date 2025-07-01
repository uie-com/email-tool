"use client";

import { REMOTE_SAVE_INTERVAL, REVIEW_PASSIVE_REFRESH_INTERVAL } from "@/config/save-settings";
import { EditorContext } from "@/domain/context";
import { SavedEmailsContext, deleteState, loadAllRemotely, loadState, markReviewedEmails, recoverCurrentEditorState, saveState } from "@/domain/email/save/saveData";
import { loadAirtableSave } from "@/domain/integrations/airtable/saveActions";
import { EditorState, Saves } from "@/domain/schema";
import { Flex, Loader, Text } from "@mantine/core";
import { useContext, useEffect, useRef, useState } from "react";


const DEBUG = true;
export function SaveContextProvider({ children }: { children: React.ReactNode }) {
    const [editorState, setEditorState] = useContext(EditorContext);
    const lastEditorState = useRef<EditorState | undefined>(undefined);

    const [saves, setSaves] = useState<Saves>([]);

    const localTimeoutId = useRef<NodeJS.Timeout | null>(null);
    const remoteTimeoutId = useRef<NodeJS.Timeout | null>(null);

    const refreshSavesInterval = useRef<NodeJS.Timeout | null>(null);
    const refreshReviewsInterval = useRef<NodeJS.Timeout | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState<'' | 'Loading...' | 'Loaded' | '...' | 'Saving...' | 'Saved'>('');

    const [requestSave, setRequestSave] = useState(false);

    // Load last editor state on load
    useEffect(() => {
        const recoverState = async () => {
            // Resume email state on load
            setIsLoading(true);

            const state = await recoverCurrentEditorState();
            setEditorState(state ?? { step: 0 });

            setIsLoading(false);
        }

        // Download all saves on load
        const loadSaves = async () => {

            setSaveStatus('Loading...');
            const saves = await loadAllRemotely();
            setSaves(saves);
            setSaveStatus('Loaded');
            setTimeout(() => {
                setSaveStatus('');
            }, 4000);
        }

        loadSaves();
        recoverState();


    }, []);

    useEffect(() => {
        const refreshReviews = async (delay: number = REVIEW_PASSIVE_REFRESH_INTERVAL) => {
            if (refreshReviewsInterval.current)
                clearInterval(refreshReviewsInterval.current);

            refreshReviewsInterval.current = setTimeout(async () => {
                console.log('Refreshing reviews...', saves);
                const newSaves = await markReviewedEmails(saves);
                newSaves.forEach(async (id) => {
                    const save = saves.find((s) => s.email?.name === id);
                    let fullSave = await loadState(id);
                    if (!fullSave) return;

                    fullSave = {
                        ...fullSave,
                        email: {
                            ...fullSave.email,
                            isReviewed: true,
                        }
                    }

                    handleSaveEdit(fullSave);
                });

            }, delay);
        }


        window.addEventListener('focus', () => refreshReviews());
        window.addEventListener('load', () => refreshReviews(0));

        return () => {
            if (refreshReviewsInterval.current)
                clearInterval(refreshReviewsInterval.current);
            window.removeEventListener('focus', () => refreshReviews());
        }
    }, [saves]);

    const warnUnsavedChanges = (e: BeforeUnloadEvent) => {
        if (DEBUG) console.log('[SAVE] Before unload, saving state:', editorState);
        e.preventDefault();
        e.returnValue = '';
    }


    // auto-save on edit
    useEffect(() => {
        if (!editorState.email || editorState.step === 0) return;
        setSaveStatus((p) => p === 'Loading...' ? 'Loading...' : '...');
        window.addEventListener('beforeunload', warnUnsavedChanges);

        if (remoteTimeoutId.current)
            clearTimeout(remoteTimeoutId.current);
        remoteTimeoutId.current = setTimeout(async () => {
            setSaveStatus('Saving...');

            const newSaves = await saveState(editorState, saves, true);

            if (newSaves)
                setSaves(newSaves);

            setSaveStatus('Saved');
            window.removeEventListener('beforeunload', warnUnsavedChanges);

            // setTimeout(() => {
            //     setSaveStatus('');
            // }, 4000);
        }, REMOTE_SAVE_INTERVAL);

        if (lastEditorState.current?.email?.name !== editorState.email?.name) {
            console.log('[SAVE] Saving old email during switch:', lastEditorState);
            handleSaveEdit(lastEditorState.current);
        }
        lastEditorState.current = editorState;

        // saveStateLocally(editorState);
        // setSaves(loadLocally());

        setRequestSave(false);
    }, [JSON.stringify(editorState), requestSave]);

    const handleSaveEdit = async (editedState: EditorState | undefined) => {
        const id = editedState?.email?.name ?? editedState?.email?.airtableId;
        if (!id || !editedState) return false;

        console.log('[SAVE] Saving email:', id, ' with state:', editedState);
        if (editedState.email?.isShortened) {
            const fullState = await loadState(id);
            console.log('[SAVE] Loading email:', id, ' to edit with state:', fullState);

            if (!fullState) return false;
            editedState = {
                ...fullState,
                ...editedState,
                email: {
                    ...fullState.email,
                    ...editedState.email,
                    airtableId: fullState.email?.airtableId,
                    name: fullState.email?.name,
                    values: fullState.email?.values,
                    isShortened: false,
                }
            }
        }

        const newSaves = await saveState(editedState, saves, false);
        if (newSaves)
            setSaves(newSaves);

        if (editorState.email?.name === id || editorState.email?.airtableId === id) {
            console.log('[SAVE] Edited current email, resetting editor', editorState.email?.name);
            setEditorState(editedState);
        }
        return true;
    }

    const handleEmailDelete = async (id?: string) => {
        if (!id) return false;

        await new Promise((resolve) => setTimeout(resolve, REMOTE_SAVE_INTERVAL));

        setSaveStatus('Saving...');

        console.log('[SAVE] Deleting email:', id, ' from state:', editorState);
        if (id === editorState.email?.name) {
            const matchingEmail = saves.find((email) => email.email?.name === id);
            id = matchingEmail?.email?.airtableId ?? '';
        }
        if (id === editorState.email?.airtableId) {
            if (DEBUG) console.log('[SAVE] Deleting current email, resetting editor', editorState.email?.name);
            lastEditorState.current = undefined;
            setEditorState({ step: 0 });
        }

        const newSaves = await deleteState(saves, id);
        if (newSaves)
            setSaves(newSaves);

        setSaveStatus('Saved');

        return newSaves !== undefined;
    }

    const handleEmailLoad = async (id: string | undefined) => {
        if (!id) return undefined;

        const state = await loadAirtableSave(id);
        if (!state || !state.email) return undefined;

        return state;
    }

    return (
        <SavedEmailsContext.Provider value={[saves, handleEmailLoad, handleEmailDelete, handleSaveEdit]}>
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