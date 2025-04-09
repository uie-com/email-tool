import Quill, { Delta, Op } from "quill";
import { VARIABLE_TYPES, VariableType } from "../settings/variables";
import moment from "moment-timezone";
import { parseVariableName } from "./parse";
import { Values } from "../schema/valueCollection";
import { Variables } from "../schema/variableCollection";

const DEBUG = true;
export function fillQuillVariables(variables: Variables, values: Values): Op[] {
    let totalOffset = 0, workingOps = [] as Op[], lastVariableEndIndex = 0, skipCount = 0;

    if (DEBUG) console.log('Filling variables', variables, ' with ', values);
    variables.sortVariables().forEach(variable => {
        if (skipCount > 0) {
            if (DEBUG) console.log('Skipping', variable.writtenAs);
            skipCount--;
            return;
        }

        const startIndex = variable.index + totalOffset;
        const endIndex = variable.index + variable.writtenAs.length + 1 + totalOffset;
        const foundVariable = variable.writtenAs;
        const foundName = variable.name;
        let value = values.finalValue(variable.name);
        if (DEBUG) console.log('Found variable', foundVariable, 'with value', value);

        if (typeof value === 'string' && value.includes('{')) {
            if (DEBUG) console.log('Found internal variable in', value);
            value = new Variables(value)._fillVariables(value, values, [foundName]);
            if (DEBUG) console.log('Filled internal variables to', value);
        }
        value = variable.resolveTransforms(value);

        if (typeof value === 'string') {
            skipCount = foundVariable.split('{').length - 2;
            if (DEBUG) console.log('Retaining:', startIndex - lastVariableEndIndex, ' deleting:', foundVariable.length, ' inserting:', value);
            workingOps.push({ retain: startIndex - lastVariableEndIndex });
            workingOps.push({ delete: foundVariable.length });
            workingOps.push({ insert: value });

            totalOffset += value.length - foundVariable.length;
            lastVariableEndIndex = endIndex + value.length - foundVariable.length + 1;
            if (DEBUG) console.log('length difference between ' + foundVariable + ' and ' + value + ' is ', value.length - foundVariable.length);
            if (DEBUG) console.log('End of ' + foundVariable + ' is ' + (endIndex + totalOffset + 1));
        }
    });
    return workingOps;
}
