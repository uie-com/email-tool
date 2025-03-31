import Quill, { Delta } from "quill";
import { PROGRAM_VALUES } from "./settings/emails";

export type EditorState = {
    email?: Email;
    step: number;
}

export type EmailVariable = {
    name: string;
    written: string;
    writtenName: string;
    transforms: string[];
    type: string;
    dependencies: EmailVariable[];
    startIndex: number;
};

export type ValueDict = {
    [key: string]: {
        value: String | Number | Date | null;
        // uses?: EmailVariable[];
    }
};

export type SettingValue = {
    value: string;
    part?: number;
};

export type TestSettingValue = {
    value: string[];
    part?: number;
};

export type FormSchema = {
    [key: string]: {
        options: string[];
        default?: string;
    };
};

export class Email {
    identifiers?: string[]; // Tags that are used to identify the email
    settings?: ValueDict; // Setting values, based on tags, that are used to fill the email
    values?: ValueDict; // Values, from user, that are used to fill the email
    content?: {
        sourceRichText: Delta;
        sourcePlainText: string;
        filledRichText: Delta;
        filledPlainText: string;
    };
}