"use client";

import { EditorContext } from "@/domain/context";
import { Flex, Loader, ScrollArea } from "@mantine/core";
import { useContext, useMemo } from "react";
import { EmailMenuWrapper } from "./components/email/save-list";
import { MessageContextProvider } from "./context/modal-context";
import { SaveContextProvider } from "./context/save-context";
import { TemplateFill } from "./screens/emails/fill/fill-html";
import { EmailPublisher } from "./screens/emails/publish/publish";
import { ValueReview } from "./screens/emails/review/value-review";
import { EmailSchedule } from "./screens/emails/select/selector-schedule";


export default function Home() {
  const [editorState, setEditorState, isLoading] = useContext(EditorContext);

  const currentHelper = useMemo(() => {
    const steps = [(<EmailSchedule></EmailSchedule>), (<ValueReview></ValueReview>), (<TemplateFill></TemplateFill>), (<EmailPublisher></EmailPublisher>), (<EmailPublisher></EmailPublisher>)];
    return steps[editorState.step] || 'Missing step';
  }, [editorState.step]);

  return (
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

  );
}
