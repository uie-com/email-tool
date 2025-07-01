import { MARKETING_REVIEWERS } from "@/config/integration-settings";
import { loadStringFromLocalStorage, saveStringToLocalStorage } from "@/domain/browser/localStorage";
import { getWorkingHourDiff } from "@/domain/date/dates";
import { Email } from "@/domain/schema";

export const getNextReviewer = (): number => {
    const lastReviewed = getLastReviewer();
    const nextReviewer = (lastReviewed + 1) % MARKETING_REVIEWERS.length;
    return nextReviewer;
}

export const getLastReviewer = (): number => {
    try {
        let lastReviewedStr = loadStringFromLocalStorage('lastReviewed');
        const lastReviewed = lastReviewedStr ? parseInt(lastReviewedStr) : 0;
        return lastReviewed;
    } catch (error) {
        console.error('Error getting last reviewer:', error);
        saveStringToLocalStorage('lastReviewed', '0');
        return 0;
    }
}

export const logReviewer = (index: number): void => {
    saveStringToLocalStorage('lastReviewed', index.toString());
}

export const calculatePriority = (email?: Email) => {
    if (!email)
        return 1;

    email = new Email(email.values, email);
    const sendDate = email.values?.resolveValue('Send Date', true);
    if (!sendDate)
        return 1;

    const hoursFromNow = getWorkingHourDiff(new Date(), new Date(sendDate));

    if (hoursFromNow < 3) {
        return 2;
    } else if (hoursFromNow < 18) {
        return 1;
    } else {
        return 0;
    }
}
