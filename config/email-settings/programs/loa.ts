import { Settings } from "@/domain/schema";
import { ValuePart } from "@/domain/values/valueCollection";
import { CONTENT, MESSAGE, VESSEL } from "../shared-emails";

const hide = true;


export const LOA: Settings<ValuePart<any>> = {
    'Program:LoA': {
        settings: {
            // PROGRAM
            'Program Name': { value: 'Leaders of Awesomeness', hide },

            // TEMPLATE
            'Template': { value: '/loa', part: 1 },

            // SENDING
            'Send Type': { value: 'CAMPAIGN', hide },
            'List ID': { value: '{LoA ID}', hide },
            'Segment ID': { value: '{LoA Segment ID}', hide },

            // STYLES
            'Link Text Decoration': { value: '' },
            'Link Color': { value: '#4293a4' },

            // FOOTER
            'Footer Email Reason': { value: `You're receiving this email because you're a member of Leaders of Awesomeness.` },
            'Footer Contact': { value: `If you have questions about the community, contact us at <a href="mailto:hello@centercentre.com" style="color:{Footer Color} !important;text-decoration:underline !important" class="footer-text">hello@centercentre.com</a>.` },
            'Footer Tag': { value: `LOA` },

            // BANNER

        },

        ...VESSEL,
        ...CONTENT,
        ...MESSAGE,
    },
}