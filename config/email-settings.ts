
import { Settings } from "../domain/schema";
import { ValuePart } from "../domain/values/valueCollection";

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
    settings: {
        //default settings determine what variables each email type will inherit
        'Template': { value: './templates', part: 0, fetch: 'text' },
        'Base ID': { value: 'appHcZTzlfXAJpL7I', hide },
        'Airtable URL': { value: 'https://api.airtable.com/v0/{Base ID}', hide },
        'Airtable Session Query': { value: '{Airtable URL}/{Calendar Table ID}?filterByFormula=DATESTR(%7BDate%7D)="{Session Date (YYYY-MM-DD)}"', hide },
        'Settings Table ID': { value: 'tblDFifdIAEJzKFLS', hide },
        'Airtable Settings Query': { value: '{Airtable URL}/{Settings Table ID}?filterByFormula=SEARCH("{Program}", %7BProgram%7D)', hide },


        'From Name': { value: 'Jared Spool', hide },
        'From Email': { value: 'jared.m.spool@centercentre.com', hide },
        'Reply To': { value: 'jared.m.spool@centercentre.com', hide },

        'Test Email': { value: 'accounts@centercentre.com', hide },

        'Email Name': { value: '{Program} ', part: 0, hide },
        'Email Name Shorthand': { value: '{Email Name (Shorthand)}', hide },
        'Email ID': { value: '{Send Date (YYYY-MM-DD)} {Email Name (Shorthand)}', hide },
        'Slack Email ID': { value: '{Send Date (YYYY-MM-DD h:mma)} {Email Name (Shorthand)}', hide },
        'Email Tag': { value: '{Send Date (YYYY-MM-DD)(Tag)}-{Email Name(Tag)}', hide },

        'Template Name': { value: '{Send Date (YYYY-MM-DD)} {Email Name (Shorthand)}', hide },
        'Campaign Name': { value: '{Send Date (YYYY-MM-DD)} {Email Name (Shorthand)}', hide },
        'Collab Notes Name': { value: '{Send Date (YYYY-MM-DD)} {Email Name}', hide },

        'LoA ID': { value: '97', hide },
        'LoA Segment ID': { value: '1258', hide },
        'BL ID': { value: '108', hide },
        'BL Segment ID': { value: '0', hide },

        'Footer Email Reason': { value: `You're receiving this email because you're a member of {Cohort} of the {Program Name} Online Course.`, hide },

        'Footer Unsubscribe': { value: `Not interested in this email or topic? <a href="%FORMS_PREF_CENTER*ID:8%" style="color:{Footer Color} !important;text-decoration:underline !important" class="footer-text">Manage your Center Centre email preferences</a> OR <a href="%UNSUBSCRIBELINK%" style="color:{Footer Color} !important;text-decoration:underline !important" class="footer-text">Unsubscribe</a> from ALL Leaders of Awesomeness Emails.<br/><br/>`, hide },

        'Footer Forward': {
            value: `<a href="%FORWARD2FRIEND%" style="color:{Footer Color} !important;text-decoration:underline !important" class="footer-text">Forward email to a friend</a>
            <br/><br/>`, hide
        },

        'Footer Contact': { value: `If you have questions about the course, contact us at <a href="mailto:hello@centercentre.com" class="footer-text" style="color:{Footer Color} !important;text-decoration:underline !important" class="footer-text">hello@centercentre.com</a>.`, hide },

        'Footer Sender Info': { value: `%SENDER-INFO-SINGLELINE%<br/><br/>`, hide },

        'Footer Tag': { value: `{Program (Caps)} {Cohort (Caps)}`, hide },
        'Marketing Footer': {
            value: `
            <div class="footer">
            <hr style="opacity:0.2;margin:6px 0px 20px 0px;" />
            <p class="footer-text">
            {Footer Email Reason}
            <br/><br/>
            <em>{Footer Unsubscribe}{Footer Contact}</em>
            </p>
            <hr style="opacity:0.2;margin:20px 0px;" />
            <p class="footer-text" style="">
            © Copyright 2025, Center Centre, Inc.
            <br/>
            {Footer Sender Info}
            Email sent to: %EMAIL%
            <br/><br/>
            {Footer Forward}{Footer Tag}
            </p>
            </div>
            `, hide
        },
        'Transactional Footer': {
            value: `
            <div class="footer">
            <hr style="opacity:0.2;margin:6px 0px 20px 0px;" />
            <p class="footer-text">
            {Footer Email Reason}
            <br/><br/>
            <em>{Footer Contact}</em>
            </p>
            <hr style="opacity:0.2;margin:20px 0px;" />
            <p class="footer-text" style="">
            © Copyright 2025, Center Centre, Inc.
            <br/><br/>
            Email sent to: %EMAIL%
            <br/><br/>
            {Footer Tag}
            </p>
            </div>
            `, hide
        },

        'Footer Color': { value: '#999999', hide },
        'Link Color': { value: '', hide },
        'Link Text Decoration': { value: '', hide },

        'Font': { value: '\'Open Sans\'', part: 0, hide },

        'Global Styles': {
            value: 'a [ color: {Link Color} !important; text-decoration: {Link Text Decoration} !important; ] \n ul [ margin-bottom: 1.75rem !important; ] \n .footer-text [ color:{Footer Color} !important;font-size:14px !important;font-family:{Font}, sans-serif !important;line-height:1.5 !important; ] \n @media only screen and (max-width:600px) [ div.footer p.footer-text,a.footer-text [ font-size:12px !important; ] .top-padding-insert [ display: none; ]  h1 [ font-size: 26px !important; ] ] hr [ margin-top: 25px; margin-bottom: 20px; ] ', part: 0
        },

        'Zoom Link': { value: '{Airtable Settings Query}&fields[]=Zoom Link', fetch: 'airtable', hide },
        'Zoom ID': { value: '{Airtable Settings Query}&fields[]=Zoom ID', fetch: 'airtable', hide },
        'Zoom Passcode': { value: '{Airtable Settings Query}&fields[]=Zoom Passcode', fetch: 'airtable', hide },
        'Community Link': { value: '{Airtable Settings Query}&fields[]=Community Link', fetch: 'airtable' },
        'Workshop Materials Link': { value: '{Airtable Settings Query}&fields[]=Workshop Materials Link', fetch: 'airtable' },
        'Community Join Link': { value: '{Airtable Settings Query}&fields[]=Community Join Link', fetch: 'airtable' },
        'Calendar Instructions Link': { value: '{Airtable Settings Query}&fields[]=Calendar Instructions Link', fetch: 'airtable', hide },
    },


    'Email Type:Today\'s Session': {
        settings: {
            'Email Name': { value: '{Topic}', part: 2 },

            'Template': { value: '/today.html', part: 2 },
            'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9551152', hide },

            'Subject': { value: '{Program Name}: {Week}: {Topic}: ​​{Title}' },

            'Uses Collab Notes': { value: 'Uses Collab Notes', hide },
        }
    },
    'Email Type:Before Week': {
        settings: {
            'Email Name': { value: 'Before {Next Week}', part: 2 },

            'Template': { value: '/before-week-x.html', part: 2 },
            'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9551147', hide },

            'Subject': { value: '{Program Name}: {Next Week}: Topics {{Next Week} Session #1 Topic (#)} + {{Next Week} Session #2 Topic (#)}' },

            'Session Title Number': { value: '[[Next Week] Session #1 Topic (#)]', hide },

            'Session Message': {
                value: `
                <p class="x" style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:24px;letter-spacing:0;color:#333333;font-size:16px">On [[Next Week] Session #1 Date (dddd, MMMM Do)], we'll cover <strong>[[Next Week] Session #1 Topic]: [[Next Week] Session #1 Title]</strong>.</p>
                
                <p class="x" style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:24px;letter-spacing:0;color:#333333;font-size:16px"><br></p>
                
                <p class="x" style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:24px;letter-spacing:0;color:#333333;font-size:16px"><b>To Prepare for [[Next Week] Session #1 Topic]: [[Next Week] Session #1 Title]</b></p> 
                
                <ul style="font-family:arial, 'helvetica neue', helvetica, sans-serif;padding:0px 0px 0px 40px;margin-top:15px;margin-bottom:15px"> 
                <li style="color:#333333;margin:0px 0px 15px;font-size:16px"><p class="x" style="Margin:0;mso-line-height-rule:exactly;mso-margin-bottom-alt:15px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:24px;letter-spacing:0;color:#333333;font-size:16px;mso-margin-top-alt:15px"><b><a href="[[Next Week] Session #1 Lecture Link]" target="_blank" style="mso-line-height-rule:exactly;text-decoration:underline;color:[Link Color];font-size:16px">Watch the pre-recorded lecture</a></b> on your own or attend the <a target="_blank" href="[[Next Week] Session #1 Lecture Event Link]" style="mso-line-height-rule:exactly;text-decoration:underline;color:[Link Color];font-size:16px"><strong>Watch the Lecture Session on [[Next Week] Session #1 Lecture Date (dddd, MMMM Do |[at]| h:mma z)(:00)]</strong></a>.</p>
                </li> 
                <li style="color:#333333;margin:0px 0px 15px;font-size:16px">
                <p class="x" style="Margin:0;mso-line-height-rule:exactly;mso-margin-bottom-alt:15px;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:24px;letter-spacing:0;color:#333333;font-size:16px"><strong><a target="_blank" href="[[Next Week] Session #1 Coaching Event Link]" style="mso-line-height-rule:exactly;text-decoration:underline;color:[Link Color];font-size:16px">Attend the Live Coaching Session on [[Next Week] Session #1 Coaching Date (dddd, MMMM Do |[at]| h:mma z)(:00)]</a></strong>.</p>
                </li> 
                </ul>`, hide
            }
        },
        'Next Week:Week 2': {
            settings: {
                'Template': { value: '/before-week-2.html', part: 2 },
                'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9551146', hide },

            }
        },
        'Is First Session Of Program': {
            'Week:Week 1': {
                settings: {
                    'Email Name': { value: 'Before {Week}', part: 2 },
                    'Subject': { value: '{Program Name}: {Week}: Topics {{Week} Session #1 Topic (#)} + {{Week} Session #2 Topic (#)}' },

                    'Template': { value: '/before-week-1.html', part: 2 },
                    'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9551144', hide },
                }
            },
        },
    },
    'Email Type:Certificate': {
        settings: {
            'Email Name': { value: 'Certificate', part: 2 },
            'Subject': { value: 'Your Certificate for the {Program Name} Online Course' },
            'Template': { value: '/workshop/certificate.html', part: 1 },
            'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9552708', hide },
        },
        'Program:Metrics': { settings: { 'Source Reference Doc': { value: `https://docs.google.com/document/d/1QqwlIK0xIWQD4Ms9Tp2UQLW-4Zc7-r2tKUkwofrPGrc/edit` } } },
        'Program:Research': { settings: { 'Source Reference Doc': { value: `https://docs.google.com/document/d/1zQjiXG1bZlIMmiZz0RDGHbm1anirdWBrNvMZOSif0m4/edit` } } },
        'Program:Visions': { settings: { 'Source Reference Doc': { value: `https://docs.google.com/document/d/1vo3rdXSIWOU1apSulbd3M8vfyEkkWA8tAfbKfN9_iQA/edit` } } },
    },


    'Program:Stand Out': {
        settings: {
            'Program Name': { value: 'Stand Out: A Working Community for Unemployed UX Leaders', hide },
            'Program Website': { value: 'https://centercentre.com/stand-out/', hide },

            'Send Type': { value: 'AUTOMATION', hide },
            'Template': { value: '/standout', part: 1 },

            'Footer Color': { value: '#BBBBBB', hide },

            'Automation ID': { value: '226', hide },

            'Link Color': { value: '#ec621d', hide },


            'Calendar Table ID': { value: 'tbly8jzaHpb0hGfbj', hide },
            // 'Session Type': { value: '{Airtable Session Query}&fields[]=Session Type', fetch: 'airtable' },
            // 'Event Link': { value: '{Airtable Session Query}&fields[]=Event Link', fetch: 'airtable' },
            // 'Session Notes Link': { value: '{Airtable Session Query}&fields[]=Collab Notes Link', fetch: 'airtable' },

            'Footer Email Reason': { value: `You're receiving this email because you're a member of {Program Name}.` },
            'Footer Contact': { value: `If you have questions about the community, contact us at <a href="mailto:hello@centercentre.com" style="color:{Footer Color} !important;text-decoration:underline !important" class="footer-text">hello@centercentre.com</a>.` },
            'Footer Tag': { value: `{Program (Caps)}` },
        },
        'Email Type:Events of Week': {
            settings: {
                'Subject': { value: 'This Week in the Stand Out Community' },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1BkCicp_dYsIPlfffnELtok4ywhfRqJxR05eZxOTj2EE/edit' },
                'Email Name': { value: '{Email Type}', part: 1 },

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
        'Email Type:Today\'s Session': {
            settings: {
                'Email Name': { value: '{Session Type}', part: 2 },
            },
            'Session Type:Live Discussion': {
                settings: {
                    'Template': { value: '/today-live-discussion.html', part: 2 },
                    'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9453032', hide },

                    'Subject': { value: 'Today’s Stand Out Community Session' },
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/1AC2E0gWyShIPsZ7xHncWgjgolly3AwyxltTtVQLFoog/edit' },
                    'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/1ZGQ09ANNM4W2gCC8BmJQjswUGZs9CTfguX3dnpkKEK4/edit' },

                    'Uses Collab Notes': { value: 'Uses Collab Notes', hide },
                }
            },
            'Session Type:Materials Critique': {
                settings: {
                    'Template': { value: '/today-materials-critique.html', part: 2 },
                    'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9488185', hide },

                    'Subject': { value: 'Today’s Materials Critique Session' },
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/1LZaqUgGa5mIMKg3ZeS3DskPkqO1pBFND4suzQqpq0SE/edit' },
                    'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/14fcUiSQHJ51Na_OgNhU1BOAfQZHVItLznb8xPyCbf-M/edit' },

                    'Uses Collab Notes': { value: 'Uses Collab Notes', hide },
                }
            }
        }
    },
    'Program:Metrics': {
        settings: {
            'Program Name': { value: 'Outcome-Driven UX Metrics', hide },
            'Program Website': { value: 'https://ux-metrics.centercentre.com', hide },

            'Send Type': { value: 'AUTOMATION', hide },
            'Template': { value: '/workshop', part: 1 },
            'Email Name': { value: '{Cohort} ', part: 1 },

            'Link Color': { value: '#006f74', hide },
            'Accent Color': { value: '00a3b4', hide },


            'Calendar Table ID': { value: 'tblm2TqCcDcx94nA2', hide },
            'Topic Table ID': { value: 'tbl9BuLUVFytMYJeq', hide },

            'Airtable Topic Query': { value: '{Airtable URL}/{Topic Table ID}?filterByFormula=SEARCH("{Topic}", %7BName%7D)', hide },
            'Description': { value: '{Airtable Topic Query}&fields[]=Description', fetch: 'airtable' },


            'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/e39a43ca-d9bb-45e7-9d77-98b74c760132.png?id=39152004' },
            'Promo Banner': { value: '{CC Banner}' },

            'Join Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/ebc6170c-997c-4524-8966-2a9b9560b003.png?id=39155954' },
            'CC Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/1f3fce1d-b0eb-403b-8208-22a6e5f973aa.png?id=39155955' },
            'Talk Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/4bb37918-285f-41cb-81fc-0d56d83e8e7a.png?id=39155957' },
            'Story Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/d75991ce-e0c7-481d-98fd-6a4842bc167f.png?id=39155958' },
            'Measure Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/a8b62678-c8d0-46e2-a245-0b6d4c97c93f.png?id=39155956' },

        },
        'Email Type:Today\'s Session': {
            settings: {
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1iRsenQPN-SaZggLQU5o2L4WOM1a5-GgZ/edit' },
            },
            'Topic:Topic 1': { settings: { 'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/1Dy_7_M6xvf9mTN5YD4r6s5tctHjmZb2-mr09-AdZE2g/edit?usp=share_link' } } },
            'Topic:Topic 2': { settings: { 'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/1o_regKE4wutOUuFYOPRjZKiP9uTYhuLZ5pd9QRWoDkY/edit?usp=share_link' } } },
            'Topic:Topic 3': { settings: { 'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/1xiwrFrUexIoAuPYNW-IWcLuERScEhZDk8ckKAfD6K6A/edit?usp=share_link' } } },
            'Topic:Topic 4': { settings: { 'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/1K4OKwuy7A1qNGdnAJuD4YVLylZQx_bdYCaElizTX3no/edit?usp=sharing' } } },
            'Topic:Topic 5': { settings: { 'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/1haVAUgRTKaFTYCKq30l33DxtB91y7pvoOiOOVHWEIV8/edit?usp=share_link' } } },
            'Topic:Topic 6': { settings: { 'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/1dBb7Z_Dw5xbauiFCxQpr1DFf_SyrECHBoZtTnHDNjQc/edit?usp=share_link' } } },
            'Topic:Topic 7': { settings: { 'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/1HyGA0Y8g1y-5qD7yosf49thbNJ7JNwWfmQfNeh-f4fw/edit?usp=share_link' } } },
            'Topic:Topic 8': { settings: { 'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/1LAl9W8OUmMTVSzRayc-0Q9Am0YZP9BZm9IW2rh8N6Pw/edit?usp=share_link' } } },
        },
        'Email Type:Before Week': {
            settings: {
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1AADtzEALemQO0GF3__aAdCPSecjvtM6w/edit' },
            },
            'Next Week:Week 2': {
                settings: {
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/16Qm909uACdtFuExBaIjbVPhxP8Zq2feJ/edit' },
                }
            },
            'Is First Session Of Program': {
                'Week:Week 1': {
                    settings: {
                        'Source Reference Doc': { value: 'https://docs.google.com/document/d/1BeZMQwov2xBNC-qyIxrZJjOlnyxiUWDH/edit' },
                    }
                },
            },
        },
        'Cohort:Cohort 7': {
            settings: {
                'Automation ID': { value: '263', hide },
            }
        },
        'Cohort:Cohort 8': {
            settings: {
                'Automation ID': { value: '276', hide },
            }
        },
        'Cohort:Cohort 9': {
            settings: {
                'Automation ID': { value: '277', hide },
            }
        },
        'Cohort:Cohort 10': {
            settings: {
                'Automation ID': { value: '303', hide },
            }
        },
    },
    'Program:Visions': {
        settings: {
            'Program Name': { value: 'Craft + Lead a Strategic UX Vision', hide },
            'Program Website': { value: 'https://visions.centercentre.com', hide },

            'Send Type': { value: 'AUTOMATION', hide },
            'Template': { value: '/workshop', part: 1 },
            'Email Name': { value: '{Cohort} ', part: 1 },

            'Link Color': { value: '#662547', hide },


            'Calendar Table ID': { value: 'tblwWOJncBNkBEOie', hide },
            'Topic Table ID': { value: 'tbl60eXcCEU581e7v', hide },

            'Airtable Topic Query': { value: '{Airtable URL}/{Topic Table ID}?filterByFormula=SEARCH("{Topic}", %7BName%7D)', hide },
            'Description': { value: '{Airtable Topic Query}&fields[]=Description', fetch: 'airtable' },


            'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/21e7b6b8-1f65-4979-b0ee-53a27fd4397d.png?id=39152005' },
            'Promo Banner': { value: '{CC Banner}' },

            'CC Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/e2491d91-f9cd-4f27-a2bb-907510f6246a.png?id=39155845' },
            'Power Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/6bb91c92-d43f-45c7-8446-a58841963974.png?id=39155846' },
            'Join Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/87a4b268-dec1-41ca-8c6a-e9e4913fb19e.png?id=39155847' },
        },
        'Email Type:Today\'s Session': {
            settings: {
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1N0pXqqE1760ciCiO5AT-Lk3Sud-9HwNGVCdwctWYLLs/edit' },
            },
            'Topic:Topic 1': {
                settings: {
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/1q3RsyLF3ayTMuCYbWaZyFlY0S-nNyL1q2uLtyCz4mO8/edit?usp=share_link' },
                    'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/1xzlb3nqHyFjtdNH5VQ3nVuEWrviMgzhHagLnLI5-ooo/edit' }
                }
            },
            'Topic:Topic 2': {
                settings: {
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/13W9orpxBNQ9CK5O5DDKFC1edoGf5w-tgTPCRoUyeh20/edit?usp=share_link' },
                    'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/19oDEn9PjvUcutzCw5LBixXU1OmirrIkSop5VHUaX_u0/edit' }
                }
            },
            'Topic:Topic 3': {
                settings: {
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/1yGLuA-To8eEw3yjhYDht-JuR17lJ2eThiQu_B-H9rP4/edit?usp=share_link' },
                    'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/1ZRHh_fVzooJeujRto6yrGv7qlz-83MCRu2TqjanwtKk/edit?tab=t.0#heading=h.m3vfswnu9y08' }
                }
            },
            'Topic:Topic 4': {
                settings: {
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/1zUcI1V5zzWkTYBgDfMBYLmC6JDhrHhD3AoplB-nuWdQ/edit?usp=share_link' },
                    'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/1j8mpwfcxdSm0aAn48Urngt0bddt3wKylZhQcNg83OjQ/edit?tab=t.0#heading=h.m3vfswnu9y08' }
                }
            },
            'Topic:Topic 5': {
                settings: {
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/1YaI1rSLWBaDja7A47Ikzoh5Yrb_Vw-bNRERZtD_-itw/edit?usp=share_link' },
                    'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/1o0a9KpyzoAHDdti02awuUrknywd540ZAKkIdbCgcqcA/edit?tab=t.0#heading=h.m3vfswnu9y08' }
                }
            },
            'Topic:Topic 6': {
                settings: {
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/16SX0a90Pw3_zcK-fHc5p-s_0NBJLuiHlHK7F2DpF5FI/edit?usp=share_link' },
                    'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/1MB0Z-llczObDAyf6ny0wYNFpmKMo3MfyWpSOn_cyQrc/edit?tab=t.0#heading=h.m3vfswnu9y08' }
                }
            },
            'Topic:Topic 7': {
                settings: {
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/1PxmUdg9oDVdGbJ7T6v6N6dPrTpkrh-6xaFEzsW-py1E/edit?usp=share_link' },
                    'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/1UQQFkCa7-QufEWdB2do0DgdFwBYymiMFFX3vKhEMnBg/edit?tab=t.0#heading=h.m3vfswnu9y08' }
                }
            },
            'Topic:Topic 8': {
                settings: {
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/153-uZmIyIsbGoaxi6E_eokj3WOIqL3A_CcjUBZ7xbwo/edit?usp=share_link' },
                    'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/1FOtRBsH1kZ6kcvenulQgb2Nmj0jEr7lWDKs9OPzUwvw/edit?tab=t.0#heading=h.m3vfswnu9y08' }
                }
            },
        },
        'Email Type:Before Week': {
            settings: {
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1coEOwxO9nzfl-ynGHjp5Lvy6ar9bG_9x3kEiUZwGvW4/edit?usp=share_link' },
            },
            'Next Week:Week 3': { settings: { 'Source Reference Doc': { value: 'https://docs.google.com/document/d/1wyRv5-iC-3ClRwoXnJa-YUBcsBUsIS0AoJSlDncGZ54/edit' }, } },
            'Next Week:Week 4': { settings: { 'Source Reference Doc': { value: 'https://docs.google.com/document/d/1skINRI0k61iNsHO49sdfLARbB4x_mGlXhDF9C01ZeKA/edit?usp=share_link' }, } },
            'Next Week:Week 2': {
                settings: {
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/1A2-nVthQMAT0pMUH-zGqZh43606jSX6GjDph8v8M9Yc/edit' },
                }
            },
            'Is First Session Of Program': {
                'Week:Week 1': {
                    settings: {
                        'Source Reference Doc': { value: 'https://docs.google.com/document/d/1dhD6E9tWpHTyEZiogDPoOpO5oLg9sClG3CO3QpeyF6A/edit' },
                    }
                },
            },
        },
        'Cohort:Cohort 1': {
            settings: {
                'Automation ID': { value: '286', hide },
            }
        },
        'Cohort:Cohort 2': {
            settings: {
                'Automation ID': { value: '287', hide },
            }
        },
    },
    'Program:Research': {
        settings: {
            'Program Name': { value: 'Advanced Strategic UX Research', hide },
            'Program Website': { value: 'https://ux-research.centercentre.com', hide },

            'Send Type': { value: 'AUTOMATION', hide },
            'Template': { value: '/workshop', part: 1 },
            'Email Name': { value: '{Cohort} ', part: 1 },

            'Link Color': { value: '#ec621d', hide },
            'Accent Color': { value: '5e2946', hide },

            'Calendar Table ID': { value: 'tblZQZRiPOJz4MTkv', hide },
            'Topic Table ID': { value: 'tbldSCPFTa8UD58WI', hide },

            'Airtable Topic Query': { value: '{Airtable URL}/{Topic Table ID}?filterByFormula=SEARCH("{Topic}", %7BName%7D)', hide },
            'Description': { value: '{Airtable Topic Query}&fields[]=Description', fetch: 'airtable' },


            'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/456eae66-13b7-4fd1-b959-8d5a9c35e40a.png?id=39152003' },
            'Promo Banner': { value: '{CC Banner}' },

            'Join Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/0301c615-22d1-4b7e-9e27-655aa7e17b40.png?id=39155894' },
            'CC Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/2d2dbb0d-4ecb-4b57-beca-785d89ed3b8b.png?id=39155896' },
            'Measure Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/4ef2e9b5-365e-40c3-99ff-118f1d21fe0b.png?id=39155897' },

        },
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
        'Email Type:Before Week': {
            settings: {
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1GTwZUhhdJjiuPnWKLeEDcHRG1lX9gJG1mAk3CcogpPM/edit' },
            },
            'Next Week:Week 2': {
                settings: {
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/1PxBRnXcGjY6ytzlTL4Xuvt63T8LtGHzPJM3gQywb7Sk/edit' },
                }
            },
            'Is First Session Of Program': {
                'Week:Week 1': {
                    settings: {
                        'Source Reference Doc': { value: 'https://docs.google.com/document/d/1Vb5Q1FB2rumreNblfrK_qX-QyshoY9Wx3LCIjjrQm94/edit' },
                    }
                },
            },
        },
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
    'Program:Win': {
        settings: {
            'Program Name': { value: 'How to Win Stakeholders & Influence Decisions', hide },
            'Program Website': { value: 'https://winstakeholders.com', hide },

            'Send Type': { value: 'AUTOMATION', hide },
            'Template': { value: '/win', part: 1 },
            'Email Name': { value: '{Cohort (3 Letters)} ', part: 1 },

            'Link Color': { value: '#a5473d', hide },
            'Accent Color': { value: '8c9a29', hide },
            'Link Text Decoration': { value: 'none' },
            'Font': { value: 'arial', hide },

            'Pillar': { value: '{Topic}' },

            'Calendar Table ID': { value: 'tblVtIK7hg8LOJfZd', hide },
            'Cohort Table ID': { value: 'tblEQ09wfPRDZdXtN', hide },

            'Footer Email Reason': { value: `You're receiving this email because you're a member of the {Cohort (First Word)} cohort of the {Program Name} Online Course.` },
            'Footer Tag': { value: `{Cohort (Caps)(3 Letters)}` },

            'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/9bc6efed-4308-42b8-8e92-c9a887702c61.png?id=39152002' },
            'Promo Banner': { value: '{Rocket Banner}', hide },

            'Star Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/dec3bec9-f5a4-44f1-abdb-a256bd168d7a.png?id=39155998' },
            'Join Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/4756c528-8308-4f1b-a870-2a9c8dd8aa1b.png?id=39155999' },
            'Talk Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/c0ea1a89-f749-42a9-ae81-d332460b5b72.png?id=39156000' },
            'Coach Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/a7c536f3-19a0-47dd-a3e1-4639bc17d4fd.png?id=39156001' },
            'Jared Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/dfcf1d99-748d-4bb9-9af3-d4479dd93752.png?id=39156002' },
            'Rocket Banner': { value: 'https://zetcej.stripocdn.email/content/guids/CABINET_ce778d85eefd06da75cd81462959769460c5adf56a7a55ed3017bf35314437e0/images/ioijfyes_93O.png', hide },
        },
        'Email Type: Content': {
            settings: {
                'Link Color': { value: '#8c9a29', hide },
                'Link Text Decoration': { value: 'underline', hide },
            },
        },
        'Email Type: Vessel': {
            settings: {
                'Link Color': { value: '#8c9a29', hide },
                'Link Text Decoration': { value: 'underline', hide },
                'Button': { value: '{Program Name}' },
            },
        },
        'Session Type:Live Lab 1': {
            settings: {
                'Lab': { value: 'Lab 1' },
            }
        },
        'Session Type:Live Lab 2': {
            settings: {
                'Lab': { value: 'Lab 2' },
            }
        },
        // Cohort-based recording links (just for Pillar 1 and Pillar 2, as they are all in one place in MN);
        'Week:Week 2': {
            settings: {
                'Week 1 Session #1 Recording Link': { value: '{Airtable URL}/{Cohort Table ID}?filterByFormula=SEARCH("{Cohort}", %7BCohort%7D)&fields[]=Pillar 1 Session Recordings', fetch: 'airtable' },
            }
        },
        'Week:Week 3': {
            settings: {
                'Week 2 Session #1 Recording Link': { value: '{Airtable URL}/{Cohort Table ID}?filterByFormula=SEARCH("{Cohort}", %7BCohort%7D)&fields[]=Pillar 1 Session Recordings', fetch: 'airtable' },
            }
        },
        'Week:Week 4': {
            settings: {
                'Week 3 Session #1 Recording Link': { value: '{Airtable URL}/{Cohort Table ID}?filterByFormula=SEARCH("{Cohort}", %7BCohort%7D)&fields[]=Pillar 2 Session Recordings', fetch: 'airtable' },
            }
        },
        'Week:Week 5': {
            settings: {
                'Week 4 Session #1 Recording Link': { value: '{Airtable URL}/{Cohort Table ID}?filterByFormula=SEARCH("{Cohort}", %7BCohort%7D)&fields[]=Pillar 2 Session Recordings', fetch: 'airtable' },
            }
        },
        // Email-specific settings
        'Email Type:Homework': {
            settings: {
                'Email Name': { value: '{Topic} {Lab}', part: 2 },
                'Subject': { value: 'Win Program {Topic}. {Title}' },
                'Share Reviews By': { value: 'Cohort' },
                'Last Session Phrase': { value: 'This past week in our', hide },
            },
            'Topic:Pillar 1': {
                settings: {
                    'Share Reviews By': { value: '' },
                }
            },
            'Topic:Pillar 2': {
                settings: {
                    'Share Reviews By': { value: '' },
                }
            },
            'Session Type:Live Lab 1': {
                settings: {
                    'Template': { value: '/homework-pillar-x-lab-1.html', part: 2 },
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/1sDODxhDrRbsuUEPpw0J9S4eoah5U3L6QQ18Y2E2h_YQ/edit' },
                    'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9490127', hide },
                }
            },
            'Session Type:Live Lab 2': {
                settings: {
                    'Template': { value: '/homework-pillar-x-lab-2.html', part: 2 },
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/1VDqUYv84Js2kSDbKEcGKpLXbyi_-_43bZlfNNdXxnms/edit' },
                    'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9488844', hide },
                }
            },
            'Session Type:Wrap Up': {
                settings: {
                    'Email Name': { value: 'Wrap Up', part: 2 },
                    'Template': { value: '/wrap-up.html', part: 2 },
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/1WRBaWwntGWSlp2Nla-OB6YLqh-L3hMPcGyLLFnvczxM/edit?tab=t.0#heading=h.izz3rfn15qfa' },
                    'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9496698', hide },

                }
            },
            'Is First Session Of Program': {
                settings: {
                    'Template': { value: '/homework-pillar-1-lab-1.html', part: 2 },
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/1KDQbgOjxdiy3WKIfaQmk2QLLDJQoUcZOx1ANLVkHh1I/edit' },
                    'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9488843', hide },
                }
            },
        },
        'Is Transition': {
            settings: {
                'Email Name': { value: ' Transition', part: 3 },
                'Session Note': { value: `<br><br>​<em>Note: Your sessions will now start two hours later, at <strong>{First Date (h:mma z)(:00)} ({First Date (HH.mm z)(GMT)})</strong> or <strong>{Second Date (h:mma z)(:00)} ({Second Date (HH.mm z)(GMT)})</strong>. You'll be joining the {New Sibling Cohort #1} and {New Sibling Cohort #2} cohorts for {Topic}. {Lab}.<br></em>`, hide },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1dx6wwS_Swm4zSsOMsI_lM0xrgc0HBwWolDdjufQohpg/edit?usp=sharing' },
            }
        },
        'Is After Break': {
            settings: {
                'Email Name': { value: ' After Break', part: 3 },
                'Last Session Phrase': { value: 'Last time we met for' },
            }
        },
        'Email Type:Before Break': {
            settings: {
                'Email Name': { value: 'Before Break', part: 2 },
                'Subject': { value: 'Win Program: Break {Break Range}' },
                'Share Reviews By': { value: 'Cohort' },
                'Template': { value: '/before-break.html', part: 2 },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1XpRHEBaYCzGyWJ-BH_eWtXhT4Mo1dlsQUNHo8q6QUtI/edit' },
                'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9695433', hide },
            },
            'Topic:Pillar 1': {
                settings: {
                    'Share Reviews By': { value: '' },
                }
            },
            'Topic:Pillar 2': {
                settings: {
                    'Share Reviews By': { value: '' },
                }
            },
            'Is Transition': {
                settings: {
                    'Session Note': {
                        value: `<em>Note: Your sessions will now start two hours later, at <strong>{{Week (+{Break Length(+1)})} Session #1 First Date (h:mma z)(:00)} ({{Week (+{Break Length(+1)})} Session #1 First Date (HH.mm z)(GMT)})</strong> or <strong>{{Week (+{Break Length(+1)})} Session #1 Second Date (h:mma z)(:00)} ({{Week (+{Break Length(+1)})} Session #1 Second Date (HH.mm z)(GMT)})</strong>. You'll be joining the {New Sibling Cohort #1} and {New Sibling Cohort #2} cohorts for {{Week (+{Break Length(+1)})} Session #1 Topic}. {{Week (+{Break Length(+1)})} Session #1 Lab}.</em><br/><br/>`, hide
                    },
                    'Break Note': { value: '<br/><em>Note: When we return from break, you will join the larger program group.</em>', hide },
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/1_Bnz3wAmMYH-JZ7MS6J3kuLsO1WbJh3fY-spccKqOec/edit?tab=t.0' },
                }
            }
        },
        'Email Type:First Lab Reminder': {
            settings: {
                'Email Name': { value: 'First Reminder', part: 2 },
                'Subject': { value: 'Win Program: Upcoming live session!' },
                'Template': { value: '/first-lab-reminder.html', part: 2 },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1MXgQs2UXgDbbmf0ZvW9k6k5pGBECgs30A_uWNkjFI5Y/edit?usp=share_link' },
                'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9046397', hide },
            },
        },
        'Email Type:Onboarding': {
            settings: {
                'Email Name': { value: 'Onboarding', part: 2 },
                'Subject': { value: 'Let’s get started! How to Win Stakeholders & Influence Decisions Program.' },
                'Template': { value: '/onboarding.html', part: 2 },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1bzrNfDyBpN9TjA2qdqhurm57mlisKffNWZADlRcKdGw/edit' },
                'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9540162', hide },

            },
        },
        'Email Type:Welcome': {
            settings: {
                'Email Name': { value: 'Welcome', part: 2 },
                'Subject': { value: 'Welcome to How to Win Stakeholders & Influence Decisions Program!' },
                'Template': { value: '/welcome.html', part: 2 },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1vGnH3X_0synDw5-r2tbV21B94XiPqNVeBVjBRfyUWEk/edit' },
                'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9540161', hide },
            },
        },
        'Email Type:Wrap Up': {
            settings: {
                'Email Name': { value: 'Wrap Up', part: 2 },
                'Subject': { value: 'Program Off-Boarding, Support, and Next Steps.' },
                'Template': { value: '/wrap-up.html', part: 2 },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1qNN47LexqXBO6HWVOiGewCGdTmgFYOepeKs11Jky4RA/edit?tab=t.0#heading=h.izz3rfn15qfa' },
                'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9496698', hide },
            },
        },
        'Email Type:Certificate': {
            settings: {
                'Email Name': { value: 'Certificate', part: 2 },
                'Subject': { value: 'Your Certificate for The How to Win Stakeholders & Influence Decisions program' },
                'Template': { value: '/win/certificate.html', part: 1 },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1ak_mQJ_mBQkSi7gwoYJO2s5CHOUejvXvUnypv2CNCvo/edit' },
                'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9496699', hide },
            },
        },
        'Email Type:Extension Details': {
            settings: {
                'Email Name': { value: 'Extension Details', part: 2 },
                'Subject': { value: 'Extend Your Access to Our How to Win Stakeholders and Influence Decisions Program.' },
                'Template': { value: '/extension-details.html', part: 2 },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1woSv4H2wFdyDgG_fjzglTO_7rdbbKZRQrQyfPqYNf38/edit?' },
                'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9496700', hide },
            }
        },
        'Email Type:Receipt': {
            settings: {
                'Source Reference Doc': { value: 'https://docs.google.com/document/u/0/d/12iiLZhO0Y_GIWi9oV3zOL3RQy-1Wgi1_kHX8UBoXjX0/edit' },
            }
        },
        'Cohort:April 2025': {
            settings: {
                'Automation ID': { value: '273', hide },
            }
        },
        'Cohort:January 2025': {
            settings: {
                'Automation ID': { value: '205', hide },
            }
        },
        'Cohort:February 2025': {
            settings: {
                'Automation ID': { value: '255', hide },
            }
        },
        'Cohort:March 2025': {
            settings: {
                'Automation ID': { value: '260', hide },
            }
        },
        'Cohort:May 2025': {
            settings: {
                'Automation ID': { value: '294', hide },
            }
        },
        'Cohort:June 2025': {
            settings: {
                'Automation ID': { value: '299', hide },
            }
        },
        'Cohort:July 2025': {
            settings: {
                'Automation ID': { value: '300', hide },
            }
        },
        'Cohort:August 2025': {
            settings: {
                'Automation ID': { value: '319', hide },
            }
        },
    },
    'Program:LoA': {
        settings: {
            'Send Type': { value: 'CAMPAIGN', hide },
            'Program Name': { value: 'Leaders of Awesomeness', hide },

            'Template': { value: '/loa', part: 1 },


            'Footer Email Reason': { value: `You're receiving this email because you're a member of Leaders of Awesomeness.` },
            'Footer Contact': { value: `If you have questions about the community, contact us at <a href="mailto:hello@centercentre.com" style="color:{Footer Color} !important;text-decoration:underline !important" class="footer-text">hello@centercentre.com</a>.` },
            'Footer Tag': { value: `LOA` },

            'List ID': { value: '{LoA ID}', hide },
            'Segment ID': { value: '{LoA Segment ID}', hide },

            'Link Text Decoration': { value: '' },
            'Link Color': { value: '#4293a4' },
        }
    },
    'Program:TUXS': {
        settings: {
            'Send Type': { value: 'CAMPAIGN', hide },
            'Email Name': { value: '{Email Type}', part: 1 },

            'Template': { value: '/tuxs', part: 1 },

            'Footer Email Reason': { value: `You're receiving this email because you're a member of Leaders of Awesomeness.` },
            'Footer Contact': { value: `If you have questions about the community, contact us at <a href="mailto:hello@centercentre.com" style="color:{Footer Color} !important;text-decoration:underline !important" class="footer-text">hello@centercentre.com</a>.` },
            'Footer Tag': { value: `LOA` },

            'List ID': { value: '{LoA ID}', hide },
            'Segment ID': { value: '{LoA Segment ID}', hide },



            'Calendar Table ID': { value: 'tbl6T80hI7yrFsJWz', hide },
            'Session Title': { value: '{Airtable Session Query}&fields[]=Title', fetch: 'airtable' },
            'Description': { value: '{Airtable Session Query}&fields[]=Description', fetch: 'airtable' },
            'Session Type': { value: '{Airtable Session Query}&fields[]=Topic Type', fetch: 'airtable' },

            'Global Styles': { value: ' ul [ margin-bottom: 1.5rem !important; ] ', part: 1 },

        },
        'Email Type:Today': {
            settings: {
                'Template': { value: '/today.html', part: 2 },
                'Subject': { value: 'Today: {Session Title}' },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1DEU65xOzfjHrHfB8TCotSoeDN4ERclAcqYynn0yUpWw/edit' },
                'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9491072', hide },

                'Preview': { value: '{Airtable Session Query}&fields[]=Preview', fetch: 'airtable', part: 0 },

            },
            // Banner Settings
            'Session Type:Job Search Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/95fddc5d-1565-4ace-8067-ce00e6f3e236.png?id=39120976' }, } },
            'Session Type:Metrics Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/7bab398d-0da2-4fa8-8db2-e3722476bbb5.png?id=39120977' }, } },
            'Session Type:Research Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/799c6af9-72d1-4c02-9b3e-48c6a05462d2.png?id=39120975' }, } },
            'Session Type:Win Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/661e13f2-952e-4f64-ae67-7455592fc53d.png?id=39120979' }, } },
            'Session Type:Vision Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/ef883949-c485-4551-bcac-7e63d185b3a0.png?id=39120978' }, } },
            'Session Type:AI Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/07/02/67ff76ea-642b-4721-aff9-aacc587b25e8.png?id=40219538' }, } },
        },
        'Email Type:Recording': {
            settings: {
                'Template': { value: '/recording.html', part: 2 },
                'Subject': { value: 'Recording: {Session Title}' },
                'Questions': { value: '**Questions From the Session:**' },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1V7suWAFtLFw4OKAAP8dcOE0hRRNdFBtGqxJg1nl-IGY/edit' },
                'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9491094', hide },

                'Preview': { value: '{Airtable Session Query}&fields[]=Preview', fetch: 'airtable', part: 0 },


            },
            // Banner Settings
            'Session Type:Job Search Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/43e4647c-9c6d-44ed-974a-9afaa9cf867c.png?id=39120942' }, } },
            'Session Type:Metrics Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/0c8125fe-ab98-4700-a44c-93d259f42026.png?id=39120940' }, } },
            'Session Type:Research Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/66bdae7d-f06e-4efe-8166-9a75ca75870a.png?id=39120943' }, } },
            'Session Type:Win Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/1936e392-5619-4048-b663-1e3a691df378.png?id=39120939' }, } },
            'Session Type:Vision Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/46e37013-49b9-4334-a5c7-67965201938d.png?id=39120941' }, } },
            'Session Type:AI Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/07/02/51156b8b-bb19-4889-a941-87d93b2be818.png?id=40219554' }, } },
        },
        'Email Type:New Topic': {
            settings: {
                'Template': { value: '/new-topic.html', part: 2 },
                'Subject': { value: 'This Monday: {Session Title}' },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1AyFiVg5h6LxHYHYQ_NBdAiCAKPGVCDh2g95bh-dwAgk/edit' },
                'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9490112', hide },

                'Preview': { value: '{Airtable Session Query}&fields[]=Preview', fetch: 'airtable', part: 0 },

            },
            // Banner Settings
            'Session Type:Job Search Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/bbcd6fc6-290a-4e6b-a8e7-ecf802100916.png?id=39120554' }, } },
            'Session Type:Metrics Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/33d64055-b14d-48df-8765-970f1cd15b23.png?id=39120556' }, } },
            'Session Type:Research Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/9557c441-0626-45d4-95bf-15d762f9b12c.png?id=39120557' }, } },
            'Session Type:Win Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/44ab5264-62d7-47cb-bf51-6b1634ff07f6.png?id=39120553' }, } },
            'Session Type:Vision Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/9c31bc20-2032-4d9e-9d7f-ebb6969c9f54.png?id=39120555' }, } },
            'Session Type:AI Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/07/02/c736a2f2-be3c-450f-8abd-e683b3c4049e.png?id=40219568' }, } },
        },
        // Topic settings
        'Session Type:Job Search Topic': {
            settings: {
                'Primary Color': { value: '00a1b3' },
                'Accent Color': { value: 'eb621d' },
                'Banner Topic': { value: 'Job Search' },
            }
        },
        'Session Type:Metrics Topic': {
            settings: {
                'Primary Color': { value: '9b0e5b' },
                'Accent Color': { value: '00a1b3' },
                'Banner Topic': { value: 'Metrics' },

            }
        },
        'Session Type:Research Topic': {
            settings: {
                'Primary Color': { value: '662547' },
                'Accent Color': { value: '00a1b3' },
                'Banner Topic': { value: 'Research' },
            }
        },
        'Session Type:Win Topic': {
            settings: {
                'Primary Color': { value: '00a1b3' },
                'Accent Color': { value: '8c9b29' },
                'Banner Topic': { value: 'Influence' },
            }
        },
        'Session Type:Vision Topic': {
            settings: {
                'Primary Color': { value: '00a1b3' },
                'Accent Color': { value: '9b0e5b' },
                'Banner Topic': { value: 'Vision' },
            }
        },
        'Session Type:AI Topic': {
            settings: {
                'Primary Color': { value: '00a1b3' },
                'Accent Color': { value: 'bc2123' },
                'Banner Topic': { value: 'AI' },
            }
        },
        'Email Type:Upcoming Topics': {
            settings: {
                'Template': { value: '/upcoming-topics.html', part: 2 },
                'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/667ec838-028d-4112-8be2-fe1effc217f9.png?id=39120670' },
                'Subject': { value: 'Upcoming: {Upcoming Session #1 Title}, {Upcoming Session #2 Title}, {Upcoming Session #3 Title}' },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1NLFu-FcTj4MFt5fHP-TDROtWwvziAH9zOueZ54GqgIo/edit' },
                'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9623518', hide },

                'Preview': { value: 'Every week, join me for a free, live discussion about UX Strategy.' },

                'Session Entries': {
                    value: `<table cellpadding="0" cellspacing="0" width="100%" bgcolor="#0C6D77" style="background-color: #0c6d77; border-radius: 10px; border-collapse: separate">
            <tbody>
            {Session Entry (Iterate x{Number of Upcoming Sessions})}
            </tbody>
            </table>`, hide
                },

                'Session Entry': {
                    value: `<tr>
                <td align="left" esd-tmp-menu-font-family="&#39;open sans&#39;,&#39;helvetica neue&#39;,helvetica,arial,sans-serif" esd-tmp-divider="0|solid|#000000" esd-tmp-menu-color="#ffffff" esd-tmp-menu-padding="0|10" esd-tmp-menu-font-size="16px" esd-tmp-menu-font-weight="bold" class="esd-block-menu">
                  <table cellspacing="0" width="100%" cellpadding="0">
                    <tbody>
                      <tr>
                        <td valign="left" id="esd-menu-id-0" class="esd-block-menu-item" style="text-align:center;width:28%;min-width:125px;max-width:130px">
                          <span class="es-button-border" style="border-width:0px;background:#9b0e5b;border-radius:5px">
                            <a target="_blank" href="[Upcoming Session #1 Event Link]" class="es-button es-button-1724857678642" style="font-weight:bold;padding:10px 20px;font-size:24px;border-radius:5px;white-space:nowrap;background:#0196a7;font-family:&quot;open sans&quot;, &quot;helvetica neue&quot;, helvetica, arial, sans-serif;color:#ffffff !important;text-decoration:none">
                              RSVP
                            </a>
                          </span>
                        </td>
                        <!-- Left Column -->
                        <td align="left" valign="top" id="esd-menu-id-1" class="esd-block-menu-item" style="padding:20px 20px 20px 0px;width:100%;max-width:300px">
                          <a target="_blank" href="[Upcoming Session #1 Event Link]" style="line-height:28px;text-decoration:none;color:#ffffff;font-size:17px;font-family:&quot;open sans&quot;, &quot;helvetica neue&quot;, helvetica, arial, sans-serif;display:inline-block">
                            [Upcoming Session #1 Date (dddd, MMMM D)] at Noon [Upcoming Session #1 Date (z)] ([Upcoming Session #1 Date (GMT)(HH.mm z)])
                            <br>
                            <strong>
                              [Upcoming Session #1 Title].
                            </strong>
                          </a>
                        </td>
                        <!-- Right Column -->
                      </tr>
                    </tbody>
                  </table>
                </td>
            </tr>`, hide
                },
            }
        },
        'Email Type:Onboarding Topics': {
            settings: {
                'Template': { value: '/upcoming-topics.html', part: 2 },
                'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/667ec838-028d-4112-8be2-fe1effc217f9.png?id=39120670' },
                'Subject': { value: 'FREE Talk UX Strategy sessions for you to join.' },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1NLFu-FcTj4MFt5fHP-TDROtWwvziAH9zOueZ54GqgIo/edit' },
                'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9496120', hide },

                'Preview': { value: 'Every week, join me for a free, live discussion about UX Strategy.' },

                // 'Send Type': { value: 'AUTOMATION', hide },


                'Session Entries': {
                    value: `<table cellpadding="0" cellspacing="0" width="100%" bgcolor="#0C6D77" style="background-color: #0c6d77; border-radius: 10px; border-collapse: separate">
            <tbody>
            {Session Entry (Iterate x{Number of Upcoming Sessions})}
            </tbody>
            </table>`, hide
                },

                'Session Entry': {
                    value: `<tr>
                <td align="left" esd-tmp-menu-font-family="&#39;open sans&#39;,&#39;helvetica neue&#39;,helvetica,arial,sans-serif" esd-tmp-divider="0|solid|#000000" esd-tmp-menu-color="#ffffff" esd-tmp-menu-padding="0|10" esd-tmp-menu-font-size="16px" esd-tmp-menu-font-weight="bold" class="esd-block-menu">
                  <table cellspacing="0" width="100%" cellpadding="0">
                    <tbody>
                      <tr>
                        <td valign="left" id="esd-menu-id-0" class="esd-block-menu-item" style="text-align:center;min-width:130px;max-width:130px">
                          <span class="es-button-border" style="border-width:0px;background:#9b0e5b;border-radius:5px">
                            <a target="_blank" href="[Upcoming Session #1 Event Link]" class="es-button es-button-1724857678642" style="font-weight:bold;padding:10px 20px;font-size:24px;border-radius:5px;white-space:nowrap;background:#0196a7;font-family:&quot;open sans&quot;, &quot;helvetica neue&quot;, helvetica, arial, sans-serif;color:#ffffff !important;text-decoration:none">
                              RSVP
                            </a>
                          </span>
                        </td>
                        <!-- Left Column -->
                        <td align="left" valign="top" id="esd-menu-id-1" class="esd-block-menu-item" style="padding:20px 20px 20px 0px;min-width:300px;max-width:300px">
                          <a target="_blank" href="[Upcoming Session #1 Event Link]" style="line-height:28px;text-decoration:none;color:#ffffff;font-size:17px;font-family:&quot;open sans&quot;, &quot;helvetica neue&quot;, helvetica, arial, sans-serif;display:inline-block">
                            [Upcoming Session #1 Date (dddd, MMMM D)] at Noon [Upcoming Session #1 Date (z)] ([Upcoming Session #1 Date (GMT)(HH.mm z)])
                            <br>
                            <strong>
                              [Upcoming Session #1 Title].
                            </strong>
                          </a>
                        </td>
                        <!-- Right Column -->
                      </tr>
                    </tbody>
                  </table>
                </td>
            </tr>`, hide
                },
            }
        },
        // DST Banner overrides
        'Is DST': {
            settings: {
            },
        },
    },
    'Program:Maven': {
        settings: {
            'Course Link': { value: 'https://www.maven.com/courses/how-to-win-stakeholders-and-influence-decisions' },
        },
        'Email Type:Lightning Talk': {
            settings: {
                'Send Type': { value: 'CAMPAIGN', hide },
                'Email Name': { value: 'Lightning Talk', part: 1 },
                'Template': { value: '/maven/lightning-talk.html', part: 1 },
                'Send To': { value: 'LoA', hide },

                'Subject': { value: 'TODAY: {Title}' },
                'Preview': { value: '⚡️ Going live for a free Lightning Talk on Maven' },

                'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9792363', hide },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1US3XMScU1sF2qrRTTCVMT8iLmEdSaoSINo1gkny1Yvk/edit?tab=t.0' },
            }
        },
        'Email Type:Vessel': {
            settings: {
                'Promo Banner': { value: 'https://content.app-us1.com/O8aW3/2025/06/04/83f01f0d-0e49-4d7e-bfac-8b61142dc247.png?id=39727400' },
                'Banner Alt': { value: 'UX & Design in an AI World; Host Jared Spool' },
                'Program Website': { value: 'https://maven.com/centercentre/uxai' },
                'Link Color': { value: '#bd1f23' },
            }
        },
        'Email Type:Content': {
            settings: {
                'Promo Banner': { value: 'https://content.app-us1.com/O8aW3/2025/06/04/83f01f0d-0e49-4d7e-bfac-8b61142dc247.png?id=39727400' },
                'Banner Alt': { value: 'UX & Design in an AI World; Host Jared Spool' },
                'Program Website': { value: 'https://maven.com/centercentre/uxai' },
                'Link Color': { value: '#bd1f23' },
            }
        }

    },




    'Email Type: Vessel': {
        settings: {
            'Send Type': { value: 'CAMPAIGN', hide },
            'Email Name': { value: 'Vessel {Send To}', part: 1 },
            'Template': { value: '/workshop/vessel.html', part: 1 },
            'Banner': { value: '{Promo Banner}' },
            'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9518240', hide },


            'Button': { value: '{Program Name} Course Details' },
        },
        'Program:Win': {
            settings: {
                'Button': { value: '{Program Name}' },
                'Link Color': { value: '#646E1A' },
            }
        }
    },
    'Email Type: Content': {
        settings: {
            'Send Type': { value: 'CAMPAIGN', hide },
            'Email Name': { value: 'Content {Send To}', part: 1 },
            'Template': { value: '/workshop/content.html', part: 1 },
            'Banner': { value: '{Promo Banner}' },
            'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9553025', hide },
        },
        'Program:Win': {
            settings: {
                'Button': { value: '{Program Name}' },
                'Link Color': { value: '#646E1A' },
            }
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





    'Email Type:Receipt': {
        settings: {
            'Email Name': { value: '{Price Type} Receipt', part: 2 },
            'Subject': { value: 'Receipt: {Program Name} Online Course' },
            'Template': { value: '/workshop/receipt.html', part: 1 },
            'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9540829', hide },

            'Link Decoration': { value: 'underline' },


            'Company Insert': {
                value: `<p class="p_date v" style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:24px;letter-spacing:0;color:#333333;font-size:16px"> <br><strong>%COMPANY_NAME%</strong><br>VAT ID <em>(Optional)</em>: %TAX_ID%<br>%STREET_ADDRESS% </p> <p class="p_date v" style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:24px;letter-spacing:0;color:#333333;font-size:16px"> %CITY%, %STATE% %ZIP_CODE% </p> <p class="p_date v" style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:24px;letter-spacing:0;color:#333333;font-size:16px"> %COUNTRY% </p>`, hide
            },

        },
        'Price Type:Unemployed': {
            settings: {
                'Price Name': { value: 'Unemployed UXers Special Price' },
                'Price': { value: '$199.00' },
            }
        },
        'Price Type:Team': {
            settings: {
                'Price Name': { value: 'Team Member' },
                'Price': { value: '$399.00' },
            },
            'Program:Win': {
                settings: {
                    'Price Note': { value: '<em><strong>Please Note: </strong>This was a limited time offer of the special extra discounted price of <s>$2,397</s> <strong>$1,497</strong> for this program.</em>' },
                    'Price': { value: '$1,497.00' },
                }
            }
        },
        'Price Type:Individual': {
            settings: {
                'Price Name': { value: 'Individual Member' },
                'Price': { value: '$499.00' },
            },
            'Program:Win': {
                settings: {
                    'Price Note': { value: '<em><strong>Please Note: </strong>This was a limited time offer of the special extra discounted price of <s>$2,697</s> <strong>$1,697</strong> for this program.</em>' },
                    'Price': { value: '$1,697.00' },
                }
            }
        },
        'Program:Stand Out': {
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
        }
    },
    'Email Type:Confirmation': {
        settings: {
            'Email Name': { value: 'Confirmation', part: 2 },
            'Subject': { value: 'Next Steps: {Program Name} Online Course' },
            'Template': { value: '/workshop/confirmation.html', part: 1 },
            'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9548503', hide },


            'Source Reference Doc': { value: '' },
            'Link Color': { value: '' },
            'Link Decoration': { value: '' },

            'Space Name': { value: 'Online Course', hide },

        },
        'Program:Visions': { settings: { 'Confirmation Message': { value: `Together, let's bring to focus a clear vision of highly desirable experiences.` } } },
        'Program:Metrics': { settings: { 'Confirmation Message': { value: `<br/><br/>Outcome-driven UX Metrics focus you, your team, stakeholders, and executives on improving your customers' and users' lives.` } } },
        'Program:Research': { settings: { 'Confirmation Message': { value: `Together, let's lead your organization to become the foremost expert in your users and customers.` } } },
        'Program:Stand Out': {
            settings: {
                'Confirmation Message': { value: `The goal of the program is to take you to the next level of your UX career.` },
                'Space Name': { value: 'Stand Out Community' }
            }
        },
        'Program:Win': {
            settings: {
                'Template': { value: '/win/confirmation.html', part: 1 },
                'Link Decoration': { value: 'underline' },
            }
        }
    },

    'Send Type:AUTOMATION': {
        settings: {
            'Footer': { value: '{Transactional Footer}', hide },
        }
    },
    'Send Type:CAMPAIGN': {
        settings: {
            'Footer': { value: '{Marketing Footer}', hide },
        }
    },
};