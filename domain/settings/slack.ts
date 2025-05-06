import { loadStringFromLocalStorage, saveStringToLocalStorage } from "../data/localStorage";
import { Email } from "../schema";


export const MARKETING_REVIEWERS = ['Jalia', 'JyMae', 'Amy'];
export const MARKETING_REVIEWER_IDS = ['U085USDS22K', 'U08GK14AJ87', 'U06AE2PB5QD'];
export const TL_REVIEWERS = ['avelazquez@centercentre.com']
export const FINAL_REVIEWER = ['jfishman@centercentre.com']

export const PRIORITY_FLAGS = [':waving_white_flag:', ':blue-flag:', ':triangular_flag_on_post:'];
export const PRIORITY_ICONS = ['⚪️', '🔵', '🔴'];

export const SLACK_LIST_URL = 'slack://list?team=T025J4SHK&id=F08GTALT9GX';

export const GET_REVIEW_INDEX = (templateId: string) => {
    try {
        let num = loadStringFromLocalStorage('reviewIndex');
        let lastReviewed = loadStringFromLocalStorage('lastReviewed');
        if (num === null) {
            num = '0';
        }
        let numInt = parseInt(num);
        if (isNaN(numInt)) {
            numInt = 0;
        }

        if (lastReviewed !== templateId) {
            saveStringToLocalStorage('reviewIndex', (numInt + 1).toString());
            saveStringToLocalStorage('lastReviewed', templateId);
        }

        return numInt;
    } catch (error) {
        console.error('Error getting review index:', error);
        saveStringToLocalStorage('reviewIndex', (0).toString());
        return 0;
    }
}


export const GET_DEFAULT_PRIORITY = (email?: Email) => {
    if (!email)
        return PRIORITY_FLAGS[1];

    email = new Email(email.values, email);
    const sendDate = email.values?.resolveValue('Send Date', true);
    if (!sendDate)
        return PRIORITY_FLAGS[1];

    const hoursFromNow = Math.floor((new Date(sendDate).getTime() - new Date().getTime()) / (1000 * 60 * 60));

    if (hoursFromNow < 3) {
        return PRIORITY_FLAGS[2];
    } else if (hoursFromNow < 36) {
        return PRIORITY_FLAGS[1];
    } else {
        return PRIORITY_FLAGS[0];
    }
}