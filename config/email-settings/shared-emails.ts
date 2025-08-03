import { Settings } from "@/domain/schema";
import { ValuePart } from "@/domain/values/valueCollection";

const hide = true;


export const TODAYS_SESSION: Settings<ValuePart<any>> = {
    'Email Type:Today\'s Session ': {
        settings: {
            // INTERNAL
            'Email Name': { value: '{Topic}', part: 2 },

            // TEMPLATE
            'Template': { value: '/today.html', part: 2 },
            'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9551152', hide },

            // SENDING
            'Send Type': { value: 'AUTOMATION', hide },
            'Subject': { value: '{Program Name}: {Week}: {Topic}: ​​{Title}' },

            // DRIVE
            'Uses Collab Notes': { value: 'Uses Collab Notes', hide },
        }
    }
}

export const BEFORE_WEEK: Settings<ValuePart<any>> = {
    'Email Type:Before Week ': {
        settings: {
            // INTERNAL
            'Email Name': { value: 'Before {Next Week}', part: 2 },

            // TEMPLATE
            'Template': { value: '/before-week-x.html', part: 2 },
            'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9551147', hide },

            // SENDING
            'Send Type': { value: 'AUTOMATION', hide },
            'Subject': { value: '{Program Name}: {Next Week}: Topics {{Next Week} Session #1 Topic (#)} + {{Next Week} Session #2 Topic (#)}' },

            // CONTENT
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
                </ul>
                `, hide
            }
        },
        'Next Week:Week 2': {
            settings: {
                // TEMPLATE
                'Template': { value: '/before-week-2.html', part: 2 },
                'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9551146', hide },
            }
        },
        'Is First Session Of Program': {
            'Week:Week 1': {
                settings: {
                    // INTERNAL
                    'Email Name': { value: 'Before Week 1', part: 2 },

                    // SENDING
                    'Subject': { value: '{Program Name}: {Week}: Topics {{Week} Session #1 Topic (#)} + {{Week} Session #2 Topic (#)}' },

                    // TEMPLATE
                    'Template': { value: '/before-week-1.html', part: 2 },
                    'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9551144', hide },
                }
            },
        },
    }
}

export const CERTIFICATE: Settings<ValuePart<any>> = {
    'Email Type:Certificate': {
        settings: {
            // INTERNAL
            'Email Name': { value: 'Certificate', part: 2 },

            // SENDING
            'Send Type': { value: 'AUTOMATION', hide },
            'Subject': { value: 'Your Certificate for the {Program Name} Online Course' },

            // TEMPLATE
            'Template': { value: '/certificate.html', part: 2 },
            'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9552708', hide },
        },
    },
}

export const VESSEL: Settings<ValuePart<any>> = {
    'Email Type:Vessel': {
        settings: {
            'Send Type': { value: 'CAMPAIGN', hide },
            'Email Name': { value: 'Vessel {Send To}', part: 1 },
            'Template': { value: '/workshop/vessel.html', part: 1 },
            'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9518240', hide },


            'Button': { value: '{Program Name} Course Details' },

            'Variation Variable': { value: 'Send To', hide },
            'Variation Values': { value: '{Audience}', hide },
            'QA Email Name': { value: '{Program} Vessel {Audience (/)}', hide },
        }
    },
}

export const CONTENT: Settings<ValuePart<any>> = {
    'Email Type:Content': {
        settings: {
            'Send Type': { value: 'CAMPAIGN', hide },
            'Email Name': { value: 'Content {Send To}', part: 1 },
            'Template': { value: '/workshop/content.html', part: 1 },
            'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9553025', hide },

            'Variation Variable': { value: 'Send To', hide },
            'Variation Values': { value: '{Audience}', hide },

            'QA Email Name': { value: '{Program} Content {Audience (/)}', hide },
        }
    },
}

export const MESSAGE: Settings<ValuePart<any>> = {
    'Email Type:Message': {
        settings: {
            'Send Type': { value: 'AUTOMATION', hide },
            'Template': { value: '/workshop/content.html', part: 1 },
            'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9553025', hide },
        },
    },
}


export const RECEIPT: Settings<ValuePart<any>> = {
    'Email Type:Receipt': {
        settings: {
            'Email Name': { value: '{Price Type} Receipt', part: 2 },
            'Subject': { value: 'Receipt: {Program Name} Online Course' },
            'Template': { value: '/workshop/receipt.html', part: 1 },
            'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9540829', hide },

            'Link Decoration': { value: 'underline' },

            'Is Excluded From QA Review': { value: 'Is Excluded From QA Review', hide },
            'Is Excluded From QA Checklist': { value: 'Is Excluded From QA Checklist', hide },

            'Is Ongoing Automation': { value: 'Is Ongoing Automation', hide },

            'Variation Variable': { value: 'Price Type', hide },
            'Variation Values': { value: 'Individual, Team, Unemployed', hide },

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
        },
        'Price Type:Individual': {
            settings: {
                'Price Name': { value: 'Individual Member' },
                'Price': { value: '$499.00' },
            },
        },

    },
}

export const CONFIRMATION: Settings<ValuePart<any>> = {
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

            'Is Excluded From QA Review': { value: 'Is Excluded From QA Review', hide },
            'Is Excluded From QA Checklist': { value: 'Is Excluded From QA Checklist', hide },

            'Is Ongoing Automation': { value: 'Is Ongoing Automation', hide },

        },
        'Program:Visions': { settings: { 'Confirmation Message': { value: `Together, let's bring to focus a clear vision of highly desirable experiences.` } } },
        'Program:Metrics': { settings: { 'Confirmation Message': { value: `<br/><br/>Outcome-driven UX Metrics focus you, your team, stakeholders, and executives on improving your customers' and users' lives.` } } },
        'Program:Research': { settings: { 'Confirmation Message': { value: `Together, let's lead your organization to become the foremost expert in your users and customers.` } } },
    },
}