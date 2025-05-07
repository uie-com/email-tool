
import moment from "moment-timezone";
import { initializeSettings } from "./parse/parseSettings";
import { Values } from "./schema/valueCollection";
import { Variables } from "./schema/variableCollection";
import { IconBrandTelegram, IconCalendarCheck, IconEdit, IconFileText, IconMailCheck, IconMessageQuestion } from "@tabler/icons-react";
import { MessageType } from "@/app/helpers/contexts/messageContext";

export type GlobalSettings = {
    activeCampaignToken?: string;
    googleCode?: string;

    googleAccessToken?: string;
    googleRefreshToken?: string;
    googleRefreshTime?: number;

    colorScheme?: 'light' | 'dark';

}

export type ShowMessage = (messageType: MessageType, options: any) => void;

export type EditorState = {
    email?: Email;
    step: number;
}


export type Saves = EditorState[];

export class Email {
    airtableId?: string; // Airtable ID once uploaded
    name?: string; // unique name of the email

    values?: Values;

    template?: string; // Current template file path
    templateHTML?: string; // Original template html
    HTML?: string; // Final HTML content of the email

    templateId?: string; // Template ID in Active Campaign
    messageId?: string; // Message ID in Active Campaign 
    // (Messages are an internal Active Campaign object that hold email content for campaigns)
    campaignId?: string; // Campaign ID in Active Campaign

    referenceDocURL?: string;
    notionURL?: string; // URL of the Notion card
    notionId?: string; // ID of the Notion card

    sentTest?: string; // Whether the test email has been sent
    hasRendered?: string; // Whether the template in Active Campaign has been rendered by Save + Exiting
    hasPostmarkAction?: string; // Whether the email has been sent to Postmark
    hasWaitAction?: boolean; // Whether the email has a wait action
    hasSentReview?: boolean; // Whether the email has a pending review ticket
    isDevReviewed?: boolean; // Whether the email has been reviewed
    isReviewed?: boolean; // Whether the email has been reviewed
    isSentOrScheduled?: string; // Whether the email template has been marked done

    constructor(values?: Values, email?: Email) {
        Object.assign(this, email);

        if (values)
            this.values = initializeSettings(values);
        else if (email)
            this.values = new Values(email.values?.initialValues ?? []);

        if (!this.values)
            this.values = new Values();

        if (!this.name)
            this.name = this.values.resolveValue('Email ID', true);
    }
}

export type EmailStatus = 'Editing' | 'Uploaded' | 'Review' | 'Ready' | 'Scheduled' | 'Sent';
export function getStatusFromEmail(email?: Email): EmailStatus | undefined {
    if (!email) return undefined;
    if (email.isSentOrScheduled)
        return moment(email.values?.resolveValue('Send Date', true)).isBefore(moment()) ? 'Sent' : 'Scheduled';

    if (!email.templateId) return 'Editing';
    if (!email.sentTest) return 'Uploaded';
    if (!email.isReviewed) return 'Review';
    if (!email.isSentOrScheduled) return 'Ready';
}

export const STATUS_MESSAGES = {
    Editing: 'Editing',
    Uploaded: 'Uploaded to Active Campaign',
    Review: 'Under Review',
    Ready: 'Ready to Send',
    Scheduled: 'Scheduled',
    Sent: 'Sent',
};
export const STATUS_COLORS = {
    Editing: [(<IconEdit size={18} strokeWidth={2.5} color='#e8580c' />), 'yellow.3', '#e8580c'],
    Uploaded: [(<IconFileText size={18} strokeWidth={2.5} color='#1864ab' />), 'blue.1', '#1864ab'],
    Review: [<IconMessageQuestion size={18} strokeWidth={2.5} color='#862e9c' />, 'violet.1', '#862e9c'],
    Ready: [<IconBrandTelegram size={18} strokeWidth={2.5} color='#1864ab' />, 'blue.1', '#1864ab'],
    Scheduled: [<IconCalendarCheck size={18} strokeWidth={2.5} color='#2b8a3e' />, 'green.2', '#2b8a3e'],
    Sent: [<IconMailCheck size={18} strokeWidth={2.5} color='#2b8a3e' />, 'green.2', '#2b8a3e'],
};


