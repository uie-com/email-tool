import { ValuePart } from "@/domain/values/valueCollection";
import { Settings } from "../../domain/schema";
import { AI } from "./programs/ai";
import { LOA } from "./programs/loa";
import { METRICS } from "./programs/metrics";
import { RESEARCH } from "./programs/research";
import { STAND_OUT } from "./programs/stand-out";
import { TUXS } from "./programs/tuxs";
import { VISION } from "./programs/vision";
import { WIN } from "./programs/win";




export const PRE_APPROVED_VALUES = ['Is Last Session Of Week', 'Is First Session Of Week', 'Is First Session Of Program', 'Is Last Session Of Program', 'Is Combined Options Session', 'Program', 'Email Type', 'Is After Break', 'Is Before Break', 'Audience'];
export const REQUIRED_SEND_VALUES = ['Send Date', 'Subject', 'Send Type', 'From Name', 'From Email', 'Reply To'];

const hide = true; // You can also hide values from the user by adding this flag to the setting.


export const SETTINGS: Settings<ValuePart<any>> = {
    settings: { // Global email settings. Can be overridden by email settings.
        // *** TEMPLATES ***
        'Template Name': { value: '{Send Date (YYYY-MM-DD)} {Email Name (Shorthand)}', hide },
        'Template': { value: './templates', part: 0, fetch: 'text' }, // Base path for email templates


        // *** AIRTABLE ***
        'Base ID': { value: 'appHcZTzlfXAJpL7I', hide }, // Airtable base ID for schedule API calls
        'Airtable URL': { value: 'https://api.airtable.com/v0/{Base ID}', hide },
        // SCHEDULE TABLE
        'Airtable Session Query': { value: '', hide },
        // SETTINGS TABLE
        'Settings Table ID': { value: 'tblDFifdIAEJzKFLS', hide }, // Airtable table ID for program settings
        'Airtable Settings Query': { value: '', hide },
        'Zoom Link': { value: '{Airtable Settings Query}&fields[]=Zoom Link', fetch: 'airtable', hide },
        'Zoom ID': { value: '{Airtable Settings Query}&fields[]=Zoom ID', fetch: 'airtable', hide },
        'Zoom Passcode': { value: '{Airtable Settings Query}&fields[]=Zoom Passcode', fetch: 'airtable', hide },
        'Community Link': { value: '{Airtable Settings Query}&fields[]=Community Link', fetch: 'airtable' },
        'Workshop Materials Link': { value: '{Airtable Settings Query}&fields[]=Workshop Materials Link', fetch: 'airtable' },
        'Community Join Link': { value: '{Airtable Settings Query}&fields[]=Community Join Link', fetch: 'airtable' },
        'Calendar Instructions Link': { value: '{Airtable Settings Query}&fields[]=Calendar Instructions Link', fetch: 'airtable', hide },


        // *** ACTIVE CAMPAIGN ***
        'Campaign Name': { value: '{Send Date (YYYY-MM-DD)} {Email Name (Shorthand)}', hide },
        // SENDING
        'From Name': { value: 'Jared Spool', hide },
        'From Email': { value: 'jared.m.spool@centercentre.com', hide },
        'Reply To': { value: 'jared.m.spool@centercentre.com', hide },
        'Email Tag': { value: '{Send Date (YYYY-MM-DD)(Tag)}-{Email Name(Tag)}', hide },
        // LISTS
        'LoA ID': { value: '97', hide },
        'LoA Segment ID': { value: '1258', hide },
        'BL ID': { value: '108', hide },
        'BL Segment ID': { value: '0', hide },
        'Maven ID': { value: '170', hide },
        'Maven Segment ID': { value: '0', hide },
        // TESTING
        'Test Email': { value: 'accounts@centercentre.com', hide },
        'Test Subject': { value: '[{Send Date (M-D h:mmA)(-:00)(ASAP)}] {Subject}', hide },


        // *** SLACK ***
        'QA Email Name': { value: '{Email Name}', hide },
        'QA Email ID': { value: '{Send Date (YYYY-MM-DD h:mmA)(-:00)(ASAP)} {QA Email Name (Shorthand)}', hide },


        // *** DRIVE ***
        'Collab Notes Name': { value: '{Send Date (YYYY-MM-DD)} {Email Name}', hide },


        // *** INTERNAL ***
        // EMAIL IDENTIFIERS
        'Email Name': { value: '{Program} ', part: 0, hide },
        'Email Name Shorthand': { value: '{Email Name (Shorthand)}', hide },
        'Email ID': { value: '{Send Date (YYYY-MM-DD)} {Email Name (Shorthand)}', hide },


        // *** DESIGN ***
        'Link Color': { value: '' },
        'Link Text Decoration': { value: '', hide },
        'Font': { value: '\'Open Sans\'', part: 0, hide },
        // OVERRIDES
        'Global Styles': {
            value: `
            a [ 
                color: {Link Color} !important; 
                text-decoration: {Link Text Decoration} !important; 
            ]
            ul [ 
                margin-bottom: 1.75rem !important; 
            ] 
            .footer-text [ 
                color:{Footer Color} !important;
                font-size:14px !important;
                font-family:{Font}, sans-serif !important;
                line-height:1.5 !important; 
            ] 
            @media only screen and (max-width:600px) [ 
                div.footer p.footer-text,a.footer-text [ 
                    font-size:12px !important; 
                ] 
                .top-padding-insert [ 
                    display: none; 
                ]  
                h1 [ 
                font-size: 26px !important; 
                ] 
            ] 
            hr [ 
                margin-top: 25px; 
                margin-bottom: 20px; 
            ] `, part: 0
        },
        // * FOOTER *
        'Marketing Footer': { value: ` <div class="footer"> <hr style="opacity:0.2;margin:6px 0px 20px 0px;" /> <p class="footer-text"> {Footer Email Reason} <br/><br/> <em>{Footer Unsubscribe}{Footer Contact}</em> </p> <hr style="opacity:0.2;margin:20px 0px;" /> <p class="footer-text" style=""> © Copyright 2025, Center Centre, Inc. <br/> {Footer Sender Info} Email sent to: %EMAIL% <br/><br/> {Footer Forward}{Footer Tag} </p> </div> `, hide },
        'Transactional Footer': { value: ` <div class="footer"> <hr style="opacity:0.2;margin:6px 0px 20px 0px;" /> <p class="footer-text"> {Footer Email Reason} <br/><br/> <em>{Footer Contact}</em> </p> <hr style="opacity:0.2;margin:20px 0px;" /> <p class="footer-text" style=""> © Copyright 2025, Center Centre, Inc. <br/><br/> Email sent to: %EMAIL% <br/><br/> {Footer Tag} </p> </div> `, hide },
        // FOOTER SETTINGS
        'Footer Color': { value: '#999999', hide },
        // FOOTER COMPONENTS
        'Footer Email Reason': { value: `You're receiving this email because you're a member {Cohort (pre:of)} of the {Program Name} Online Course.`, hide },
        'Footer Unsubscribe': { value: `Not interested in this email or topic? <a href="%FORMS_PREF_CENTER*ID:8%" style="color:{Footer Color} !important;text-decoration:underline !important" class="footer-text">Manage your Center Centre email preferences</a> OR <a href="%UNSUBSCRIBELINK%" style="color:{Footer Color} !important;text-decoration:underline !important" class="footer-text">Unsubscribe</a> from ALL {Footer Organization Name} Emails.<br/><br/>`, hide },
        'Footer Organization Name': { value: 'Center Centre', hide },
        'Footer Forward': { value: `<a href="%FORWARD2FRIEND%" style="color:{Footer Color} !important;text-decoration:underline !important" class="footer-text">Forward email to a friend</a> <br/><br/>`, hide },
        'Footer Contact': { value: `If you have questions about the course, contact us at <a href="mailto:hello@centercentre.com" class="footer-text" style="color:{Footer Color} !important;text-decoration:underline !important" class="footer-text">hello@centercentre.com</a>.`, hide },
        'Footer Sender Info': { value: `%SENDER-INFO-SINGLELINE%<br/><br/>`, hide },
        'Footer Tag': { value: `{Program (Caps)} {Cohort (Caps)}`, hide },
    },

    ...METRICS,
    ...RESEARCH,
    ...VISION,
    ...AI,
    ...WIN,
    ...STAND_OUT,
    ...TUXS,
    ...LOA,


    'Send Type:AUTOMATION': {
        settings: {
            'Footer': { value: '{Transactional Footer}', hide },
        }
    },
    'Send Type:POSTMARK': {
        settings: {
            'Footer': { value: '{Transactional Footer}', hide },
        }
    },
    'Send Type:CAMPAIGN': {
        settings: {
            'Footer': { value: '{Marketing Footer}', hide },
        }
    },

    'Send To:LoA': {
        settings: {
            'List ID': { value: '{LoA ID}', hide },
            'Segment ID': { value: '{LoA Segment ID}', hide },

            'Greeting': { value: 'Hello %FIRSTNAME%,' },

            'Footer Email Reason': { value: `You're receiving this email because you're a member of Leaders of Awesomeness.` },
            'Footer Contact': { value: `If you have questions about the community, contact us at <a href="mailto:hello@centercentre.com" style="color:{Footer Color} !important;text-decoration:underline !important" class="footer-text">hello@centercentre.com</a>.` },
            'Footer Tag': { value: `LOA` },
            'Footer Organization Name': { value: 'Leaders of Awesomeness', hide },
        }
    },
    'Send To:BL': {
        settings: {
            'List ID': { value: '{BL ID}', hide },
            'Segment ID': { value: '{BL Segment ID}', hide },

            'Greeting': { value: 'Hello,' },


            'Footer Email Reason': { value: `You're receiving this email because you've subscribed to Center Centre emails.` },
            'Footer Contact': { value: `If you have any questions, contact us at <a href="mailto:hello@centercentre.com" style="color:{Footer Color} !important;text-decoration:underline !important" class="footer-text">hello@centercentre.com</a>.` },
            'Footer Tag': { value: `BL` },
        }
    },
    'Send To:Maven': {
        settings: {
            'List ID': { value: '{Maven ID}', hide },
            'Segment ID': { value: '{Maven Segment ID}', hide },

            'Greeting': { value: 'Hello,' },

            'Footer Email Reason': { value: `You're receiving this email because you've attended a Center Centre course or talk with Maven.` },
            'Footer Contact': { value: `If you have any questions, contact us at <a href="mailto:hello@centercentre.com" style="color:{Footer Color} !important;text-decoration:underline !important" class="footer-text">hello@centercentre.com</a>.` },
            'Footer Tag': { value: `UXAI` },
        }
    },
};