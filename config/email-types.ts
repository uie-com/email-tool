

// This defines what types of emails are available to create.
// For each object, 'options' will generate the form fields for the email creator.
// For each object, 'defaults' will generate the default values for the option.
// For options that show up based on other options, put them inside the object for the option they depend on.

export const MULTI_SELECT_MANUAL_EMAIL_PARAMS = ['Send To'];

export const EMAIL_TYPES: Settings<string[]> = <const>{
    options: {
        'Program': ['TUXS', 'Metrics', 'Research', 'Win', 'Stand Out', 'Visions', 'AI', 'LoA', 'Other'],
    },
    'TUXS': {
        options: {
            'Email Type': ['Upcoming Topics', 'Today', 'Recording', 'New Topic'],
        },
        'Today': {
            options: {
                // 'Session Date': [],
            },
        },
        'Recording': {
            options: {
                // 'Session Date': [],
            },
        },
        'New Topic': {
            options: {
                // 'Session Date': [],
            },
        },
        'Upcoming Topics': {
            options: {
                // 'First Session Date': [],
                // 'Second Session Date': [],
                // 'Third Session Date': [],
            },
        },
    },
    'AI': {
        options: {
            'Email Type': ['Lightning Talk', 'Vessel', 'Content'],
        },
        'Vessel': {
            options: {
                'Send To': ['LoA', 'BL', 'N2LoA', 'Maven'],
            },
        },
        'Content': {
            options: {
                'Send To': ['LoA', 'BL', 'Maven'],
            },
        },
    },
    'LoA': {
        options: {
            'Email Type': ['Content', 'Vessel'],
        },
        'Vessel': {
            options: {
                'Send To': ['LoA', 'BL', 'Maven'],
            },
        },
        'Content': {
            options: {
                'Send To': ['LoA', 'BL', 'Maven'],
            },
        },
    },
    'Other': {
        options: {
            'Email Type': ['Content', 'Vessel', 'Message'],
            'Footer Reason': [],
            'Footer Tag': [],
        },
    },
    'Metrics': {
        options: {
            'Email Type': ['Today\'s Session', 'Before Week', 'Vessel', 'Content', 'Receipt', 'Confirmation', 'Message'],
        },
        'Today\'s Session': {
            options: {
                'Cohort': generateNumberedOptions('Cohort', 12),
                'Topic': generateNumberedOptions('Topic', 8),
            }
        },
        'Before Week': {
            options: {
                'Cohort': generateNumberedOptions('Cohort', 12),
                'Week': generateNumberedOptions('Week', 4),
                'First Topic': generateNumberedOptions('Topic', 8),
                'Second Topic': generateNumberedOptions('Topic', 8),
            },
            ...generateWeeklyDefaultTopics(),
        },
        'Vessel': {
            options: {
                'Send To': ['LoA', 'BL'],
            },
        },
        'Content': {
            options: {
                'Send To': ['LoA', 'BL'],
            },
        },
        'Receipt': {
            options: {
                'Cohort': generateNumberedOptions('Cohort', 12),
                'Price Type': ['Unemployed', 'Individual', 'Team'],
            },
        },
        'Confirmation': {
            options: {
                'Cohort': generateNumberedOptions('Cohort', 12),
            },
        },
        'Message': {
            options: {
                'Cohort': generateNumberedOptions('Cohort', 12),
            },
        }
    },
    'Research': {
        options: {
            'Email Type': ['Today\'s Session', 'Before Week', 'Vessel', 'Content', 'Receipt', 'Confirmation', 'Message'],
        },
        'Today\'s Session': {
            options: {
                'Cohort': generateNumberedOptions('Cohort'),
                'Topic': generateNumberedOptions('Topic', 8),
            }
        },
        'Before Week': {
            options: {
                'Cohort': generateNumberedOptions('Cohort'),
                'Week': generateNumberedOptions('Week', 4),
                'First Topic': generateNumberedOptions('Topic', 8),
                'Second Topic': generateNumberedOptions('Topic', 8),
            },
            ...generateWeeklyDefaultTopics(),
        },
        'Vessel': {
            options: {
                'Send To': ['LoA', 'BL'],
            },
        },
        'Content': {
            options: {
                'Send To': ['LoA', 'BL'],
            },
        },
        'Receipt': {
            options: {
                'Cohort': generateNumberedOptions('Cohort', 12),

                'Price Type': ['Unemployed', 'Individual', 'Team'],
            },
        },
        'Confirmation': {
            options: {
                'Cohort': generateNumberedOptions('Cohort', 12),
            },
        },
        'Message': {
            options: {
                'Cohort': generateNumberedOptions('Cohort', 12),
            },
        }
    },
    'Visions': {
        options: {
            'Email Type': ['Today\'s Session', 'Before Week', 'Vessel', 'Content', 'Receipt', 'Confirmation', 'Message'],
        },
        'Today\'s Session': {
            options: {
                'Cohort': generateNumberedOptions('Cohort'),
                'Topic': generateNumberedOptions('Topic', 8),
            }
        },
        'Before Week': {
            options: {
                'Cohort': generateNumberedOptions('Cohort'),
                'Week': generateNumberedOptions('Week', 4),
                'First Topic': generateNumberedOptions('Topic', 8),
                'Second Topic': generateNumberedOptions('Topic', 8),
            },
            ...generateWeeklyDefaultTopics(),
        },
        'Vessel': {
            options: {
                'Send To': ['LoA', 'BL'],
            },
        },
        'Content': {
            options: {
                'Send To': ['LoA', 'BL'],
            },
        },
        'Receipt': {
            options: {
                'Cohort': generateNumberedOptions('Cohort', 12),

                'Price Type': ['Unemployed', 'Individual', 'Team'],
            },
        },
        'Confirmation': {
            options: {
                'Cohort': generateNumberedOptions('Cohort', 12),
            },
        },
        'Message': {
            options: {
                'Cohort': generateNumberedOptions('Cohort', 12),
            },
        }
    },
    'Win': {
        options: {
            'Email Type': ['Homework', 'Vessel', 'Content', 'Receipt', 'Confirmation', 'Message'],
        },
        'Homework': {
            options: {
                'Cohort': generateMonthOptions(),
                'Pillar': generateNumberedOptions('Pillar', 8),
                'Level': generateNumberedOptions('Level', 2),
            },
        },
        'Vessel': {
            options: {
                'Send To': ['LoA', 'BL'],
            },
        },
        'Content': {
            options: {
                'Send To': ['LoA', 'BL'],
            },
        },
        'Receipt': {
            options: {
                'Cohort': generateMonthOptions(),
                'Price Type': ['Unemployed', 'Individual', 'Team'],
            },
        },
        'Confirmation': {
            options: {
                'Cohort': generateMonthOptions(),
            },
        },
        'Message': {
            options: {
                'Cohort': generateMonthOptions(),
            },
        }
    },
    'Stand Out': {
        options: {
            'Email Type': ['Today\'s Session', 'Events of the Week', 'Message'],
        },
        'Today\'s Session': {
            options: {
                'Session Type': ['Friday Session', 'Materials Critique'],
            }
        },
        'Events of the Week': {
        }
    },
}

function generateNumberedOptions(prefix: string = '', limit: number = 12) {
    let options = [];
    for (let i = 1; i <= limit; i++) {
        options.push(prefix + (prefix.length > 0 ? ' ' : '') + i);
    }
    return options;
}

function generateWeeklyDefaultTopics(limit: number = 6) {
    let weeks: {
        [key: string]: {
            defaults: { [key: string]: string }
        }
    } = {};
    for (let i = 1; i <= limit; i++) {
        weeks['Week ' + i] = {
            defaults: {
                'First Topic': 'Topic ' + (i * 2 - 1),
                'Second Topic': 'Topic ' + (i * 2),
            }
        };
    }
    return weeks;
}

import moment from "moment";
import { Settings } from "../domain/schema";
function generateMonthOptions() {
    let options = [], currentYear = moment().year();
    for (let year = currentYear - 2; year < currentYear + 1; year++) {
        for (let month = 0; month < 12; month++) {
            options.push(moment().month(month).year(year).format('MMMM yyyy'));
        }
    }
    return options;
}