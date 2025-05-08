import { Dispatch } from "react";
import { EditorState, Email } from "../schema";
import { updateNotionCard } from "./notionActions";
import { markEmailSentInSlack, markEmailUnsentInSlack } from "./slackActions";


export async function markEmailDone(editorState?: EditorState) {
    if (!editorState?.email) {
        console.log("No email to mark as done");
        return;
    }

    const slackRes = await markEmailSentInSlack(editorState.email?.values?.resolveValue('Email ID', true));

    if (!slackRes.success) {
        console.log("Error marking email sent in slack", slackRes.error);
    }
    console.log("Marked email sent in slack", slackRes);

    const notionRes = await updateNotionCard(editorState.email?.notionId ?? '', editorState.email?.referenceDocURL ?? '', true);
    if (!notionRes.success) {
        console.log("Error marking email sent in notion", notionRes.error);
    }
    console.log("Marked email sent in notion", notionRes);
}

export async function markEmailIncomplete(editorState?: EditorState) {
    if (!editorState?.email) {
        console.log("No email to mark as incomplete");
        return;
    }

    const slackRes = await markEmailUnsentInSlack(editorState.email?.values?.resolveValue('Email ID', true));

    if (!slackRes.success) {
        console.log("Error marking email unsent in slack", slackRes.error);
    }
    console.log("Marked email unsent in slack", slackRes);

    const notionRes = await updateNotionCard(editorState.email?.notionId ?? '', editorState.email?.referenceDocURL ?? '', false);
    if (!notionRes.success) {
        console.log("Error marking email unsent in notion", notionRes.error);
    }
    console.log("Marked email unsent in notion", notionRes);
}