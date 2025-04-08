import { Settings } from "../schema/settingsCollection";

export type VariableType = 'Date' | 'Banner' | 'Image' | 'Link';
export const VARIABLE_TYPES: Settings<string[]> = {
    "Date": {
        keywords: ['day', 'date', 'time', 'month', 'year', 'timestamp']
    },
    "Banner": {
        keywords: ['banner', 'hero']
    },
    "Image": {
        keywords: ['image', 'picture', 'photo', 'graphic', 'illustration', 'icon', 'logo']
    },
    "Link": {
        keywords: ['link', 'url', 'href', 'anchor']
    }
};