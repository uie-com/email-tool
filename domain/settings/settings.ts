
import { initializeSettings } from "../parse/parseSettings";
import { Settings } from "../schema/settingsCollection";
import { ValuePart, ValueSource } from "../schema/valueCollection";

// Has values for each tag/attribute of an email.
// These will be used to fill in variables in the email templates.

// Use the tags from above as keys for objects.
// Inside each object, create a settings dictionary with the name of each setting as the key,
// and a SettingValue object as the value.
// The SettingValue object should have a value attribute, which is the value of the setting.
// If the setting needs to be added together, add a part attribute with the part number.

// If a value is provided later on here, it will override the value with the same name before.
// However, if a value has a 'part' attribute, it will be added together with each part number; only overriding the part number specified.

// The program will NOT make a user review these values. This is for values that stay the same over time.
export const PRE_APPROVED_VALUES = ['Is Last Session Of Week', 'Is First Session Of Week', 'Is First Session Of Program', 'Is Last Session Of Program', 'Is Combined Options Session', 'Program', 'Email Type', 'Is After Break', 'Is Before Break'];
const hide = true; // You can also hide values from the user by adding this flag to the setting.

// The program will require these be set, before publishing to Active Campaign.
export const REQUIRED_SEND_VALUES = ['Send Date', 'Subject', 'Send Type', 'From Name', 'From Email', 'Reply To'];

