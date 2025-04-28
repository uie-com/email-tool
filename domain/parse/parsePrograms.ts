import { Settings } from "../schema/settingsCollection";
import { EMAIL_TYPES } from "../settings/emails";
import { parseVariableName } from "./parse";

export type Form = {
    [key: string]: {
        options: string[];
        default?: string;
    }
};
export function createProgramForm(programValues: { [key: string]: string | Date }, programSchema: Settings<string[] | string> = EMAIL_TYPES) {
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
        } else if (typeof key === 'string' && Object.keys(programValues).find((valueKey) => parseVariableName(programValues[valueKey] as string).includes(parseVariableName(key))) !== undefined) {
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

export function getAllPossibleEmailTypes(programSchema: any = EMAIL_TYPES): { [label: string]: string[] } {
    let emailTypes: { [label: string]: string[] } = {};
    Object.keys(programSchema).forEach((key) => {
        if (key === 'options') {
            Object.keys(programSchema[key]).forEach((optionKey) => {
                emailTypes[optionKey] = programSchema[key][optionKey];
            });
        } else if (key != 'defaults') {
            const childEmailTypes = getAllPossibleEmailTypes(programSchema[key]);
            Object.keys(childEmailTypes).forEach((childKey) => {
                if (!emailTypes[childKey]) {
                    emailTypes[childKey] = childEmailTypes[childKey];
                } else {
                    emailTypes[childKey].push(...childEmailTypes[childKey]);
                }
            });
        }
    });
    return emailTypes;
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

export function shortenIdentifier(id: string) {
    return id
        .replaceAll('Events of Week', 'EOW')
        .replaceAll('Pillar ', 'P')
        .replaceAll('Cohort ', 'C')
        .replaceAll('Topic ', 'T')
        .replaceAll('Live Lab ', 'L')
        .replaceAll('Lab ', 'L')
        .replaceAll('Level ', 'L')
        .replaceAll('Before Week ', 'BW')
        .replaceAll('Session ', 'S')
        .replaceAll('Week ', 'W')
}