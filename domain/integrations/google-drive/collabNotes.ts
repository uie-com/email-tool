import { Values } from "@/domain/values/valueCollection";
import { Variables } from "@/domain/variables/variableCollection";
import { GetContentDocResult } from "./googleActions";

export function createVariableEdits(content: GetContentDocResult, values: Values) {
    const requests: any[] = [];

    const walkAndCollect = (obj: any) => {
        if (!obj) return;

        if (obj.textRun?.content && typeof obj.textRun.content === 'string') {
            const variables = obj.textRun.content.match(/\{[^\}]+\}/g) || [];
            for (const variable of variables) {
                const originalText = variable;
                const resolvedText = new Variables(originalText).resolveWith(values);

                if (resolvedText !== originalText) {
                    requests.push({
                        replaceAllText: {
                            containsText: {
                                text: originalText,
                                matchCase: true,
                            },
                            replaceText: resolvedText,
                        },
                    });
                }

            }
        }

        for (const key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                walkAndCollect(obj[key]);
            }
        }
    };

    walkAndCollect(content);

    return requests;

}