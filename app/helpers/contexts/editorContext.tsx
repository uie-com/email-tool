"use client";

import { EditorState, EditorContext } from "@/domain/schema";
import { useEffect, useState } from "react";
import { EditorHelpIcon } from "../components/info";

export function EditorStateProvider({ children }: { children: React.ReactNode }) {
    const [editorState, setEditorState] = useState<EditorState>({ step: 0 });

    return (
        <EditorContext.Provider value={[editorState, setEditorState]}>
            <EditorHelpIcon />
            {children}

        </EditorContext.Provider>
    );
}