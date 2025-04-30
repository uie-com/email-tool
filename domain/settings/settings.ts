
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
        'Banner': { value: './banners', part: 0 },
        'Base ID': { value: 'appHcZTzlfXAJpL7I', hide },
        'Airtable URL': { value: 'https://api.airtable.com/v0/{Base ID}', hide },
        'Airtable Session Query': { value: '{Airtable URL}/{Calendar Table ID}?filterByFormula=DATESTR(%7BDate%7D)="{Session Date (YYYY-MM-DD)}"', hide },

        'From Name': { value: 'Jared Spool', hide },
        'From Email': { value: 'jared.m.spool@centercentre.com', hide },
        'Reply To': { value: 'jared.m.spool@centercentre.com', hide },

        'Test Email': { value: 'ayang@centercentre.com', hide },

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
    },
    'Program:Stand Out': {
        settings: {
            'Send Type': { value: 'AUTOMATION', hide },
            'Email Name': { value: '{Email Type}', part: 1 },
            'Template': { value: '/standout', part: 1 },

            'Automation ID': { value: '226', hide },

            'Banner': { value: '' },
            'Link Color': { value: '#ec621d' },


            'Calendar Table ID': { value: 'tbly8jzaHpb0hGfbj', hide },
            // 'Session Type': { value: '{Airtable Session Query}&fields[]=Session Type', fetch: 'airtable' },
            // 'Event Link': { value: '{Airtable Session Query}&fields[]=Event Link', fetch: 'airtable' },
            // 'Session Notes Link': { value: '{Airtable Session Query}&fields[]=Collab Notes Link', fetch: 'airtable' },
        },
        'Email Type:Events of Week': {
            settings: {
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
            'Send Type': { value: 'AUTOMATION', hide },
            'Template': { value: '/metrics', part: 1 },
            'Email Name': { value: '{Cohort} ', part: 1 },

            'Banner': { value: '' },
            'Link Color': { value: '#006f74' },


            'Calendar Table ID': { value: 'tblm2TqCcDcx94nA2', hide },
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
            'Send Type': { value: 'AUTOMATION', hide },
            'Template': { value: '/visions', part: 1 },
            'Email Name': { value: '{Cohort} ', part: 1 },

            'Banner': { value: '' },
            'Link Color': { value: '#662547' },


            'Calendar Table ID': { value: 'tblm2TqCcDcx94nA2', hide },
        },
        'Email Type:Today\'s Session': {
            settings: {
                'Email Name': { value: '{Topic}', part: 2 },

                'Template': { value: '/today.html', part: 2 },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1N0pXqqE1760ciCiO5AT-Lk3Sud-9HwNGVCdwctWYLLs/edit' },

                'Subject': { value: 'Craft + Lead a Strategic UX Vision: {Week}: {Topic}: ​​{Title}' },
            }
        },
        'Email Type:Before Week': {
            settings: {
                'Email Name': { value: 'Before {Next Week}', part: 2 },
                // weeks 3 + 4
                'Template': { value: '/before-week-x.html', part: 2 },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1wyRv5-iC-3ClRwoXnJa-YUBcsBUsIS0AoJSlDncGZ54/edit' },

                'Subject': { value: 'Craft + Lead a Strategic UX Vision: {Next Week}: Topics {{Next Week} Session #1 Topic (#)} + {{Next Week} Session #2 Topic (#)}' },
            },
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
            'Send Type': { value: 'AUTOMATION', hide },
            'Template': { value: '/research', part: 1 },
            'Email Name': { value: '{Cohort} ', part: 1 },

            'Banner': { value: '' },

            'Link Color': { value: '#662547' },

            'Calendar Table ID': { value: 'tblZQZRiPOJz4MTkv', hide },
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
            'Send Type': { value: 'AUTOMATION', hide },
            'Template': { value: '/win', part: 1 },
            'Email Name': { value: '{Cohort} ', part: 1 },

            'Banner': { value: '' },
            'Link Color': { value: '#a5473d' },
            'Link Text Decoration': { value: 'none' },

            'Pillar': { value: '{Topic}' },

            'Calendar Table ID': { value: 'tblVtIK7hg8LOJfZd', hide },
            'Cohort Table ID': { value: 'tblEQ09wfPRDZdXtN', hide },
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
            'Is First Session Of Program': {
                settings: {
                    'Template': { value: '/homework-pillar-1-lab-1.html', part: 2 },
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/1KDQbgOjxdiy3WKIfaQmk2QLLDJQoUcZOx1ANLVkHh1I/edit' },


                }
            },
        },
        'Session Type: Wrap Up': {
            settings: {
            }
        },
        'Email Type:Certificate': {
            settings: {
                'Email Name': { value: 'Certificate', part: 2 },
                'Subject': { value: 'Your Certificate for The How to Win Stakeholders & Influence Decisions program' },
                'Template': { value: '/certificate.html', part: 2 }, 'Source Reference Doc': { value: 'https://docs.google.com/document/d/1ak_mQJ_mBQkSi7gwoYJO2s5CHOUejvXvUnypv2CNCvo/edit' },
            },
        },
        'Email Type: Extension Details': {
            settings: {
                'Email Name': { value: 'Extension Details', part: 2 },
                'Subject': { value: 'Extend Your Access to Our How to Win Stakeholders and Influence Decisions Program.' },
                'Template': { value: '/extension-details.html', part: 2 }, 'Source Reference Doc': { value: 'https://docs.google.com/document/d/1woSv4H2wFdyDgG_fjzglTO_7rdbbKZRQrQyfPqYNf38/edit?' },
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
                'Questions': { value: '**Questions From the Session:**' },
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
                'Primary Color': { value: '00a1b3' },
                'Accent Color': { value: 'eb621d' },
            }
        },
        'Session Type:Metrics Topic': {
            settings: {
                'Banner': { value: '/metrics.png', part: 3 },
                'Primary Color': { value: '9b0e5b' },
                'Accent Color': { value: '00a1b3' },
            }
        },
        'Session Type:Research Topic': {
            settings: {
                'Banner': { value: '/research.png', part: 3 },
                'Primary Color': { value: '662547' },
                'Accent Color': { value: '00a1b3' },
            }
        },
        'Session Type:Win Topic': {
            settings: {
                'Banner': { value: '/wininfluence.png', part: 3 },
                'Primary Color': { value: '00a1b3' },
                'Accent Color': { value: '8c9b29' },
            }
        },
        'Session Type:Vision': {
            settings: {
                'Banner': { value: '/vision.png', part: 3 },
                'Primary Color': { value: '00a1b3' },
                'Accent Color': { value: '9b0e5b' },
            }
        },

        'Email Type:Upcoming Topics': {
            settings: {
                'Banner': { value: '/upcomingtopics.png', part: 3 },
                'Template': { value: '/upcoming-topics.html', part: 2 },
                'Subject': { value: 'Upcoming: {Upcoming Session #1 Title}, {Upcoming Session #2 Title}, {Upcoming Session #3 Title}' },

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
    },
    'Email Type: Vessel': {
        settings: {
            'Send Type': { value: 'CAMPAIGN', hide },
            'Email Name': { value: 'Vessel {Send To}', part: 1 },
        },
        'Send To:LoA': {
            settings: {
                'List ID': { value: '{LoA ID}', hide },
                'Segment ID': { value: '{LoA Segment ID}', hide },
                'Template': { value: '/vessel-loa.html', part: 2 },

            }
        },
        'Send To:BL': {
            settings: {
                'List ID': { value: '{BL ID}', hide },
                'Segment ID': { value: '{BL Segment ID}', hide },
                'Template': { value: '/vessel-bl.html', part: 2 },

            }
        }
    },
};