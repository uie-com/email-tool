"use client";

import { EmailViewCard } from "@/app/components/email/metadata-card";
import { CreateTemplate } from "@/app/components/remote/active-campaign/templates/create-template";
import { RenderTemplate } from "@/app/components/remote/active-campaign/templates/render-template";
import { SchedulePostmark } from "@/app/components/remote/airtable/schedule-postmark";
import { SendReview } from "@/app/components/remote/slack/send-review";
import { HadIssue } from "@/app/components/remote/step-template";
import { MarkComplete } from "@/app/components/remote/utility/mark-complete";
import { MarkReviewed } from "@/app/components/remote/utility/mark-reviewed";
import { RequireValues } from "@/app/components/variables/require-values";
import { EditorContext } from "@/domain/context";
import { saveScheduleOpen } from "@/domain/email/save/saveData";
import { Button, Flex } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { useContext, useState } from "react";
import { AuthStatus } from "./publish";

export function PostmarkPublisher() {
    const [editorState, setEditorState] = useContext(EditorContext);
    const [hadIssue, setHadIssue] = useState(false);

    const handleOpenSchedule = () => {
        saveScheduleOpen();
        setEditorState({
            step: 0
        })
    }

    return (
        <HadIssue.Provider value={[hadIssue, setHadIssue]}>
            <RequireValues key={'rvc'} requiredValues={['Send Date', 'Email Name', 'Template Name', 'Automation ID', 'Subject', 'From Name', 'From Email', 'Reply To']} />
            <EmailViewCard />
            <AuthStatus />
            <CreateTemplate shouldAutoStart={false} />
            <RenderTemplate shouldAutoStart={false} />

            <SchedulePostmark shouldAutoStart={true} />

            <MarkReviewed shouldAutoStart={false} />

            <SendReview parentShouldAutoStart={editorState.email?.hasSentReview ?? false} />
            <MarkComplete shouldAutoStart={false} />
            {
                editorState.email?.isSentOrScheduled ?
                    <Flex gap={10} direction="row" align="center" justify="end" w='100%' px='24' mt={6}>
                        <Button variant="filled" color="green" h={40} rightSection={<IconArrowRight strokeWidth={2} />} onClick={handleOpenSchedule} >Return to Schedule</Button>
                    </Flex>
                    : null
            }{
                editorState.email?.hasSentReview && !editorState.email?.isSentOrScheduled ?
                    <Flex gap={10} direction="row" align="center" justify="end" w='100%' px='24' mt={6}>
                        <Button variant="outline" color="blue" h={40} rightSection={<IconArrowRight strokeWidth={2} />} onClick={handleOpenSchedule} >Return to Schedule</Button>
                    </Flex>
                    : null
            }
        </HadIssue.Provider >
    );
}