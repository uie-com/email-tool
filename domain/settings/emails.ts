
import { getSettingsForTags } from "../parse/parseSettings";

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
    getSettingsForTags: (tags: string[]) => {
        return getSettingsForTags(PROGRAM_VALUES, tags);
    },
    settings: { // Provide defaults for all emails here

    },
    'TUXS': {
        settings: {
            'banner': { value: '/tuxs-banners', part: 0 },
        },
        // DST override
        'EDT': {
            settings: {
                'banner': { value: '/tuxs-banners-edt', part: 0 },
            },
        },
        // Email type settings
        'Upcoming Topics': {
            settings: {
                'banner': { value: '/upcomingtopics.png', part: 2 },
            }
        },
        'Today': {
            settings: {
                'banner': { value: '/today', part: 1 },
            }

        },
        'Recording': {
            settings: {
                'banner': { value: '/recording', part: 1 },
            }

        },
        'New Topic': {
            settings: {
                'banner': { value: '/new-topic', part: 1 },
            }
        },
        // Topic settings
        'Job Search': {
            settings: {
                'banner': { value: '/jobsearch.png', part: 2 },
            }
        },
        'Metrics': {
            settings: {
                'banner': { value: '/metrics.png', part: 2 },
            }
        },
        'Research': {
            settings: {
                'banner': { value: '/research.png', part: 2 },
            }
        },
        'Win Influence': {
            settings: {
                'banner': { value: '/wininfluence.png', part: 2 },
            }
        },
    }
};