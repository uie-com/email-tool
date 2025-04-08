import Quill, { Delta } from "quill";
import { SETTINGS } from "./settings/settings";
import { Values } from "./schema/valueCollection";

export type EditorState = {
    email?: Email;
    step: number;
}

export type FormSchema = {
    [key: string]: {
        options: string[];
        default?: string;
    };
};

export class Email {
    identifiers?: string[]; // Tags that are used to identify the email
    values?: Values;
    html?: string; // HTML content of the email
    content?: {
        sourceRichText: Delta;
        sourcePlainText: string;
        filledRichText: Delta;
        filledPlainText: string;
    };
}