"use client";

import { EditorContext } from "@/domain/schema";
import { Flex } from "@mantine/core";
import { useContext } from "react";
import { RequireValues } from "../components/require";
import { parseVariableName } from "@/domain/parse/parse";
import { CampaignPublisher } from "./campaignPublisher";
import { AutomationPublisher } from "./automationPublisher";


export function EmailPublisher() {
    const [editorState, setEditorState] = useContext(EditorContext);
    const sendType = parseVariableName(editorState.email?.values?.resolveValue('Send Type'));


    return (
        <Flex align="center" justify="center" direction='row' className=" h-full  p-20" gap={20}>
            <RequireValues requiredValues={['Send Type']} />
            {
                sendType === 'campaign' ?
                    <CampaignPublisher />
                    : null
            }
            {
                sendType === 'automation' ?
                    <AutomationPublisher />
                    : null
            }

        </Flex>
    );
}