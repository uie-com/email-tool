import { Settings } from "@/domain/schema";
import { ValuePart } from "@/domain/values/valueCollection";
import { CONTENT, MESSAGE, VESSEL } from "../shared-emails";

const hide = true;


export const AI: Settings<ValuePart<any>> = {
    'Program:AI': {
        settings: {
            // PROGRAM
            'Program Name': { value: 'UX & Design in an AI World', hide },
            'Program Website': { value: 'https://maven.com/centercentre/uxai' },


            // TEMPLATE
            'Link Color': { value: '#bd1f23', hide },
            'Accent Color': { value: '{Link Color}', hide },

            // BANNER
            'Banner': { value: '' },
            'Banner Alt': { value: '' },
            'Promo Banner': { value: 'https://content.app-us1.com/O8aW3/2025/06/04/83f01f0d-0e49-4d7e-bfac-8b61142dc247.png?id=39727400' },
            'Promo Banner Alt': { value: 'UX & Design in an AI World; Host Jared Spool' },
        },

        // ** EMAILS **
        'Email Type:Lightning Talk': {
            settings: {
                'Send Type': { value: 'CAMPAIGN', hide },
                'Email Name': { value: 'Lightning Talk', part: 1 },
                'Template': { value: '/ai/lightning-talk.html', part: 1 },
                'Send To': { value: 'LoA', hide },

                'Subject': { value: 'TODAY: {Title}' },
                'Preview': { value: '⚡️ Going live for a free Lightning Talk on Maven' },

                'Stripo Link': { value: 'https://my.stripo.email/editor/v5/727662/email/9792363', hide },
                'Source Reference Doc': { value: 'https://docs.google.com/document/d/1US3XMScU1sF2qrRTTCVMT8iLmEdSaoSINo1gkny1Yvk/edit?tab=t.0' },
            }
        },

        ...VESSEL,
        ...CONTENT,
        ...MESSAGE,
    },
}