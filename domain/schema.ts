type EmailVariable = {
    name: string;
    written: string;
    type: string;
    value: String | Number | Date | null;
    id: string;
    occurs: number;
};

export type EmailVariables = { [key: string]: EmailVariable };


export class Email {
    sourcePlainText?: string;
    renderedPlainText?: string;
    renderedRichText?: string;
}