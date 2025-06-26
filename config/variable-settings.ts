import { Settings } from "../domain/schema";

export type VariableType = keyof typeof VARIABLE_TYPES;
export const VARIABLE_TYPES: Settings<string[]> = {
    "Date": {
        keywords: ['date', 'time', 'month', 'year', 'timestamp']
    },
    "Banner": {
        keywords: ['banner', 'hero']
    },
    "Image": {
        keywords: ['image', 'picture', 'photo', 'graphic', 'illustration', 'icon', 'logo']
    },
    "Link": {
        keywords: [' link', ' url', 'href', 'anchor']
    }
};


export const VARIABLE_OVERRIDES: { [key: string]: string } = {
    'Time': 'Date', // Since date objects contain time, 'Time' variables to point to their date equivalents. 'Session Time' -> 'Session Date'
}