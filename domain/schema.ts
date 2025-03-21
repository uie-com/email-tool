import Quill, { Delta } from "quill";

export type EmailVariable = {
    name: string;
    written: string;
    writtenName: string;
    transforms: string[];
    type: string;
    dependsOn: (EmailVariable)[];
};

export type EmailVariableValues = { [key: string]: String | Number | Date | null };


export type SettingValue = {
    value: string;
    part: number;
};


export class Email {
    sourceRichText?: Delta;
    renderedRichText?: Delta;
}