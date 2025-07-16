import moment from "moment-timezone";
import { createNotionCard, findNotionCard, updateNotionCard } from "./notionActions";


export async function createNotionCardForEmail(email: any, isPreApproved: boolean) {
    const values = email?.values;

    if (!email || !values) return;

    const emailName = values.resolveValue("QA Email Name", true) ?? '';
    const sendDate = moment(values.resolveValue("Send Date", true) ?? '').format('YYYY-MM-DD');
    const shareReviewBy = values.resolveValue((values.resolveValue("Share Reviews By", true) ?? ''), true);
    const referenceDocURL = email?.referenceDocURL ?? '';


    let res = await findNotionCard(sendDate, emailName, shareReviewBy);
    if (!res || !res.success) {
        console.log("Error querying Notion", res);
        if (res.error)
            console.log(res?.error ?? 'Error searching Notion: ' + res?.error);
        else
            console.log('No Notion card found. Created one called ' + emailName + ' for ' + sendDate);
    }

    if (!res.url) {
        const notionCard = await createNotionCard(sendDate, emailName);
        if (notionCard && notionCard.success && notionCard.url && notionCard.id) {
            res = notionCard;
        } else {
            return console.log('Error creating Notion card: ' + notionCard?.error);
        }
    }

    const notionId = res.id;
    const updateRes = await updateNotionCard(notionId ?? '', referenceDocURL, false, isPreApproved);
    if (!updateRes.success) {
        console.log("Error updating Notion card", updateRes.error);
        return console.log('Error updating Notion card: ' + updateRes.error);
    }
    console.log("Updated Notion card", updateRes);

    return (
        {
            ...email,
            notionURL: res.url,
            notionId: res.id,
        }
    );
}
