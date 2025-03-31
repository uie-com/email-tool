"use server";

import { Op } from "quill";
import { EmailVariable, ValueDict } from "../schema";
import { fillQuillVariables } from "./parseVariables";

export async function fillQuillVariablesRemotely(variables: EmailVariable[], values: ValueDict = {}): Promise<Op[]> {
    return fillQuillVariables(variables, values);
}
