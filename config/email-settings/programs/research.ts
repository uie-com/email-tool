import { Settings } from "@/domain/schema";
import { ValuePart } from "@/domain/values/valueCollection";
import { BEFORE_WEEK, CERTIFICATE, CONFIRMATION, CONTENT, MESSAGE, RECEIPT, TODAYS_SESSION, VESSEL } from "../shared-emails";

const hide = true;


export const RESEARCH: Settings<ValuePart<any>> = {
    'Program:Research': {
        settings: {
            // PROGRAM
            'Program Name': { value: 'Advanced Strategic UX Research', hide },
            'Program Website': { value: 'https://ux-research.centercentre.com', hide },

            // SENDING
            'Send Type': { value: 'POSTMARK', hide },

            // AIRTABLE
            'Calendar Table ID': { value: 'tblZQZRiPOJz4MTkv', hide },
            'Topic Table ID': { value: 'tbldSCPFTa8UD58WI', hide },

            'Airtable Topic Query': { value: '{Airtable URL}/{Topic Table ID}?filterByFormula=SEARCH("{Topic}", %7BName%7D)', hide },
            'Description': { value: '{Airtable Topic Query}&fields[]=Description', fetch: 'airtable' },

            'Airtable Session Query': { value: '{Airtable URL}/{Calendar Table ID}?filterByFormula=DATESTR(%7BDate%7D)="{Session Date (YYYY-MM-DD)}"', hide },
            'Airtable Settings Query': { value: '{Airtable URL}/{Settings Table ID}?filterByFormula=SEARCH("{Program}", %7BProgram%7D)', hide },

            // INTERNAL
            'Email Name': { value: '{Cohort} ', part: 1 },

            // TEMPLATE
            'Template': { value: '/workshop', part: 1 },

            // STYLES
            'Link Color': { value: '#ec621d', hide },
            'Accent Color': { value: '5e2946', hide },

            // BANNER
            'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/456eae66-13b7-4fd1-b959-8d5a9c35e40a.png?id=39152003' },
            'Promo Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/2d2dbb0d-4ecb-4b57-beca-785d89ed3b8b.png?id=39155896' },
        },

        // ** EMAILS **
        ...TODAYS_SESSION,
        'Email Type:Today\'s Session': {
            settings: {
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/160P5IwlEDgvg53zrCMTH1NwW7p0V0cnEqb-CV3VY-bc/edit' },
            },
            'Topic:Topic 1': { settings: { 'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/17VTL3sgEXmWUGu1s-YKgD_xUBenEGytuarlsV02TBaI/edit?usp=sharing' } } },
            'Topic:Topic 2': { settings: { 'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/17aRSWdHCRehgk-PuLd305Pa3THUbQvedznJxVU5QLi8/edit?usp=sharing' } } },
            'Topic:Topic 3': { settings: { 'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/1ES80oE15Ps5jCNoNTRUtfgS22Fl91PVVv-93nvd-Glk/edit?usp=sharing' } } },
            'Topic:Topic 4': { settings: { 'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/1LsuOGJ0YquStDH0WhA8n7p3wqehCSq_7x8dl9GOmfjs/edit?usp=sharing' } } },
            'Topic:Topic 5': { settings: { 'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/1_HtbVbWNxbkOMFXMQaRU_Ud8BSjGZo1IvFyT5P8dPnA/edit?usp=sharing' } } },
            'Topic:Topic 6': { settings: { 'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/1oMoS_Zjsgru27AW6B_Zi8fZxsMd6AHf7fxpT7bc2_M0/edit?usp=sharing' } } },
            'Topic:Topic 7': { settings: { 'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/1pUNgTjKv62VERiLcHlVnuaoDgvnKo9t2_JRadvztxlg/edit?usp=sharing' } } },
            'Topic:Topic 8': { settings: { 'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/1poajikSzWpfzD8N8lBps0jCZFHy5QCyGKxkWEb2BaBA/edit?usp=sharing' } } },
        },

        ...BEFORE_WEEK,
        'Email Type:Before Week': {
            settings: {
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1GTwZUhhdJjiuPnWKLeEDcHRG1lX9gJG1mAk3CcogpPM/edit' },
            },
            'Is First Session Of Program': {
                'Week:Week 1': {
                    settings: {
                        'Source Reference Doc': { value: 'https://docs.google.com/document/d/1Vb5Q1FB2rumreNblfrK_qX-QyshoY9Wx3LCIjjrQm94/edit' },
                    }
                },
            },
            'Next Week:Week 2': {
                settings: {
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/1PxBRnXcGjY6ytzlTL4Xuvt63T8LtGHzPJM3gQywb7Sk/edit' },
                }
            },
        },

        ...CERTIFICATE,
        'Email Type:Certificate': {
            settings: {
                'Source Reference Doc': { value: `https://docs.google.com/document/d/1zQjiXG1bZlIMmiZz0RDGHbm1anirdWBrNvMZOSif0m4/edit` },
            },
        },

        ...VESSEL,
        ...CONTENT,
        ...MESSAGE,

        ...RECEIPT,
        ...CONFIRMATION,


        // ** SETTINGS **
        'Cohort:Cohort 3': {
            settings: {
                'Automation ID': { value: '250', hide },
            }
        },
        'Cohort:Cohort 4': {
            settings: {
                'Automation ID': { value: '282', hide },
            }
        },
    },
}