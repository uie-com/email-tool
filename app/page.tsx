"use client";

import { ContentHelper } from "./helpers/emailEditing/contentFill";
import { useState, createContext, useMemo, SetStateAction, Dispatch, useContext } from "react";
import { EditorContext, EditorState, Email } from "@/domain/schema";
import { EmailCreator } from "./helpers/emailCreation/emailCreator";
import { ValueReview } from "./helpers/valueReview";
import { TemplateFill } from "./helpers/emailEditing/templateFill";
import { EmailSelector } from "./helpers/emailCreation/emailSelector";
import { EmailPublisher } from "./helpers/emailPublishing/emailPublisher";
import { SaveContextProvider } from "./helpers/contexts/saveContext";
import { Flex, ScrollArea } from "@mantine/core";
import { EmailMenuWrapper } from "./helpers/emailMenu";
import { GlobalSettingsProvider } from "./helpers/contexts/settingsContext";
import { MessageContextProvider } from "./helpers/contexts/messageContext";
import { EditorStateProvider } from "./helpers/contexts/editorContext";


export default function Home() {
  const [editorState, setEditorState] = useContext(EditorContext);

  const currentHelper = useMemo(() => {
    const steps = [(<EmailSelector></EmailSelector>), (<ValueReview></ValueReview>), (<TemplateFill></TemplateFill>), (<EmailPublisher></EmailPublisher>), (<EmailPublisher></EmailPublisher>)];
    return steps[editorState.step] || 'Missing step';
  }, [editorState.step]);

  return (
    <GlobalSettingsProvider>
      <SaveContextProvider>
        <MessageContextProvider>
          <div className="font-[family-name:var(--font-dm-sans)]">
            <main className="h-screen max-h-screen">
              <EmailMenuWrapper />
              <ScrollArea className=" h-full max-h-screen w-full" type='hover'>
                {currentHelper}
              </ScrollArea>
            </main>
          </div>
        </MessageContextProvider>
      </SaveContextProvider>
    </GlobalSettingsProvider >

  );
}
