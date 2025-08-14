import { Settings } from "@/domain/schema";
import { ValuePart } from "@/domain/values/valueCollection";
import { CONFIRMATION, CONTENT, MESSAGE, RECEIPT, TODAYS_SESSION, VESSEL } from "../shared-emails";

const hide = true;


export const STAND_OUT: Settings<ValuePart<any>> = {
    'Program:Stand Out': {
        settings: {
            // PROGRAM
            'Program Name': { value: 'Stand Out: A Working Community for Unemployed UX Leaders', hide },
            'Program Website': { value: 'https://centercentre.com/stand-out/', hide },

            // AIRTABLE
            'Calendar Table ID': { value: 'tbly8jzaHpb0hGfbj', hide },

            'Airtable Session Query': { value: '{Airtable URL}/{Calendar Table ID}?filterByFormula=DATESTR(%7BDate%7D)="{Session Date (YYYY-MM-DD)}"', hide },
            'Airtable Settings Query': { value: '{Airtable URL}/{Settings Table ID}?filterByFormula=SEARCH("{Program}", %7BProgram%7D)', hide },

            // TEMPLATE
            'Template': { value: '/standout', part: 1 },

            // STYLES
            'Link Color': { value: '#ec621d', hide },
            'Footer Color': { value: '#BBBBBB', hide },

            // SENDING
            'Send Type': { value: 'POSTMARK', hide },
            'Automation ID': { value: '226', hide },

            // FOOTER
            'Footer Email Reason': { value: `You're receiving this email because you're a member of {Program Name}.` },
            'Footer Contact': { value: `If you have questions about the community, contact us at <a href="mailto:hello@centercentre.com" style="color:{Footer Color} !important;text-decoration:underline !important" class="footer-text">hello@centercentre.com</a>.` },
            'Footer Tag': { value: `{Program (Caps)}` },
        },

        // ** EMAILS **
        ...TODAYS_SESSION,
        'Email Type:Today\'s Session': {
            settings: {
                'Email Name': { value: '{Session Type}', part: 2 },
                'Send Type': { value: 'POSTMARK', hide },
                'Uses Collab Notes': { value: 'Uses Collab Notes', hide },
            },
            'Session Type:Live Discussion': {
                settings: {
                    'Template': { value: '/today-live-discussion.html', part: 2 },
                    'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9453032', hide },

                    'Subject': { value: 'Today’s Stand Out Community Session' },
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/1AC2E0gWyShIPsZ7xHncWgjgolly3AwyxltTtVQLFoog/edit' },
                    'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/1ZGQ09ANNM4W2gCC8BmJQjswUGZs9CTfguX3dnpkKEK4/edit' },
                }
            },
            'Session Type:Materials Critique': {
                settings: {
                    'Template': { value: '/today-materials-critique.html', part: 2 },
                    'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9488185', hide },

                    'Subject': { value: 'Today’s Materials Critique Session' },
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/1LZaqUgGa5mIMKg3ZeS3DskPkqO1pBFND4suzQqpq0SE/edit' },
                    'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/14fcUiSQHJ51Na_OgNhU1BOAfQZHVItLznb8xPyCbf-M/edit' },
                }
            }
        },

        'Email Type:Events of Week': {
            settings: {
                'Email Name': { value: '{Email Type}', part: 1 },
                'Subject': { value: 'This Week in the Stand Out Community' },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1BkCicp_dYsIPlfffnELtok4ywhfRqJxR05eZxOTj2EE/edit' },
            },
            'Sessions in Prev Week:1': {
                settings: {
                    'Last Week Notes #1': { value: `<strong><a href="{{Last Week} Session #1 Collab Notes Link}" target="_blank" style="color:#ec621d;font-size:16px">Here is a link to the collaborative notes from last {{Last Week} Session #1 Day of Week}'s session</a></strong>.` },
                }
            },
            'Sessions in Prev Week:2': {
                settings: {
                    'Last Week Notes #1': { value: `<strong><a href="{{Last Week} Session #1 Collab Notes Link}" target="_blank" style="color:#ec621d;font-size:16px">Here is a link to the collaborative notes from last {{Last Week} Session #1 Day of Week}'s Materials Critique session</a></strong>.<br/><br/>` },
                    'Last Week Notes #2': { value: `<strong><a href="{{Last Week} Session #2 Collab Notes Link}" target="_blank" style="color:#ec621d;font-size:16px">Here is a link to the collaborative notes from last {{Last Week} Session #2 Day of Week}'s session</a></strong>.` },
                }
            },
            'Sessions in Prev Week:3': {
                settings: {
                    'Last Week Notes #1': { value: `<strong><a href="{{Last Week} Session #1 Collab Notes Link}" target="_blank" style="color:#ec621d;font-size:16px">Here is a link to the collaborative notes from last {{Last Week} Session #1 Day of Week}'s Materials Critique session</a></strong>.<br/><br/>` },
                    'Last Week Notes #2': { value: `<strong><a href="{{Last Week} Session #2 Collab Notes Link}" target="_blank" style="color:#ec621d;font-size:16px">Here is a link to the collaborative notes from last {{Last Week} Session #2 Day of Week}'s Materials Critique session</a></strong>.<br/><br/>` },
                    'Last Week Notes #3': { value: `<strong><a href="{{Last Week} Session #3 Collab Notes Link}" target="_blank" style="color:#ec621d;font-size:16px">Here is a link to the collaborative notes from last {{Last Week} Session #3 Day of Week}'s session</a></strong>.` },
                }
            },
            'Sessions in Week:1': {
                settings: {
                    'Template': { value: '/one-events-of-week.html', part: 2 },
                    'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9488264', hide },
                }
            },
            'Sessions in Week:2': {
                settings: {
                    'Template': { value: '/two-events-of-week.html', part: 2 },
                    'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9488537', hide },

                }
            },
        },

        ...VESSEL,
        ...CONTENT,
        ...MESSAGE,

        ...RECEIPT,
        'Email Type:Receipt': {
            settings: {
                'Company Insert': { value: '' },
            },
            'Price Type:New Member': {
                settings: {
                    'Price Name': { value: 'New Member' },
                    'Price': { value: '$199.00' },
                }
            },
            'Price Type:Subscription Receipt': {
                settings: {
                    'Price Name': { value: 'Subscription Receipt' },
                    'Price': { value: '$199.00' },
                }
            },
        },

        ...CONFIRMATION,
        'Email Type:Confirmation': {
            settings: {
                'Confirmation Message': { value: `The goal of the program is to take you to the next level of your UX career.` },
                'Space Name': { value: 'Stand Out Community' }
            }
        },


        // ** SETTINGS **
    },
}