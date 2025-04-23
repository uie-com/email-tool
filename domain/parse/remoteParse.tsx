"use server";

import { Values } from "../schema/valueCollection";
import { Variables } from "../schema/variableCollection";

export async function resolveTemplateRemotely(str: string, valueString: string, className: string = '') {

    const variables = new Variables(str);
    const values = new Values(JSON.parse(valueString).initialValues);
    const resolved = variables.resolveWith(values);


    return (<iframe
        className={className}
        style={{
            border: "1px solid #e5e7eb",
            borderRadius: "0.5rem",
        }
        }
        srcDoc={resolved} >
    </iframe>);
}