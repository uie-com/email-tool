"use client";

import { EditorContext } from "@/domain/context";
import { loadState } from "@/domain/email/save/saveData";
import { EditorState } from "@/domain/schema";
import { SetStateAction, useState } from "react";
import { EditorHelpIcon } from "../components/variables/debug";

export function EditorStateProvider({ children }: { children: React.ReactNode }) {
    const [editorState, setEditorState] = useState<EditorState>({ step: 0 });
    const [isLoading, setIsLoading] = useState(false);

    const INITIAL_DELAY = 200;
    const LOAD_DELAY = 50;

    const setEditorStateDelayed = (state: EditorState) => {
        setIsLoading(true);
        setTimeout(() => {
            handleEditorStateChange(state);

            setTimeout(() => {
                setIsLoading(false);
            }, LOAD_DELAY);
        }, INITIAL_DELAY);
    }

    const handleEditorStateChange = async (dispatch: SetStateAction<EditorState>) => {
        const newState = typeof dispatch === 'function' ? dispatch(editorState) : dispatch;
        if (!newState.email?.isShortened) return setEditorState(newState);
        setIsLoading(true);

        const fullState = await loadState(newState.email?.name ?? '');
        setEditorState(fullState ?? { step: 0 });

        setTimeout(() => {
            setIsLoading(false);
        }, LOAD_DELAY);
    }

    return (
        <EditorContext.Provider value={[editorState, handleEditorStateChange, isLoading, setEditorStateDelayed]}>
            <EditorHelpIcon />
            {
                children
            }

        </EditorContext.Provider>
    );
}