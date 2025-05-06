"use client";

import { ContentHelper } from "./helpers/emailEditing/contentFill";
import { useState, createContext, useMemo, SetStateAction, Dispatch, useContext } from "react";
import { EmailCreator } from "./helpers/emailCreation/emailCreator";
import { ValueReview } from "./helpers/valueReview";
import { TemplateFill } from "./helpers/emailEditing/templateFill";
import { EmailSelector } from "./helpers/emailCreation/emailSelector";
import { EmailPublisher } from "./helpers/emailPublishing/emailPublisher";
import { SaveContextProvider } from "./helpers/contexts/saveContext";
import { Box, Flex, Loader, ScrollArea } from "@mantine/core";
import { EmailMenuWrapper } from "./helpers/emailMenu";
import { GlobalSettingsProvider } from "./helpers/contexts/settingsContext";
import { MessageContextProvider } from "./helpers/contexts/messageContext";
import { EditorStateProvider } from "./helpers/contexts/editorContext";
import { EditorContext } from "@/domain/schema/context";


export default function Home() {
  const [editorState, setEditorState, isLoading] = useContext(EditorContext);

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

                <Flex pos="absolute" top={0} left={0} right={0} bottom={0} bg='white' justify="center" align="center" className=" transition-opacity z-10 pointer-events-none" opacity={isLoading ? 0.99 : 0} >
                  <Loader size="xl" type='bars' />
                </Flex>

                {currentHelper}
              </ScrollArea>
            </main>
          </div>
        </MessageContextProvider>
      </SaveContextProvider>
    </GlobalSettingsProvider >

  );
}
