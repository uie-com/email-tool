import Quill, { Delta } from "quill";

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
};

export type EmailVariableValues = {
    [key: string]: {
        value: String | Number | Date | null;
        // uses?: EmailVariable[];
    }
};

export type SettingValue = {
    value: string;
    part?: number;
};

export type FormSchema = {
    [key: string]: {
        options: string[];
        default?: string;
    };
};

export class Email {
    attributes?: string[];
    values?: EmailVariableValues;
    content?: {
        sourceRichText: Delta;
        sourcePlainText: string;
        filledRichText: Delta;
        filledPlainText: string;
    };
}