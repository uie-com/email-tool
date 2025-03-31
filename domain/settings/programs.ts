

// This defines what types of emails are available to create.
// For each object, 'options' will generate the form fields for the email creator.
// For each object, 'defaults' will generate the default values for the option.
// For options that show up based on other options, put them inside the object for the option they depend on.
export const PROGRAM_SCHEMA = {
    options: {
        'Program': ['TUXS', 'Metrics', 'Research', 'Win', 'Stand Out', 'Visions']
    },
    'TUXS': {
        options: {
            'Email Type': ['Upcoming Topics', 'Today', 'Recording', 'New Topic'],
            'Topic': ['Job Search', 'Metrics', 'Research', 'Win Influence']
        },
    },
    'Metrics': {
        options: {
            'Email Type': ['Today\'s Topic', 'Before Week', 'Vessel', 'Content'],
        },
        'Today\'s Topic': {
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
    },
    'Research': {
        options: {
            'Email Type': ['Today\'s Topic', 'Before Week', 'Vessel', 'Content'],
        },
        'Today\'s Topic': {
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
    },
    'Visions': {
        options: {
            'Email Type': ['Today\'s Topic', 'Before Week', 'Vessel', 'Content'],
        },
        'Today\'s Topic': {
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
    },
    'Win': {
        options: {
            'Email Type': ['Homework', 'Vessel'],
        },
        'Homework': {
            options: {
                'Cohort': generateMonthOptions(),
                'Pillar': generateNumberedOptions('Pillar', 8),
                'Level': generateNumberedOptions('Level', 2),
            },
        }
    },
    'Stand Out': {
        options: {
            'Email Type': ['Today\'s Session', 'Events of the Week'],
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
function generateMonthOptions() {
    let options = [], currentYear = moment().year();
    for (let year = currentYear - 2; year < currentYear + 1; year++) {
        for (let month = 0; month < 12; month++) {
            options.push(moment().month(month).year(year).format('MMMM yyyy'));
        }
    }
    return options;
}