export const SETTINGS: Settings<ValuePart<any>> = {
    settings: { // Provide global defaults for all emails here
        'Template': { value: './templates', part: 0, fetch: 'text' },
        'Banner': { value: './banners', part: 0 },
        'Base ID': { value: 'appHcZTzlfXAJpL7I', hide },
        'Airtable URL': { value: 'https://api.airtable.com/v0/{Base ID}', hide },
        'Airtable Session Query': { value: '{Airtable URL}/{Calendar Table ID}?filterByFormula=DATESTR(%7BDate%7D)="{Session Date (YYYY-MM-DD)}"', hide },

        'From Name': { value: 'Jared Spool', hide },
        'From Email': { value: 'jared.m.spool@centercentre.com', hide },
        'Reply To': { value: 'jared.m.spool@centercentre.com', hide },

        'Test Email': { value: 'accounts@centercentre.com', hide },

        'Email Name': { value: '{Program} ', part: 0, hide },
        'Email ID': { value: '{Send Date (YYYY-MM-DD)} {Email Name (Shorthand)}', hide },
        'Template Name': { value: '{Send Date (YYYY-MM-DD)} {Email Name (Shorthand)}', hide },
        'Campaign Name': { value: '{Send Date (YYYY-MM-DD)} {Email Name (Shorthand)}', hide },

        'Automation ID': { value: '226', hide }, // TEMP for testing


        'LoA ID': { value: '97', hide },
        'LoA Segment ID': { value: '1258', hide },
        'BL ID': { value: '108', hide },
        'BL Segment ID': { value: '0', hide },
    },
    'Program:TUXS': {
        settings: {
            'Send Type': { value: 'CAMPAIGN', hide },
            'Email Name': { value: '{Email Type}', part: 1 },

            'Banner': { value: '/tuxs', part: 1 },
            'Template': { value: '/tuxs', part: 1 },

            'List ID': { value: '{LoA ID}', hide },
            'Segment ID': { value: '{LoA Segment ID}', hide },

            'Calendar Table ID': { value: 'tbl6T80hI7yrFsJWz', hide },
            'Session Title': { value: '{Airtable Session Query}&fields[]=Title', fetch: 'airtable' },
            'Preview': { value: '{Airtable Session Query}&fields[]=Preview', fetch: 'airtable' },
            'Session Description': { value: '{Airtable Session Query}&fields[]=Description', fetch: 'airtable' },
            'Session Type': { value: '{Airtable Session Query}&fields[]=Topic Type', fetch: 'airtable' },
        },
        // DST override
        'Is DST': {
            settings: {
                'Banner': { value: '/tuxs-dst', part: 1 },
            },
        },
        'Email Type:Upcoming Topics': {
            settings: {
                'Banner': { value: '/upcomingtopics.png', part: 3 },
                'Template': { value: '/upcoming-topics.html', part: 2 },
                'Subject': { value: 'Upcoming: {Next Session #1 Title}, {Next Session #2 Title}, {Next Session #3 Title}' },
            }
        },
        'Email Type:Today': {
            settings: {
                'Banner': { value: '/today', part: 2 },
                'Template': { value: '/today.html', part: 2 },
                'Subject': { value: 'Today: {Session Title}' },
            }

        },
        'Email Type:Recording': {
            settings: {
                'Banner': { value: '/recording', part: 2 },
                'Template': { value: '/recording.html', part: 2 },
                'Subject': { value: 'Recording: {Session Title}' },
            }

        },
        'Email Type:New Topic': {
            settings: {
                'Banner': { value: '/new-topic', part: 2 },
                'Template': { value: '/new-topic.html', part: 2 },
                'Subject': { value: 'This Monday: {Session Title}' },
            }
        },
        // Topic settings
        'Session Type:Job Search Topic': {
            settings: {
                'Banner': { value: '/jobsearch.png', part: 3 },
            }
        },
        'Session Type:Metrics Topic': {
            settings: {
                'Banner': { value: '/metrics.png', part: 3 },
            }
        },
        'Session Type:Research Topic': {
            settings: {
                'Banner': { value: '/research.png', part: 3 },
            }
        },
        'Session Type:Win Topic': {
            settings: {
                'Banner': { value: '/wininfluence.png', part: 3 },
            }
        },
    },
    'Program:Stand Out': {
        settings: {
            'Send Type': { value: 'AUTOMATION', hide },
            'Email Name': { value: '{Email Type}', part: 1 },
            'Template': { value: '/standout', part: 1 },
            'Banner': { value: '' },

            'Automation ID': { value: '226', hide },

            'Calendar Table ID': { value: 'tbly8jzaHpb0hGfbj', hide },
            // 'Session Type': { value: '{Airtable Session Query}&fields[]=Session Type', fetch: 'airtable' },
            // 'Event Link': { value: '{Airtable Session Query}&fields[]=Event Link', fetch: 'airtable' },
            // 'Session Notes Link': { value: '{Airtable Session Query}&fields[]=Collab Notes Link', fetch: 'airtable' },
        },
        'Email Type:Events of Week': {
            settings: {
                'Subject': { value: 'This Week in the Stand Out Community' },
            },
            'Sessions in Prev Week:1': {
                settings: {
                    'Last Week Notes #1': { value: `<strong><a href="{{Last Week} Session #1 Collab Notes Link}" target="_blank" style="color:#ec621d;font-size:16px">Here is a link to the collaborative notes from last {{Last Week} Session #1 Session Day of Week}'s session</a></strong>.` },
                }
            },
            'Sessions in Prev Week:2': {
                settings: {
                    'Last Week Notes #1': { value: `<strong><a href="{{Last Week} Session #1 Collab Notes Link}" target="_blank" style="color:#ec621d;font-size:16px">Here is a link to the collaborative notes from last {{Last Week} Session #1 Session Day of Week}'s Materials Critique session</a></strong>.<br/><br/>` },
                    'Last Week Notes #2': { value: `<strong><a href="{{Last Week} Session #2 Collab Notes Link}" target="_blank" style="color:#ec621d;font-size:16px">Here is a link to the collaborative notes from last {{Last Week} Session #2 Session Day of Week}'s session</a></strong>.` },
                }
            },
            'Sessions in Week:1': {
                settings: {
                    'Template': { value: '/one-events-of-week.html', part: 2 },
                }
            },
            'Sessions in Week:2': {
                settings: {
                    'Template': { value: '/two-events-of-week.html', part: 2 },
                }
            },
        },
        'Email Type:Today\'s Session': {
            'Session Type:Live Discussion': {
                settings: {
                    'Template': { value: '/today-live-discussion.html', part: 2 },
                    'Subject': { value: 'Today’s Stand Out Community Session' },
                }
            },
            'Session Type:Materials Critique': {
                settings: {
                    'Template': { value: '/materials-critique.html', part: 2 },
                    'Subject': { value: 'Today’s Materials Critique Session' },
                }
            }
        }
    },
    'Program:Metrics': {
        settings: {
            'Send Type': { value: 'AUTOMATION', hide },
            'Template': { value: '/metrics', part: 1 },
            'Email Name': { value: '{Cohort} ', part: 1 },

            'Banner': { value: '' },

            'Calendar Table ID': { value: 'tblm2TqCcDcx94nA2', hide },
        },
        'Email Type:Today\'s Session': {
            settings: {
                'Email Name': { value: '{Topic}', part: 2 },

                'Template': { value: '/today.html', part: 2 },
                'Subject': { value: 'Outcome-Driven UX Metrics: {Next Week}: {Topic}: ​​{Title}' },
            }
        },
        'Email Type:Before Week': {
            settings: {
                'Email Name': { value: 'Before {Next Week}', part: 2 },

                'Template': { value: '/before-week-x.html', part: 2 },
                'Subject': { value: 'Outcome-Driven UX Metrics: {Next Week}: Topics {{Next Week} Session #1 Topic (#)} + {{Next Week} Session #2 Topic (#)}' },
            },
            'Next Week:Week 2': {
                settings: {
                    'Template': { value: '/before-week-2.html', part: 2 },
                }
            },
            'Is First Session Of Program': {
                'Week:Week 1': {
                    settings: {
                        'Email Name': { value: 'Before {Week}', part: 2 },
                        'Subject': { value: 'Outcome-Driven UX Metrics: {Week}: Topics {{Week} Session #1 Topic (#)} + {{Week} Session #2 Topic (#)}' },
                        'Template': { value: '/before-week-1.html', part: 2 },
                    }
                },
            },
        },
    },
    'Program:Visions': {
        settings: {
            'Send Type': { value: 'AUTOMATION', hide },
            'Template': { value: '/visions', part: 1 },
            'Email Name': { value: '{Cohort} ', part: 1 },

            'Banner': { value: '' },

            'Calendar Table ID': { value: 'tblm2TqCcDcx94nA2', hide },
        },
        'Email Type:Today\'s Session': {
            settings: {
                'Email Name': { value: '{Topic}', part: 2 },

                'Template': { value: '/today.html', part: 2 },
                'Subject': { value: 'Craft + Lead a Strategic UX Vision: {Next Week}: {Topic}: ​​{Title}' },
            }
        },
        'Email Type:Before Week': {
            settings: {
                'Email Name': { value: 'Before {Next Week}', part: 2 },
                // weeks 3 + 4
                'Template': { value: '/before-week-x.html', part: 2 },
                'Subject': { value: 'Craft + Lead a Strategic UX Vision: {Next Week}: Topics {{Next Week} Session #1 Topic (#)} + {{Next Week} Session #2 Topic (#)}' },
            },
            'Next Week:Week 2': {
                settings: {
                    'Template': { value: '/before-week-2.html', part: 2 },
                }
            },
            'Is First Session Of Program': {
                'Week:Week 1': {
                    settings: {
                        'Email Name': { value: 'Before {Week}', part: 2 },
                        'Subject': { value: 'Craft + Lead a Strategic UX Vision: {Week}: Topics {{Week} Session #1 Topic (#)} + {{Week} Session #2 Topic (#)}' },
                        'Template': { value: '/before-week-1.html', part: 2 },
                    }
                },
            },
        },
    }
};