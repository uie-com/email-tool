
import moment from "moment-timezone";
import { initializeSettings } from "./parse/parseSettings";
import { Values } from "./schema/valueCollection";
import { Variables } from "./schema/variableCollection";
import { Dispatch, SetStateAction, createContext } from "react";
import { IconBrandTelegram, IconCalendarCheck, IconEdit, IconMailCheck, IconMessageQuestion } from "@tabler/icons-react";


export const EditorContext = createContext<[EditorState, Dispatch<SetStateAction<EditorState>>]>([{ step: 0 }, () => { }]);


export type EditorState = {
    email?: Email;
    step: number;
}

export type EmailStates = {
    [id: string]: EditorState;
}

export class Email {
    airtableId?: string; // Airtable ID once uploaded
    id?: string; // unique name of the email

    values?: Values;

    template?: string; // Current template file path
    templateHTML?: string; // Original template html
    HTML?: string; // Final HTML content of the email

    templateId?: string; // Template ID in Active Campaign
    messageId?: string; // Message ID in Active Campaign 
    // (Messages are an internal Active Campaign object that hold email content for campaigns)
    campaignId?: string; // Campaign ID in Active Campaign

    sentTest?: boolean; // Whether the test email has been sent
    reviewed?: boolean; // Whether the email has been reviewed
    done?: boolean; // Whether the email has been marked done

    constructor(values: Values) {
        this.values = initializeSettings(values);
        this.id = this.values.resolveValue('Email ID', true);
    }
}

export type EmailStatus = 'Editing' | 'Review' | 'Ready' | 'Scheduled' | 'Sent';
export function getStateFromEmail(email?: Email): EmailStatus | undefined {
    if (!email) return undefined;
    if (!email.sentTest) return 'Editing';
    if (!email.reviewed) return 'Review';
    if (!email.done) return 'Ready';
    const isPast = moment(email.values?.resolveValue('Send Date', true)).isBefore(moment());
    if (isPast) return 'Sent';
    return 'Scheduled';
}
export const STATUS_COLORS = {
    Editing: [(<IconEdit size={18} strokeWidth={2.5} color='#e77600' />), 'yellow.3', '#e77600'],
    Review: [<IconMessageQuestion size={18} strokeWidth={2.5} color='#a61f4d' />, 'red.2', '#a61f4d'],
    Ready: [<IconBrandTelegram size={18} strokeWidth={2.5} color='#1864ab' />, 'blue.1', '#1864ab'],
    Scheduled: [<IconCalendarCheck size={18} strokeWidth={2.5} color='#2b8a3e' />, 'green.2', '#2b8a3e'],
    Sent: [<IconMailCheck size={18} strokeWidth={2.5} color='#2b8a3e' />, 'green.2', '#2b8a3e'],
};