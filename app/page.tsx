"use client";

import { ContentHelper } from "./helpers/emailEditing/contentFill";
import { useState, createContext, useMemo, SetStateAction, Dispatch } from "react";
import { EditorContext, EditorState, Email } from "@/domain/schema";
import { EmailCreator } from "./helpers/emailCreation/emailCreator";
import { ValueReview } from "./helpers/valueReview";
import { TemplateFill } from "./helpers/emailEditing/templateFill";
import { EmailSelector } from "./helpers/emailCreation/emailSelector";
import { EmailPublisher } from "./helpers/emailPublishing/emailPublisher";
import { SaveContext } from "./helpers/contexts/saveContext";
import { Flex } from "@mantine/core";
import { EmailMenuWrapper } from "./helpers/emailMenu";


export default function Home() {
  const [editorState, setEditorState] = useState<EditorState>({ step: 0 });
  const currentHelper = useMemo(() => {
    const steps = [(<EmailSelector></EmailSelector>), (<ValueReview></ValueReview>), (<TemplateFill></TemplateFill>), (<EmailPublisher></EmailPublisher>), (<EmailPublisher></EmailPublisher>)];
    return steps[editorState.step] || 'Missing step';
  }, [editorState.step]);

  return (
    <EditorContext.Provider value={[editorState, setEditorState]}>
      <SaveContext>
        <div className="font-[family-name:var(--font-dm-sans)]">
          <main className="h-screen max-h-screen overflow-scroll">
            <EmailMenuWrapper>
              {currentHelper}
            </EmailMenuWrapper>
          </main>
        </div>
      </SaveContext>
    </EditorContext.Provider>
  );
}
