
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

export const PROGRAM_VALUES = {
    getSettings: (tags?: string[]) => {
        return getSettings(PROGRAM_VALUES, tags);
    },
    settings: { // Provide defaults for all emails here
        'template': { value: '/templates', part: 0 },
        'banner': { value: '/banners', part: 0 },
    },
    'TUXS': {
        settings: {
            'banner': { value: '/tuxs', part: 1 },
            'template': { value: '/tuxs', part: 1 },
        },
        // DST override
        'EDT': {
            settings: {
                'banner': { value: '/tuxs-edt', part: 1 },
            },
        },
        // Email type settings
        'Upcoming Topics': {
            settings: {
                'banner': { value: '/upcomingtopics.png', part: 3 },
                'template': { value: '/upcoming-topics.html', part: 2 },
            }
        },
        'Today': {
            settings: {
                'banner': { value: '/today', part: 2 },
            }

        },
        'Recording': {
            settings: {
                'banner': { value: '/recording', part: 2 },
            }

        },
        'New Topic': {
            settings: {
                'banner': { value: '/new-topic', part: 2 },
            }
        },
        // Topic settings
        'Job Search': {
            settings: {
                'banner': { value: '/jobsearch.png', part: 3 },
            }
        },
        'Metrics': {
            settings: {
                'banner': { value: '/metrics.png', part: 3 },
            }
        },
        'Research': {
            settings: {
                'banner': { value: '/research.png', part: 3 },
            }
        },
        'Win Influence': {
            settings: {
                'banner': { value: '/wininfluence.png', part: 3 },
            }
        },
    }
};