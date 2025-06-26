"use server";
import { Email } from "../../schema";
import { createCampaignMessage, createEmptyCampaign, editMessage, getCampaign, getMessage, getTemplate, populateCampaign, postTemplate } from "./api";

const DEBUG = true;
export async function createTemplate(email: Email): Promise<any> {
    if (!email.values) return 'No email found.';
    if (!email.values.resolveValue("Subject")) {
        console.error("Subject is required and wasn't found.", email);
        return 'Subject is required and wasn\'t found.';
    }
    if (!email.HTML) {
        console.error("HTML is required and wasn't found.", email);
        return 'HTML is required and wasn\'t found.';
    }
    const emailName = email.values.resolveValue("Email Name");
    const emailHtml = email.HTML;

    if (DEBUG) console.log("Creating template " + emailName, emailHtml);
    const res = await postTemplate(emailName, emailHtml);
    console.log("Created template " + emailName, res);

    return res;
}


export async function createCampaign(email: Email, token: string): Promise<any> {
    if (!email.values) return 'No email found.';

    const name = email.values.resolveValue("Email Name");

    const postCampaignResponse = await createEmptyCampaign({
        name: name,
    });
    console.log("Created empty campaign", postCampaignResponse);

    const campaignID = postCampaignResponse['id'];

    const messageResponse = await createCampaignMessage(campaignID, {
        subject: 'Test Subject',
        fromEmail: 'jared.m.spool@centercentre.com',
        replyToEmail: 'jared.m.spool@centercentre.com',
        preHeader: 'Test preheader text',
        fromName: 'Jared Spool',
        editorVersion: 3,
    }, token);
    console.log("Created campaign message", messageResponse);

    const upgradedMessageResponse = await editMessage(messageResponse['id'], { editorVersion: "3", }, token);
    const messageID = upgradedMessageResponse['id'];
    console.log("Upgraded message", upgradedMessageResponse);

    const templateResponse = await createTemplate(email);
    const templateID = templateResponse['template']['id'];
    console.log("Created template", templateResponse, templateID);


    const res = await populateCampaign(campaignID + '', messageID + '', templateID, token);
    console.log("Populated campaign message", res);


    const usedTemplate = await getTemplate(templateID);
    const finalMessage = await getMessage(messageID);
    const finalCampaign = await getCampaign(campaignID);

    console.log("Final result: ", { usedTemplate, finalMessage, finalCampaign });

    return { usedTemplate, finalMessage, finalCampaign };
}

