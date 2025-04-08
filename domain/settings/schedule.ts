

// This dictionary gives 'emails' per session, based on the session identifiers
// Can reference session identifiers from airtable: Program, Topic, Session Type, and Session Date as selectors and as variables
// Can also reference global identifiers: Odd/Even Week, Day of Week, and DST

import { Settings } from "../schema/settingsCollection";


// Emails of the same emailType will override earlier emails of that type
export const SESSION_BASE = 'appHcZTzlfXAJpL7I';
export const SESSION_TABLE = 'tblnfXd0SIViOkj6z';

export const MIN_DAYS_IN_BREAK = 9;

export const EMAIL_SCHEDULE: Settings<string> = {
    'TUXS': {
        emails: {
            'New Topic': {
                'Send Date': '{Session Date(-5d)}',
            },
            'Today': {
                'Send Date': '{Session Date}',
            },
            'Recording': {
                'Send Date': '{Session Date(+1d)}',
            },
        },
        'Odd Week': {
            emails: {
                'Upcoming Topics': {
                    'Send Date': '{Session Date(+6d)}',
                },
            },
        },
    }
}