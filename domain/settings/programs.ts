
// bannerPath - path to the banner images
// bannerFilename - filename of the banner image in the bannerPath

import { getSettingsForTags } from "./settings-parser";

export const PROGRAM_DEFAULTS = {
    getSettingsForTags: (tags: string[]) => {
        return getSettingsForTags(PROGRAM_DEFAULTS, tags);
    },
    settings: {

    },
    'TUXS': {
        settings: {
            'bannerPath': '/tuxs-banners'
        },
        // DST override
        'EDT': {
            settings: {
                'bannerPath': '/tuxs-banners-edt'
            },
        },
        // Email type settings
        'Upcoming Topics': {
            settings: {
                'bannerFilename': 'upcomingtopics.png'
            }
        },
        'Today': {
            settings: {
                add: {
                    'bannerPath': '/today'
                }
            }

        },
        'Recording': {
            settings: {
                add: {
                    'bannerPath': '/recording'
                }
            }

        },
        'New Topic': {
            settings: {
                add: {
                    'bannerPath': '/new-topic'
                }
            }
        },
        // Topic settings
        'Job Search': {
            settings: {
                'bannerFilename': 'jobsearch.png'
            }
        },
        'Metrics': {
            settings: {
                'bannerFilename': 'metrics.png'
            }
        },
        'Research': {
            settings: {
                'bannerFilename': 'research.png'
            }
        },
        'Win Influence': {
            settings: {
                'bannerFilename': 'wininfluence.png'
            }
        },
    }
};