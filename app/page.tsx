"use client";

import { ContentHelper } from "./helpers/emailEditing/contentFill";
import { useState, createContext, useMemo } from "react";
import { EditorState, Email } from "@/domain/schema";
import { EmailCreator } from "./helpers/emailCreation/emailCreator";
import { ValueReview } from "./helpers/valueReview";
import { TemplateFill } from "./helpers/emailEditing/templateFill";
import { EmailSelector } from "./helpers/emailCreation/emailSelector";

export const EditorContext = createContext<[EditorState, (state: EditorState) => void]>([{ step: 0 }, () => { }]);

export default function Home() {
  const [editorState, setEditorState] = useState<EditorState>({ step: 0 });
  const currentHelper = useMemo(() => {
    const steps = [(<EmailSelector></EmailSelector>), (<ValueReview></ValueReview>), (<TemplateFill></TemplateFill>)];
    return steps[editorState.step] || 'Missing step';
  }, [editorState.step]);

  return (
    <EditorContext.Provider value={[editorState, setEditorState]}>
      <div className="font-[family-name:var(--font-dm-sans)]">
        <main className="h-screen max-h-screen overflow-scroll">
          {currentHelper}
        </main>
      </div>
    </EditorContext.Provider>
  );
}
