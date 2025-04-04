
export type VariableType = 'Date' | 'Banner' | 'Image' | 'Link';
export type VariableSettings = { [type in VariableType]: { keywords: string[] } };
export const VARIABLE_TYPES: VariableSettings = {
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