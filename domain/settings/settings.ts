
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
    settings: {
        //default settings determine what variables each email type will inherit
        'Template': { value: './templates', part: 0, fetch: 'text' },
        'Base ID': { value: 'appHcZTzlfXAJpL7I', hide },
        'Airtable URL': { value: 'https://api.airtable.com/v0/{Base ID}', hide },
        'Airtable Session Query': { value: '{Airtable URL}/{Calendar Table ID}?filterByFormula=DATESTR(%7BDate%7D)="{Session Date (YYYY-MM-DD)}"', hide },
        'Settings Table ID': { value: 'tblDFifdIAEJzKFLS', hide },
        'Airtable Settings Query': { value: '{Airtable URL}/{Settings Table ID}?filterByFormula=SEARCH("{Program}", %7BProgram%7D)', hide },
        'Airtable Topic Query': { value: '{Airtable URL}/{Topic Table ID}?filterByFormula=SEARCH("{Topic}", %7BName%7D)', hide },

        'From Name': { value: 'Jared Spool', hide },
        'From Email': { value: 'jared.m.spool@centercentre.com', hide },
        'Reply To': { value: 'jared.m.spool@centercentre.com', hide },

        'Test Email': { value: 'accounts@centercentre.com', hide },

        'Email Name': { value: '{Program} ', part: 0, hide },
        'Email Name Shorthand': { value: '{Email Name (Shorthand)}', hide },
        'Email ID': { value: '{Send Date (YYYY-MM-DD)} {Email Name (Shorthand)}', hide },
        'Email Tag': { value: '{Send Date (YYYY-MM-DD)(Tag)}-{Email Name(Tag)}', hide },

        'Template Name': { value: '{Send Date (YYYY-MM-DD)} {Email Name (Shorthand)}', hide },
        'Campaign Name': { value: '{Send Date (YYYY-MM-DD)} {Email Name (Shorthand)}', hide },

        'Automation ID': { value: '226', hide }, // TEMP for testing


        'LoA ID': { value: '97', hide },
        'LoA Segment ID': { value: '1258', hide },
        'BL ID': { value: '108', hide },
        'BL Segment ID': { value: '0', hide },


        'Footer Email Reason': { value: `You're receiving this email because you're a member of {Cohort} of the {Program Name} Online Course.`, hide },
        'Footer Contact': { value: `If you have questions about the course, contact us at <a href="mailto:hello@centercentre.com" style="color:#666666 !important;font-size:12px">hello@centercentre.com</a>.`, hide },
        'Footer Tag': { value: `{Program (Caps)} {Cohort (Caps)}`, hide },
        'Footer': {
            value: `© Copyright 2025, Center Centre, Inc.<br/><br/><em>{Footer Email Reason}</em><br/><br/><em>{Footer Contact}</em><br/><br/>{Program (Caps)} {Cohort (Caps)}`, hide
        },

        'Link Text Decoration': { value: 'underline' },

        'Global Styles': { value: 'a [ color: {Link Color} !important; text-decoration: {Link Text Decoration} !important; ]', part: 0 },

        'Zoom Link': { value: '{Airtable Settings Query}&fields[]=Zoom Link', fetch: 'airtable', hide },
        'Zoom ID': { value: '{Airtable Settings Query}&fields[]=Zoom ID', fetch: 'airtable', hide },
        'Zoom Passcode': { value: '{Airtable Settings Query}&fields[]=Zoom Passcode', fetch: 'airtable', hide },
        'Community Link': { value: '{Airtable Settings Query}&fields[]=Community Link', fetch: 'airtable' },
        'Workshop Materials Link': { value: '{Airtable Settings Query}&fields[]=Workshop Materials Link', fetch: 'airtable' },
        'Community Join Link': { value: '{Airtable Settings Query}&fields[]=Community Join Link', fetch: 'airtable' },
        'Calendar Instructions Link': { value: '{Airtable Settings Query}&fields[]=Calendar Instructions Link', fetch: 'airtable', hide },
    },
    'Program:Stand Out': {
        settings: {
            'Program Name': { value: 'Stand Out: A Working Community for Unemployed UX Leaders', hide },
            'Program Website': { value: 'https://centercentre.com/stand-out/', hide },

            'Send Type': { value: 'AUTOMATION', hide },
            'Template': { value: '/standout', part: 1 },

            'Automation ID': { value: '226', hide },

            'Link Color': { value: '#ec621d' },


            'Calendar Table ID': { value: 'tbly8jzaHpb0hGfbj', hide },
            // 'Session Type': { value: '{Airtable Session Query}&fields[]=Session Type', fetch: 'airtable' },
            // 'Event Link': { value: '{Airtable Session Query}&fields[]=Event Link', fetch: 'airtable' },
            // 'Session Notes Link': { value: '{Airtable Session Query}&fields[]=Collab Notes Link', fetch: 'airtable' },

            'Footer Email Reason': { value: `You're receiving this email because you're a member of {Program Name}.` },
            'Footer Contact': { value: `If you have questions about the community, contact us at ` },
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
            settings: {
                'Email Name': { value: '{Session Type}', part: 1 },
            },
            'Session Type:Live Discussion': {
                settings: {
                    'Template': { value: '/today-live-discussion.html', part: 2 },
                    'Subject': { value: 'Today’s Stand Out Community Session' },
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/1AC2E0gWyShIPsZ7xHncWgjgolly3AwyxltTtVQLFoog/edit' },
                }
            },
            'Session Type:Materials Critique': {
                settings: {
                    'Template': { value: '/materials-critique.html', part: 2 },
                    'Subject': { value: 'Today’s Materials Critique Session' },
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/1LZaqUgGa5mIMKg3ZeS3DskPkqO1pBFND4suzQqpq0SE/edit' },
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

            'Link Color': { value: '#006f74' },


            'Calendar Table ID': { value: 'tblm2TqCcDcx94nA2', hide },
            'Topic Table ID': { value: 'tbl9BuLUVFytMYJeq', hide },

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
                'Email Name': { value: '{Topic}', part: 2 },

                'Template': { value: '/today.html', part: 2 },
                'Subject': { value: 'Outcome-Driven UX Metrics: {Week}: {Topic}: ​​{Title}' },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1iRsenQPN-SaZggLQU5o2L4WOM1a5-GgZ/edit' },
            }
        },
        'Email Type:Before Week': {
            settings: {
                'Email Name': { value: 'Before {Next Week}', part: 2 },

                'Template': { value: '/before-week-x.html', part: 2 },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1AADtzEALemQO0GF3__aAdCPSecjvtM6w/edit' },

                'Subject': { value: 'Outcome-Driven UX Metrics: {Next Week}: Topics {{Next Week} Session #1 Topic (#)} + {{Next Week} Session #2 Topic (#)}' },
            },
            'Next Week:Week 2': {
                settings: {
                    'Template': { value: '/before-week-2.html', part: 2 },
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/16Qm909uACdtFuExBaIjbVPhxP8Zq2feJ/edit' },

                }
            },
            'Is First Session Of Program': {
                'Week:Week 1': {
                    settings: {
                        'Email Name': { value: 'Before {Week}', part: 2 },
                        'Subject': { value: 'Outcome-Driven UX Metrics: {Week}: Topics {{Week} Session #1 Topic (#)} + {{Week} Session #2 Topic (#)}' },
                        'Template': { value: '/before-week-1.html', part: 2 },
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

            'Link Color': { value: '#662547' },


            'Calendar Table ID': { value: 'tblm2TqCcDcx94nA2', hide },
            'Topic Table ID': { value: 'tbl60eXcCEU581e7v', hide },

            'Description': { value: '{Airtable Topic Query}&fields[]=Description', fetch: 'airtable' },


            'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/21e7b6b8-1f65-4979-b0ee-53a27fd4397d.png?id=39152005' },
            'Promo Banner': { value: '{CC Banner}' },

            'CC Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/e2491d91-f9cd-4f27-a2bb-907510f6246a.png?id=39155845' },
            'Power Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/6bb91c92-d43f-45c7-8446-a58841963974.png?id=39155846' },
            'Join Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/87a4b268-dec1-41ca-8c6a-e9e4913fb19e.png?id=39155847' },
        },
        'Email Type:Today\'s Session': {
            settings: {
                'Email Name': { value: '{Topic}', part: 2 },

                'Template': { value: '/today.html', part: 2 },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1N0pXqqE1760ciCiO5AT-Lk3Sud-9HwNGVCdwctWYLLs/edit' },

                'Subject': { value: 'Craft + Lead a Strategic UX Vision: {Week}: {Topic}: ​​{Title}' },
            },
            'Topic:Topic 1': { settings: { value: 'https://docs.google.com/document/d/1q3RsyLF3ayTMuCYbWaZyFlY0S-nNyL1q2uLtyCz4mO8/edit?usp=share_link' } },
            'Topic:Topic 2': { settings: { value: 'https://docs.google.com/document/d/13W9orpxBNQ9CK5O5DDKFC1edoGf5w-tgTPCRoUyeh20/edit?usp=share_link' } },
            'Topic:Topic 3': { settings: { value: 'https://docs.google.com/document/d/1yGLuA-To8eEw3yjhYDht-JuR17lJ2eThiQu_B-H9rP4/edit?usp=share_link' } },
            'Topic:Topic 4': { settings: { value: 'https://docs.google.com/document/d/1zUcI1V5zzWkTYBgDfMBYLmC6JDhrHhD3AoplB-nuWdQ/edit?usp=share_link' } },
            'Topic:Topic 5': { settings: { value: 'https://docs.google.com/document/d/1YaI1rSLWBaDja7A47Ikzoh5Yrb_Vw-bNRERZtD_-itw/edit?usp=share_link' } },
            'Topic:Topic 6': { settings: { value: 'https://docs.google.com/document/d/16SX0a90Pw3_zcK-fHc5p-s_0NBJLuiHlHK7F2DpF5FI/edit?usp=share_link' } },
            'Topic:Topic 7': { settings: { value: 'https://docs.google.com/document/d/1PxmUdg9oDVdGbJ7T6v6N6dPrTpkrh-6xaFEzsW-py1E/edit?usp=share_link' } },
            'Topic:Topic 8': { settings: { value: 'https://docs.google.com/document/d/153-uZmIyIsbGoaxi6E_eokj3WOIqL3A_CcjUBZ7xbwo/edit?usp=share_link' } },
        },
        'Email Type:Before Week': {
            settings: {
                'Email Name': { value: 'Before {Next Week}', part: 2 },
                // weeks 3 + 4
                'Template': { value: '/before-week-x.html', part: 2 },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1coEOwxO9nzfl-ynGHjp5Lvy6ar9bG_9x3kEiUZwGvW4/edit?usp=share_link' },

                'Subject': { value: 'Craft + Lead a Strategic UX Vision: {Next Week}: Topics {{Next Week} Session #1 Topic (#)} + {{Next Week} Session #2 Topic (#)}' },
            },
            'Next Week:Week 3': { settings: { 'Source Reference Doc': { value: 'https://docs.google.com/document/d/1wyRv5-iC-3ClRwoXnJa-YUBcsBUsIS0AoJSlDncGZ54/edit' }, } },
            'Next Week:Week 4': { settings: { 'Source Reference Doc': { value: 'https://docs.google.com/document/d/1skINRI0k61iNsHO49sdfLARbB4x_mGlXhDF9C01ZeKA/edit?usp=share_link' }, } },
            'Next Week:Week 2': {
                settings: {
                    'Template': { value: '/before-week-2.html', part: 2 },
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/1A2-nVthQMAT0pMUH-zGqZh43606jSX6GjDph8v8M9Yc/edit' },

                }
            },
            'Is First Session Of Program': {
                'Week:Week 1': {
                    settings: {
                        'Email Name': { value: 'Before {Week}', part: 2 },
                        'Subject': { value: 'Craft + Lead a Strategic UX Vision: {Week}: Topics {{Week} Session #1 Topic (#)} + {{Week} Session #2 Topic (#)}' },

                        'Template': { value: '/before-week-1.html', part: 2 },
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

            'Link Color': { value: '#ec621d' },

            'Calendar Table ID': { value: 'tblZQZRiPOJz4MTkv', hide },
            'Topic Table ID': { value: 'tbldSCPFTa8UD58WI', hide },

            'Description': { value: '{Airtable Topic Query}&fields[]=Description', fetch: 'airtable' },


            'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/456eae66-13b7-4fd1-b959-8d5a9c35e40a.png?id=39152003' },
            'Promo Banner': { value: '{CC Banner}' },

            'Join Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/0301c615-22d1-4b7e-9e27-655aa7e17b40.png?id=39155894' },
            'CC Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/2d2dbb0d-4ecb-4b57-beca-785d89ed3b8b.png?id=39155896' },
            'Measure Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/4ef2e9b5-365e-40c3-99ff-118f1d21fe0b.png?id=39155897' },

        },
        'Email Type:Today\'s Session': {
            settings: {
                'Email Name': { value: '{Topic}', part: 2 },

                'Template': { value: '/today.html', part: 2 },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/160P5IwlEDgvg53zrCMTH1NwW7p0V0cnEqb-CV3VY-bc/edit' },

                'Subject': { value: 'Advanced Strategic UX Research: {Week}: {Topic}: ​​{Title}' },
            }
        },
        'Email Type:Before Week': {
            settings: {
                'Email Name': { value: 'Before {Next Week}', part: 2 },
                // weeks 3 + 4
                'Template': { value: '/before-week-x.html', part: 2 },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1GTwZUhhdJjiuPnWKLeEDcHRG1lX9gJG1mAk3CcogpPM/edit' },

                'Subject': { value: 'Advanced Strategic UX Research: {Next Week}: Topics {{Next Week} Session #1 Topic (#)} + {{Next Week} Session #2 Topic (#)}' },
            },
            'Next Week:Week 2': {
                settings: {
                    'Template': { value: '/before-week-2.html', part: 2 },
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/1PxBRnXcGjY6ytzlTL4Xuvt63T8LtGHzPJM3gQywb7Sk/edit' },

                }
            },
            'Is First Session Of Program': {
                'Week:Week 1': {
                    settings: {
                        'Email Name': { value: 'Before {Week}', part: 2 },
                        'Subject': { value: 'Advanced Strategic UX Research: {Week}: Topics {{Week} Session #1 Topic (#)} + {{Week} Session #2 Topic (#)}' },
                        'Template': { value: '/before-week-1.html', part: 2 },
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
            'Email Name': { value: '{Cohort (First Word)} ', part: 1 },

            'Link Color': { value: '#a5473d' },
            'Link Text Decoration': { value: 'none' },

            'Pillar': { value: '{Topic}' },

            'Calendar Table ID': { value: 'tblVtIK7hg8LOJfZd', hide },
            'Cohort Table ID': { value: 'tblEQ09wfPRDZdXtN', hide },

            'Footer Email Reason': { value: `You're receiving this email because you're a member of the {Cohort (First Word)} of the {Program Name} Online Course.` },
            'Footer Contact': { value: `If you have questions about the course, contact us at ` },
            'Footer Tag': { value: `{Cohort (Caps)(3 Letters)}` },

            'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/9bc6efed-4308-42b8-8e92-c9a887702c61.png?id=39152002' },
            'Promo Banner': { value: '{Rocket Banner}' },

            'Description': { value: '{Airtable Topic Query}&fields[]=Description', fetch: 'airtable' },


            'Star Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/dec3bec9-f5a4-44f1-abdb-a256bd168d7a.png?id=39155998' },
            'Join Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/4756c528-8308-4f1b-a870-2a9c8dd8aa1b.png?id=39155999' },
            'Talk Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/c0ea1a89-f749-42a9-ae81-d332460b5b72.png?id=39156000' },
            'Coach Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/a7c536f3-19a0-47dd-a3e1-4639bc17d4fd.png?id=39156001' },
            'Jared Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/dfcf1d99-748d-4bb9-9af3-d4479dd93752.png?id=39156002' },
            'Rocket Banner': { value: 'https://zetcej.stripocdn.email/content/guids/CABINET_ce778d85eefd06da75cd81462959769460c5adf56a7a55ed3017bf35314437e0/images/ioijfyes_93O.png' },
        },
        'Email Type: Content': {
            settings: {
                'Link Color': { value: '#8c9a29' },
                'Link Text Decoration': { value: 'underline' },
            },
        },
        'Email Type: Vessel': {
            settings: {
                'Link Color': { value: '#8c9a29' },
                'Link Text Decoration': { value: 'underline' },
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
            },
            'Session Type:Live Lab 1': {
                settings: {
                    'Template': { value: '/homework-pillar-x-lab-1.html', part: 2 },
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/1sDODxhDrRbsuUEPpw0J9S4eoah5U3L6QQ18Y2E2h_YQ/edit' },
                }
            },
            'Session Type:Live Lab 2': {
                settings: {
                    'Template': { value: '/homework-pillar-x-lab-2.html', part: 2 },
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/1VDqUYv84Js2kSDbKEcGKpLXbyi_-_43bZlfNNdXxnms/edit' },

                }
            },
            'Session Type:Wrap Up': {
                settings: {
                    'Email Name': { value: 'Wrap Up', part: 2 },
                    'Template': { value: '/wrap-up.html', part: 2 },
                    'Source Reference Doc': { value: '' },
                }
            },
            'Is First Session Of Program': {
                settings: {
                    'Template': { value: '/homework-pillar-1-lab-1.html', part: 2 },
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/1KDQbgOjxdiy3WKIfaQmk2QLLDJQoUcZOx1ANLVkHh1I/edit' },
                }
            },
        },
        'Email Type:First Lab Reminder': {
            settings: {
                'Email Name': { value: 'First Reminder', part: 2 },
                'Subject': { value: 'Win Program: Upcoming live session!' },
                'Template': { value: '/first-lab-reminder.html', part: 2 },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1MXgQs2UXgDbbmf0ZvW9k6k5pGBECgs30A_uWNkjFI5Y/edit?usp=share_link' },
            },
        },
        'Email Type:Onboarding': {
            settings: {
                'Email Name': { value: 'Onboarding', part: 2 },
                'Subject': { value: 'Win Program {Topic}. {Title}' },
                'Template': { value: '/onboarding.html', part: 2 },
                'Source Reference Doc': { value: '' },
            },
        },
        'Email Type:Welcome': {
            settings: {
                'Email Name': { value: 'Welcome', part: 2 },
                'Subject': { value: 'Win Program {Topic}. {Title}' },
                'Template': { value: '/welcome.html', part: 2 },
                'Source Reference Doc': { value: '' },
            },
        },
        'Email Type:Certificate': {
            settings: {
                'Email Name': { value: 'Certificate', part: 2 },
                'Subject': { value: 'Your Certificate for The How to Win Stakeholders & Influence Decisions program' },
                'Template': { value: '/certificate.html', part: 2 },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1ak_mQJ_mBQkSi7gwoYJO2s5CHOUejvXvUnypv2CNCvo/edit' },
            },
        },
        'Email Type:Extension Details': {
            settings: {
                'Email Name': { value: 'Extension Details', part: 2 },
                'Subject': { value: 'Extend Your Access to Our How to Win Stakeholders and Influence Decisions Program.' },
                'Template': { value: '/extension-details.html', part: 2 },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1woSv4H2wFdyDgG_fjzglTO_7rdbbKZRQrQyfPqYNf38/edit?' },
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
    },
    'Program:TUXS': {
        settings: {
            'Send Type': { value: 'CAMPAIGN', hide },
            'Email Name': { value: '{Email Type}', part: 1 },

            'Template': { value: '/tuxs', part: 1 },

            'List ID': { value: '{LoA ID}', hide },
            'Segment ID': { value: '{LoA Segment ID}', hide },

            'Link Text Decoration': { value: 'none' },

            'Calendar Table ID': { value: 'tbl6T80hI7yrFsJWz', hide },
            'Session Title': { value: '{Airtable Session Query}&fields[]=Title', fetch: 'airtable' },
            'Preview': { value: '{Airtable Session Query}&fields[]=Preview', fetch: 'airtable' },
            'Description': { value: '{Airtable Session Query}&fields[]=Description', fetch: 'airtable' },
            'Session Type': { value: '{Airtable Session Query}&fields[]=Topic Type', fetch: 'airtable' },
        },
        'Email Type:Today': {
            settings: {
                'Template': { value: '/today.html', part: 2 },
                'Subject': { value: 'Today: {Session Title}' },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1DEU65xOzfjHrHfB8TCotSoeDN4ERclAcqYynn0yUpWw/edit' },
            },
            // Banner Settings
            'Session Type:Job Search Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/95fddc5d-1565-4ace-8067-ce00e6f3e236.png?id=39120976' }, } },
            'Session Type:Metrics Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/7bab398d-0da2-4fa8-8db2-e3722476bbb5.png?id=39120977' }, } },
            'Session Type:Research Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/799c6af9-72d1-4c02-9b3e-48c6a05462d2.png?id=39120975' }, } },
            'Session Type:Win Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/661e13f2-952e-4f64-ae67-7455592fc53d.png?id=39120979' }, } },
            'Session Type:Vision Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/ef883949-c485-4551-bcac-7e63d185b3a0.png?id=39120978' }, } },
        },
        'Email Type:Recording': {
            settings: {
                'Template': { value: '/recording.html', part: 2 },
                'Subject': { value: 'Recording: {Session Title}' },
                'Questions': { value: '**Questions From the Session:**' },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1V7suWAFtLFw4OKAAP8dcOE0hRRNdFBtGqxJg1nl-IGY/edit' },
            },
            // Banner Settings
            'Session Type:Job Search Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/43e4647c-9c6d-44ed-974a-9afaa9cf867c.png?id=39120942' }, } },
            'Session Type:Metrics Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/0c8125fe-ab98-4700-a44c-93d259f42026.png?id=39120940' }, } },
            'Session Type:Research Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/66bdae7d-f06e-4efe-8166-9a75ca75870a.png?id=39120943' }, } },
            'Session Type:Win Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/1936e392-5619-4048-b663-1e3a691df378.png?id=39120939' }, } },
            'Session Type:Vision Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/46e37013-49b9-4334-a5c7-67965201938d.png?id=39120941' }, } },
        },
        'Email Type:New Topic': {
            settings: {
                'Template': { value: '/new-topic.html', part: 2 },
                'Subject': { value: 'This Monday: {Session Title}' },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1AyFiVg5h6LxHYHYQ_NBdAiCAKPGVCDh2g95bh-dwAgk/edit' },
            },
            // Banner Settings
            'Session Type:Job Search Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/bbcd6fc6-290a-4e6b-a8e7-ecf802100916.png?id=39120554' }, } },
            'Session Type:Metrics Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/33d64055-b14d-48df-8765-970f1cd15b23.png?id=39120556' }, } },
            'Session Type:Research Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/9557c441-0626-45d4-95bf-15d762f9b12c.png?id=39120557' }, } },
            'Session Type:Win Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/44ab5264-62d7-47cb-bf51-6b1634ff07f6.png?id=39120553' }, } },
            'Session Type:Vision Topic': { settings: { 'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/9c31bc20-2032-4d9e-9d7f-ebb6969c9f54.png?id=39120555' }, } },
        },
        // Topic settings
        'Session Type:Job Search Topic': {
            settings: {
                'Primary Color': { value: '00a1b3' },
                'Accent Color': { value: 'eb621d' },
            }
        },
        'Session Type:Metrics Topic': {
            settings: {
                'Primary Color': { value: '9b0e5b' },
                'Accent Color': { value: '00a1b3' },
            }
        },
        'Session Type:Research Topic': {
            settings: {
                'Primary Color': { value: '662547' },
                'Accent Color': { value: '00a1b3' },
            }
        },
        'Session Type:Win Topic': {
            settings: {
                'Primary Color': { value: '00a1b3' },
                'Accent Color': { value: '8c9b29' },
            }
        },
        'Session Type:Vision': {
            settings: {
                'Primary Color': { value: '00a1b3' },
                'Accent Color': { value: '9b0e5b' },
            }
        },
        'Email Type:Upcoming Topics': {
            settings: {
                'Template': { value: '/upcoming-topics.html', part: 2 },
                'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/02/667ec838-028d-4112-8be2-fe1effc217f9.png?id=39120670' },
                'Subject': { value: 'Upcoming: {Upcoming Session #1 Title}, {Upcoming Session #2 Title}, {Upcoming Session #3 Title}' },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1NLFu-FcTj4MFt5fHP-TDROtWwvziAH9zOueZ54GqgIo/edit' },

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

    'Email Type:Certificate': {
        settings: {
            'Email Name': { value: 'Certificate', part: 2 },
            'Subject': { value: 'Your Certificate for the {Program Name} Online Course' },
            'Template': { value: '/workshop/certificate.html', part: 1 },
        },
        'Program:Metrics': { settings: { 'Source Reference Doc': { value: `https://docs.google.com/document/d/1QqwlIK0xIWQD4Ms9Tp2UQLW-4Zc7-r2tKUkwofrPGrc/edit` } } },
        'Program:Research': { settings: { 'Source Reference Doc': { value: `https://docs.google.com/document/d/1zQjiXG1bZlIMmiZz0RDGHbm1anirdWBrNvMZOSif0m4/edit` } } },
        'Program:Visions': { settings: { 'Source Reference Doc': { value: `https://docs.google.com/document/d/1vo3rdXSIWOU1apSulbd3M8vfyEkkWA8tAfbKfN9_iQA/edit` } } },
    },


    'Email Type: Vessel': {
        settings: {
            'Send Type': { value: 'CAMPAIGN', hide },
            'Email Name': { value: 'Vessel {Send To}', part: 1 },
            'Template': { value: '/workshop/vessel.html', part: 1 },
            'Banner': { value: '{Promo Banner}' },

            'Button': {
                value: `<td align="center" class="esd-block-button"> <!--[if mso]><a href="{Program Website}" target="_blank" hidden> <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" esdevVmlButton href="{Program Website}" style="height:41px; v-text-anchor:middle; width:462px" arcsize="24%" stroke="f"  fillcolor="#{Accent Color}"> <w:anchorlock></w:anchorlock> <center style='color:#ffffff; font-family:arial, "helvetica neue", helvetica, sans-serif; font-size:15px; font-weight:700; line-height:15px;  mso-text-raise:1px'> {Program Name} Course Details </center> </v:roundrect></a> <![endif]--> <!--[if !mso]><!-- --> <span class="es-button-border" style="border-width:0;border-radius:10px;background:#{Accent Color};border-color:#179d99"> <a target="_blank" href="{Program Website}" class="es-button" style="background:#{Accent Color};border-radius:10px;font-weight:bold;mso-border-alt:10px solid #{Accent Color}"> {Program Name} Course Details </a> </span> <!--<![endif]--> </td>`
            },
        },
        'Program:Win': {
            settings: {
                'Button': { value: `<td align="left" class="esd-block-button es-p3l es-p3b"> <!--[if mso]><a href="https://winstakeholders.com/" target="_blank" hidden> <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" esdevVmlButton href="https://winstakeholders.com/" style="height:61px; v-text-anchor:middle; width:268px" arcsize="25%" stroke="f"  fillcolor="#8c9b28"> <w:anchorlock></w:anchorlock> <center style='color:#ffffff; font-family:arial, "helvetica neue", helvetica, sans-serif; font-size:18px; font-weight:700; line-height:18px;  mso-text-raise:1px'>WinStakeholders.com</center> </v:roundrect></a> <![endif]--> <!--[if !mso]><!-- --> <span class="es-button-border es-button-border-7035" style="background:#8c9b28;border-color:#8c9b28;border-radius:15px;border-width:0"> <a href="https://winstakeholders.com/" target="_blank" class="es-button es-button-3634" style="font-weight:bold;background:#8c9b28;mso-border-alt:10px solid #8c9b28;border-radius:15px;padding:20px 40px;color:white !important"> WinStakeholders.com </a> </span> <!--<![endif]--> </td>` },
            }
        },
    },
    'Email Type: Content': {
        settings: {
            'Send Type': { value: 'CAMPAIGN', hide },
            'Email Name': { value: 'Content {Send To}', part: 1 },
            'Template': { value: '/workshop/content.html', part: 1 },
            'Banner': { value: '{Promo Banner}' },
        }
    },


    'Send To:LoA': {
        settings: {
            'List ID': { value: '{LoA ID}', hide },
            'Segment ID': { value: '{LoA Segment ID}', hide },

            'Greeting': { value: 'Hello %FIRSTNAME%,' },

            'Footer Email Reason': { value: `You're receiving this email because you're a member of Leaders of Awesomeness.` },
            'Footer Contact': { value: `If you have questions about the community, contact us at` },
            'Footer Tag': { value: `LOA` },
        }
    },
    'Send To:BL': {
        settings: {
            'List ID': { value: '{BL ID}', hide },
            'Segment ID': { value: '{BL Segment ID}', hide },

            'Greeting': { value: 'Hello,' },


            'Footer Email Reason': { value: `You're receiving this email because you've subscribed to Center Centre emails.` },
            'Footer Contact': { value: `If you have questions, contact us at ` },
            'Footer Tag': { value: `BL` },
        }
    },


    'Email Type:Receipt': {
        settings: {
            'Email Name': { value: '{Price Type} Receipt', part: 2 },
            'Subject': { value: 'Receipt: {Program Name} Online Course' },
            'Template': { value: '/workshop/receipt.html', part: 1 },

            'Source Reference Doc': { value: '' },
            'Link Decoration': { value: 'underline' },

            'Banner': { value: '' },

            'Company Insert': {
                value: `<p class="p_date es-m-txt-l" style="color:#333333;font-size:16px"> <br><strong>%COMPANY_NAME%</strong><br>VAT ID <em>(Optional)</em>: %TAX_ID%<br>%STREET_ADDRESS% </p> <p class="es-m-txt-l" style="color:#333333;font-size:16px"> %CITY%, %STATE% %ZIP_CODE% </p> <p class="es-m-txt-l" style="color:#333333;font-size:16px"> %COUNTRY% </p>`, hide
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

            'Source Reference Doc': { value: '' },

            'Space Name': { value: 'Online Course', hide },

            'Banner': { value: '' },
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
    }
};