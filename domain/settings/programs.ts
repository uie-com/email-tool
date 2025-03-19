


import { SettingValue } from "../schema";
import { getSettingsForTags } from "./settingsParser";

export const PROGRAM_DEFAULTS = {
    getSettingsForTags: (tags: string[]) => {
        return getSettingsForTags(PROGRAM_DEFAULTS, tags);
    },
    settings: {

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