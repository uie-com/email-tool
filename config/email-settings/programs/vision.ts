import { Settings } from "@/domain/schema";
import { ValuePart } from "@/domain/values/valueCollection";
import { BEFORE_WEEK, CERTIFICATE, CONFIRMATION, CONTENT, MESSAGE, RECEIPT, TODAYS_SESSION, VESSEL } from "../shared-emails";

const hide = true;


export const VISION: Settings<ValuePart<any>> = {
    'Program:Vision': {
        settings: {
            // PROGRAM
            'Program Name': { value: 'Craft + Lead a Strategic UX Vision', hide },
            'Program Website': { value: 'https://visions.centercentre.com', hide },

            // TEMPLATE
            'Template': { value: '/workshop', part: 1 },

            // INTERNAL
            'Email Name': { value: '{Cohort} ', part: 1 },

            // SENDING
            'Send Type': { value: 'AUTOMATION', hide },

            // STYLES
            'Link Color': { value: '#662547', hide },

            // AIRTABLE
            'Calendar Table ID': { value: 'tblwWOJncBNkBEOie', hide },
            'Topic Table ID': { value: 'tbl60eXcCEU581e7v', hide },

            'Airtable Topic Query': { value: '{Airtable URL}/{Topic Table ID}?filterByFormula=SEARCH("{Topic}", %7BName%7D)', hide },
            'Description': { value: '{Airtable Topic Query}&fields[]=Description', fetch: 'airtable' },

            // BANNER
            'Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/21e7b6b8-1f65-4979-b0ee-53a27fd4397d.png?id=39152005' },
            'Promo Banner': { value: 'https://content.app-us1.com/O8aW3/2025/05/05/e2491d91-f9cd-4f27-a2bb-907510f6246a.png?id=39155845' },
        },

        // ** EMAILS **
        ...TODAYS_SESSION,
        'Email Type:Today\'s Session': {
            settings: {
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1N0pXqqE1760ciCiO5AT-Lk3Sud-9HwNGVCdwctWYLLs/edit' },
            },
            'Topic:Topic 1': { settings: { 'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/1xzlb3nqHyFjtdNH5VQ3nVuEWrviMgzhHagLnLI5-ooo/edit' } } },
            'Topic:Topic 2': { settings: { 'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/19oDEn9PjvUcutzCw5LBixXU1OmirrIkSop5VHUaX_u0/edit' } } },
            'Topic:Topic 3': { settings: { 'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/1ZRHh_fVzooJeujRto6yrGv7qlz-83MCRu2TqjanwtKk/edit?tab=t.0#heading=h.m3vfswnu9y08' } } },
            'Topic:Topic 4': { settings: { 'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/1j8mpwfcxdSm0aAn48Urngt0bddt3wKylZhQcNg83OjQ/edit?tab=t.0#heading=h.m3vfswnu9y08' } } },
            'Topic:Topic 5': { settings: { 'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/1o0a9KpyzoAHDdti02awuUrknywd540ZAKkIdbCgcqcA/edit?tab=t.0#heading=h.m3vfswnu9y08' } } },
            'Topic:Topic 6': { settings: { 'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/1MB0Z-llczObDAyf6ny0wYNFpmKMo3MfyWpSOn_cyQrc/edit?tab=t.0#heading=h.m3vfswnu9y08' } } },
            'Topic:Topic 7': { settings: { 'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/1UQQFkCa7-QufEWdB2do0DgdFwBYymiMFFX3vKhEMnBg/edit?tab=t.0#heading=h.m3vfswnu9y08' } } },
            'Topic:Topic 8': { settings: { 'Source Collab Notes Doc': { value: 'https://docs.google.com/document/d/1FOtRBsH1kZ6kcvenulQgb2Nmj0jEr7lWDKs9OPzUwvw/edit?tab=t.0#heading=h.m3vfswnu9y08' } } },

            'Topic:Topic 1 ': { settings: { 'Source Reference Doc': { value: 'https://docs.google.com/document/d/1q3RsyLF3ayTMuCYbWaZyFlY0S-nNyL1q2uLtyCz4mO8/edit?usp=share_link' }, } },
            'Topic:Topic 2 ': { settings: { 'Source Reference Doc': { value: 'https://docs.google.com/document/d/13W9orpxBNQ9CK5O5DDKFC1edoGf5w-tgTPCRoUyeh20/edit?usp=share_link' }, } },
            'Topic:Topic 3 ': { settings: { 'Source Reference Doc': { value: 'https://docs.google.com/document/d/1yGLuA-To8eEw3yjhYDht-JuR17lJ2eThiQu_B-H9rP4/edit?usp=share_link' }, } },
            'Topic:Topic 4 ': { settings: { 'Source Reference Doc': { value: 'https://docs.google.com/document/d/1zUcI1V5zzWkTYBgDfMBYLmC6JDhrHhD3AoplB-nuWdQ/edit?usp=share_link' }, } },
            'Topic:Topic 5 ': { settings: { 'Source Reference Doc': { value: 'https://docs.google.com/document/d/1YaI1rSLWBaDja7A47Ikzoh5Yrb_Vw-bNRERZtD_-itw/edit?usp=share_link' }, } },
            'Topic:Topic 6 ': { settings: { 'Source Reference Doc': { value: 'https://docs.google.com/document/d/16SX0a90Pw3_zcK-fHc5p-s_0NBJLuiHlHK7F2DpF5FI/edit?usp=share_link' }, } },
            'Topic:Topic 7 ': { settings: { 'Source Reference Doc': { value: 'https://docs.google.com/document/d/1PxmUdg9oDVdGbJ7T6v6N6dPrTpkrh-6xaFEzsW-py1E/edit?usp=share_link' }, } },
            'Topic:Topic 8 ': { settings: { 'Source Reference Doc': { value: 'https://docs.google.com/document/d/153-uZmIyIsbGoaxi6E_eokj3WOIqL3A_CcjUBZ7xbwo/edit?usp=share_link' }, } },
        },

        ...BEFORE_WEEK,
        'Email Type:Before Week': {
            settings: {
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1coEOwxO9nzfl-ynGHjp5Lvy6ar9bG_9x3kEiUZwGvW4/edit?usp=share_link' },
            },
            'Is First Session Of Program': {
                'Week:Week 1': {
                    settings: {
                        'Source Reference Doc': { value: 'https://docs.google.com/document/d/1dhD6E9tWpHTyEZiogDPoOpO5oLg9sClG3CO3QpeyF6A/edit' },
                    }
                },
            },
            'Next Week:Week 2': {
                settings: {
                    'Source Reference Doc': { value: 'https://docs.google.com/document/d/1A2-nVthQMAT0pMUH-zGqZh43606jSX6GjDph8v8M9Yc/edit' },
                }
            },
            'Next Week:Week 3': { settings: { 'Source Reference Doc': { value: 'https://docs.google.com/document/d/1wyRv5-iC-3ClRwoXnJa-YUBcsBUsIS0AoJSlDncGZ54/edit' }, } },
            'Next Week:Week 4': { settings: { 'Source Reference Doc': { value: 'https://docs.google.com/document/d/1skINRI0k61iNsHO49sdfLARbB4x_mGlXhDF9C01ZeKA/edit?usp=share_link' }, } },
        },

        ...CERTIFICATE,
        'Email Type:Certificate': {
            settings: {
                'Source Reference Doc': { value: `https://docs.google.com/document/d/1vo3rdXSIWOU1apSulbd3M8vfyEkkWA8tAfbKfN9_iQA/edit` },
            },
        },

        ...VESSEL,
        ...CONTENT,
        ...MESSAGE,

        ...RECEIPT,
        ...CONFIRMATION,


        // ** SETTINGS **
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
}