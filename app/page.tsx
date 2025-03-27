"use client";

import Image from "next/image";
import { Button } from "antd"
import { ContentHelper } from "./helpers/contentFill";
import { useState, createContext, useMemo } from "react";
import { EditorState, Email } from "@/domain/schema";
import { ProgramSchemaTester } from "./testers/programSchemaTester";
import { EmailCreator } from "./helpers/emailCreator";

export const EditorContext = createContext<[EditorState, (state: EditorState) => void]>([{ step: 0 }, () => { }]);

export default function Home() {
  const [editorState, setEditorState] = useState<EditorState>({ step: 0 });
  const currentHelper = useMemo(() => {
    if (editorState.step === 0) {
      return <EmailCreator></EmailCreator>
    } else if (editorState.step === 1) {
      return <ContentHelper></ContentHelper>
    }
    return <></>;
  }, [editorState.step]);

  return (
    <EditorContext.Provider value={[editorState, setEditorState]}>
      <div className="font-[family-name:var(--font-dm-sans)]">
        <main className="h-screen">
          {currentHelper}
        </main>
      </div>
    </EditorContext.Provider>
  );
}
