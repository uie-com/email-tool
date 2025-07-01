import { isValidHttpUrl } from "@/domain/values/validation";
import { createGoogleDocLink } from "../links";
import { copyGoogleDocByUrl } from "./googleActions";

export async function createReferenceDoc(email: any, googleAccessToken: string): Promise<any> {
    const values = email?.values;

    if (!email || !values) return console.log('No email found.');

    const sourceDoc = values.resolveValue("Source Reference Doc", true) ?? '';
    const docName = values.resolveValue("Template Name", true) ?? '';

    if (!sourceDoc || !isValidHttpUrl(sourceDoc)) {
        console.log("Invalid source doc", sourceDoc);
        return console.log('Invalid source document link.');
    }

    const res = await copyGoogleDocByUrl(sourceDoc, docName, googleAccessToken);

    if (!res.success || !res.newFileId) {
        console.log("Error copying doc", res.error);
        return console.log(res.error);
    }

    return {
        ...email,
        referenceDocURL: createGoogleDocLink(res.newFileId),
    }
}