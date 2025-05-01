"use client";

import { EditorState, EditorContext } from "@/domain/schema";
import { useEffect, useState } from "react";
import { EditorHelpIcon } from "../components/info";
import { Loader } from "@mantine/core";

export function EditorStateProvider({ children }: { children: React.ReactNode }) {
    const [editorState, setEditorState] = useState<EditorState>({ step: 0 });
    const [isLoading, setIsLoading] = useState(false);

    const INITIAL_DELAY = 200;
    const LOAD_DELAY = 50;

    const setEditorStateDelayed = (state: EditorState) => {
        setIsLoading(true);
        setTimeout(() => {
            setEditorState(state);

            setTimeout(() => {
                setIsLoading(false);
            }, LOAD_DELAY);
        }, INITIAL_DELAY);
    }

    return (
        <EditorContext.Provider value={[editorState, setEditorState, isLoading, setEditorStateDelayed]}>
            <EditorHelpIcon />
            {
                children
            }

        </EditorContext.Provider>
    );
}