import Quill, { Delta } from "quill";

export type EmailVariable = {
    name: string;
    written: string[];
    writtenName: string;
    type: string;
    value: String | Number | Date | null;
    id: string;
    occurs: number;
    dependsOn: string[];
};

export type EmailVariables = { [key: string]: EmailVariable };

export type SettingValue = {
    value: string;
    part: number;
};


export class Email {
    sourceRichText?: Delta;
    renderedRichText?: Delta;
}