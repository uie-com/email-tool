"use client";

import { useState, createContext, useMemo } from "react";
import { EditorState } from "@/domain/schema";
import { VariableTracker } from "../helpers/templateCreation/variableTracker";
import { EditorContext } from "@/domain/schema/context";


export default function Home() {
    const [editorState, setEditorState] = useState<EditorState>({ step: 0 });
    const currentHelper = useMemo(() => {
        const steps = [(<VariableTracker></VariableTracker>)];
        return steps[editorState.step] || 'Missing step';
    }, [editorState.step]);

    return (
        <EditorContext.Provider value={[editorState, setEditorState, false, () => { }]}>
            <div className="font-[family-name:var(--font-dm-sans)]">
                <main className="h-screen max-h-screen overflow-scroll">
                    {currentHelper}
                </main>
            </div>
        </EditorContext.Provider>
    );
}
