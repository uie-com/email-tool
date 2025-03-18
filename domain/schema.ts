export type EmailVariable = {
    name: string;
    written: string;
    writtenName: string;
    type: string;
    value: String | Number | Date | null;
    id: string;
    occurs: number;
    dependsOn: string[];
};

export type EmailVariables = { [key: string]: EmailVariable };


export class Email {
    sourcePlainText?: string;
    renderedPlainText?: string;
    renderedRichText?: string;
}