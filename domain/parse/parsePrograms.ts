import { FormSchema, ValueDict } from "../schema";
import { parseVariableName } from "./parseVariables";


export function createProgramForm(programSchema: any, programValues: { [key: string]: string }) {
    let form: FormSchema = {};
    Object.keys(programSchema).forEach((key) => {

        if (key === 'options') {
            Object.keys(programSchema[key]).forEach((optionKey) => {
                form[optionKey] = { options: programSchema[key][optionKey] };
            });
        } else if (key === 'defaults') {
            Object.keys(programSchema[key]).forEach((defaultKey) => {
                form[defaultKey] = { ...form[defaultKey], default: programSchema[key][defaultKey] };
            });
        } else if (Object.keys(programValues).find((valueKey) => parseVariableName(programValues[valueKey]).includes(parseVariableName(key))) !== undefined) {
            const childForm = createProgramForm(programSchema[key], programValues);
            Object.keys(childForm).forEach((childKey) => {
                if (form[childKey])
                    childForm[childKey] = { ...form[childKey], ...childForm[childKey] };
            });
            form = { ...form, ...childForm };
        }
    });

    return form;
}

export function parseValuesFromForm(programValues: { [key: string]: string }): ValueDict {
    let values: ValueDict = {};
    Object.keys(programValues).forEach((key) => {
        const parsedKey = key;
        values[parsedKey] = { value: programValues[key] };
    });
    return values;
}

export function createIdentifiersFromForm(programValues: { [key: string]: string }) {
    let tags: string[] = [];
    Object.keys(programValues).forEach((key) => {
        tags.push(`${programValues[key]}`);
    });
    return tags;
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