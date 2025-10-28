import { FINAL_REVIEWER_IDS, FINAL_REVIEWERS, MARKETING_REVIEWER_IDS, MARKETING_REVIEWERS, USER_IDS } from "@/config/integration-settings";
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

export const getNextFinalReviewer = (currentReviewerIndex: number): number => {
    const lastReviewed = getLastFinalReviewer();
    let nextReviewer = lastReviewed;

    while (nextReviewer === lastReviewed || FINAL_REVIEWER_IDS[nextReviewer] === USER_IDS[getSelf()] || MARKETING_REVIEWER_IDS[currentReviewerIndex] === FINAL_REVIEWER_IDS[nextReviewer])
        nextReviewer = (nextReviewer + 1) % FINAL_REVIEWERS.length;

    return nextReviewer;
}

export const getLastFinalReviewer = (): number => {
    try {
        let lastReviewedStr = loadStringFromLocalStorage('lastFinalReviewed');
        const lastReviewed = lastReviewedStr ? parseInt(lastReviewedStr) : 0;
        return lastReviewed;
    } catch (error) {
        console.error('Error getting last final reviewer:', error);
        saveStringToLocalStorage('lastFinalReviewed', '0');
        return 0;
    }
}

export const logFinalReviewer = (index: number): void => {
    saveStringToLocalStorage('lastFinalReviewed', index.toString());
}

export const getSelf = (): number => {
    try {
        let selfStr = loadStringFromLocalStorage('self');
        const self = selfStr ? parseInt(selfStr) : 0;
        return self;
    } catch (error) {
        console.error('Error getting self index:', error);
        saveStringToLocalStorage('self', '0');
        return 0;
    }
}

export const logSelf = (index: number): void => {
    saveStringToLocalStorage('self', index.toString());
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
