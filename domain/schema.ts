
import { initializeSettings } from "./parse/parseSettings";
import { Values } from "./schema/valueCollection";

export type EditorState = {
    email?: Email;
    step: number;
}

export class Email {
    values: Values;
    html?: string; // HTML content of the email

    constructor(values: Values) {
        this.values = initializeSettings(values);
    }
}