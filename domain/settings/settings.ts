
import { getSettings } from "../parse/parseSettings";

// Has values for each tag/attribute of an email.
// These will be used to fill in variables in the email templates.

// Use the tags from above as keys for objects.
// Inside each object, create a settings dictionary with the name of each setting as the key,
// and a SettingValue object as the value.
// The SettingValue object should have a value attribute, which is the value of the setting.
// If the setting needs to be added together, add a part attribute with the part number.

// If a value is provided later on here, it will override the value with the same name before.
// However, if a value has a 'part' attribute, it will be added together with each part number; only overriding the part number specified.

export type SettingsDefinition = {
    [identifier: string]: SettingsDefinition | { [key: string]: SettingValue }
}

export type SettingValue = {
    value: string | Date | number;
    part?: number;
    fetch?: undefined | 'airtable';
};

export const SETTINGS: SettingsDefinition = {
    settings: { // Provide defaults for all emails here
        'Template': { value: './templates', part: 0 },
        'Banner': { value: './banners', part: 0 },
        'Base ID': { value: 'appHcZTzlfXAJpL7I' },

        'Airtable URL': { value: 'https://api.airtable.com/v0/{Base ID}' },
    },
    'TUXS': {
        settings: {
            'Banner': { value: '/tuxs', part: 1 },
            'Template': { value: '/tuxs', part: 1 },

            'Calendar Table ID': { value: 'tbl6T80hI7yrFsJWz' },
            'Session Title': { value: '{Airtable URL}/{Calendar Table ID}?filterByFormula=DATESTR(%7BDate%7D)="{Session Date (YYYY-MM-DD)}"&fields[]=Title', fetch: 'airtable' },
            'Preview': { value: '{Airtable URL}/{Calendar Table ID}?filterByFormula=DATESTR(%7BDate%7D)="{Session Date (YYYY-MM-DD)}"&fields[]=Preview', fetch: 'airtable' },
            'Session Description': { value: '{Airtable URL}/{Calendar Table ID}?filterByFormula=DATESTR(%7BDate%7D)="{Session Date (YYYY-MM-DD)}"&fields[]=Description', fetch: 'airtable' },
            'Session Type': { value: '{Airtable URL}/{Calendar Table ID}?filterByFormula=DATESTR(%7BDate%7D)="{Session Date (YYYY-MM-DD)}"&fields[]=Topic Type', fetch: 'airtable' },
        },
        // DST override
        'EDT': {
            settings: {
                'Banner': { value: '/tuxs-edt', part: 1 },
            },
        },
        // Email type settings
        'Upcoming Topics': {
            settings: {
                'Banner': { value: '/upcomingtopics.png', part: 3 },
                'Template': { value: '/upcoming-topics.html', part: 2 },
            }
        },
        'Today': {
            settings: {
                'Banner': { value: '/today', part: 2 },
                'Template': { value: '/today.html', part: 2 },
            }

        },
        'Recording': {
            settings: {
                'Banner': { value: '/recording', part: 2 },
                'Template': { value: '/recording.html', part: 2 },
            }

        },
        'New Topic': {
            settings: {
                'Banner': { value: '/new-topic', part: 2 },
                'Template': { value: '/new-topic.html', part: 2 },
            }
        },
        // Topic settings
        'Job Search': {
            settings: {
                'Banner': { value: '/jobsearch.png', part: 3 },
            }
        },
        'Metrics': {
            settings: {
                'Banner': { value: '/metrics.png', part: 3 },
            }
        },
        'Research': {
            settings: {
                'Banner': { value: '/research.png', part: 3 },
            }
        },
        'Win Influence': {
            settings: {
                'Banner': { value: '/wininfluence.png', part: 3 },
            }
        },
    }
};