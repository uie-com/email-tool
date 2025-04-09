import { Settings } from "../schema/settingsCollection";
import { EMAIL_TYPES } from "../settings/emails";
import { parseVariableName } from "./parse";

export type Form = {
    [key: string]: {
        options: string[];
        default?: string;
    }
};
export function createProgramForm(programValues: { [key: string]: string }, programSchema: Settings<string[] | string> = EMAIL_TYPES) {
    let form: Form = {};
    Object.keys(programSchema).forEach((key) => {

        if (key === 'options') {
            Object.keys(programSchema[key]).forEach((optionKey) => {
                form[optionKey] = { options: programSchema[key][optionKey] as string[] };
            });
        } else if (key === 'defaults') {
            Object.keys(programSchema[key]).forEach((defaultKey) => {
                form[defaultKey] = { ...form[defaultKey], default: programSchema[key][defaultKey] as string };
            });
        } else if (Object.keys(programValues).find((valueKey) => parseVariableName(programValues[valueKey]).includes(parseVariableName(key))) !== undefined) {
            const childForm = createProgramForm(programValues, programSchema[key] as Settings<string[] | string>);
            Object.keys(childForm).forEach((childKey) => {
                if (form[childKey])
                    childForm[childKey] = { ...(form[childKey]), ...(childForm[childKey]) };
            });
            form = { ...form, ...childForm };
        }
    });

    return form;
}


export function getAllIdentifiers(programSchema: any): string[] {
    let identifiers: string[] = [];
    Object.keys(programSchema).forEach((key) => {
        if (key === 'options') {
            Object.keys(programSchema[key]).forEach((optionKey) => {
                identifiers.push(...programSchema[key][optionKey]);
            });
        } else if (key != 'defaults') {
            const childIdentifiers = getAllIdentifiers(programSchema[key]);
            childIdentifiers.forEach((childIdentifier) => {
                if (!identifiers.includes(childIdentifier)) {
                    identifiers.push(childIdentifier);
                }
            });
        }
    });
    return identifiers;
}