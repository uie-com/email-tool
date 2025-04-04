import Quill, { Delta, Op } from "quill";
import { EmailVariable, ValueDict } from "../schema";
import { VARIABLE_TYPES, VariableType } from "../settings/variables";
import moment from "moment-timezone";
import { parse } from "path";
import { forEachChar } from "./parseRichText";

const DEBUG = true;

export function parseVariableName(variable: string) {
    // Remove all whitespace and make lowercase
    let name = '';
    if (variable.includes('(')) {
        name = variable.substring(0, variable.indexOf('('));
    } else {
        name = variable;
    }
    return name.toLowerCase().replace(/\s/g, '');
}

export function parseVariableTransforms(variable: string) {
    const tokens = variable.match(/\(([^)]+)\)/g);
    return tokens?.map(token => token.substring(1, token.length - 1)) ?? [];
}

export function parseVariableType(name: string) {
    let result = 'String';
    Object.keys(VARIABLE_TYPES).forEach(type => {
        if (VARIABLE_TYPES[type as VariableType].keywords.find(keyword => name.includes(keyword)) !== undefined) {
            result = type;
        }
    });
    return result;
}

export function createVariableId() {
    return Math.floor(Math.random() * 1000000).toString();
}

export function isSelfReferencing(name: string, dependencies: EmailVariable[]) {
    return dependencies.find(dependency => dependency.name === name) !== undefined;
}

export function parseVariables(text: string, initialValues?: ValueDict): EmailVariable[] {
    let index = 0, variables: EmailVariable[] = [], isInStyleTag = 0;

    while (index < text.length) {
        // Check if we are in a style tag
        if (text.substring(index, index + 6) === '<style') {
            isInStyleTag++;
        } else if (text.substring(index, index + 7) === '</style') {
            isInStyleTag--;
        }

        if (isInStyleTag === 0 && text[index] === '}') {
            // console.log('Searching for opening bracket for', index, getDeltaSubstring(body, 0, index));
            let startIndex = index - 1, tempInternalVariableCount = 0, totalInternalVariableCount = 0;
            while ((text[startIndex] !== '{' || tempInternalVariableCount > 0) && startIndex >= 0) {
                // console.log('Checking', startIndex, getDeltaChar(body, startIndex));
                if (text[startIndex] === '}') {
                    tempInternalVariableCount++;
                    totalInternalVariableCount++;
                } else if (text[startIndex] === '{' && tempInternalVariableCount > 0) {
                    tempInternalVariableCount--;
                }

                startIndex--;
            }
            if (startIndex < 0) {
                console.error('Un-opened closing bracket at', index);
                index++;
                break;
            }

            const variable = text.slice(startIndex + 1, index);
            variables.push(parseVariable(variable, startIndex, index));

        }
        index++;
    }
    if (DEBUG) console.log('Parsed variables', variables);

    // if (initialValues) {
    //     Object.keys(initialValues).forEach(key => {
    //         if (typeof initialValues[key].value === 'string' && variables.find(variable => variable.name === parseVariableName(initialValues[key].value as string)) === undefined) {
    //             variables.push(parseVariable(initialValues[key].value, -1, -1));
    //         }
    //     });
    // }

    return variables;
}

function parseVariable(variable: string, startIndex: number, endIndex: number): EmailVariable {
    const variableName = parseVariableName(variable);
    const variableType = parseVariableType(variableName);
    const internalVariables = parseVariables(variable);
    const variableWrittenName = variable.includes('(') ? variable.substring(0, variable.indexOf('(')) : variable;
    const variableTransforms = parseVariableTransforms(variable);
    return {
        name: variableName,
        written: '{' + variable + '}',
        writtenName: variableWrittenName,
        type: variableType,
        transforms: variableTransforms,
        dependencies: internalVariables,
        startIndex: startIndex,
    };
}

export function parseValuesDependencies(values: ValueDict = {}): EmailVariable[] {
    let dependencies: EmailVariable[] = [];
    Object.keys(values).forEach(key => {
        if (typeof values[key].value === 'string')
            dependencies.push(...parseVariables(values[key].value))
    });
    return dependencies;
}

export function fillTextVariables(body: string, values: ValueDict = {}, used: string[] = []): string {
    let index = 0, isInStyleTag = 0, length = body.length;
    let valueDict = sanitizeValueDict(values);
    if (DEBUG) console.log('Filling text variables with', valueDict);
    used = used.map(variable => parseVariableName(variable));
    while (index < length) {
        // Check if we are in a style tag
        if (body.substring(index, index + 6) === '<style') {
            isInStyleTag++;
        } else if (body.substring(index, index + 7) === '</style') {
            isInStyleTag--;
        }

        if (isInStyleTag === 0 && (body[index]) === '}') {
            let startIndex = index - 1, tempInternalVariableCount = 0;
            while (((body[startIndex]) !== '{' || tempInternalVariableCount > 0) && startIndex >= 0) {
                if ((body[startIndex]) === '}') {
                    tempInternalVariableCount++;
                } else if ((body[startIndex]) === '{' && tempInternalVariableCount > 0) {
                    tempInternalVariableCount--;
                }
                startIndex--;
            }
            if (startIndex < 0) {
                console.error('Un-opened closing bracket at', index);
                index++;
                continue;
            }
            const foundVariable = body.slice(startIndex + 1, index);
            const foundName = parseVariableName(foundVariable);
            let value = valueDict[foundName]?.value;
            if (DEBUG) console.log('Found variable', foundVariable, 'with value[' + foundName + ']', value);

            if (used.includes(foundName)) {
                console.error('Circular reference detected for', foundName);
                index++;
                continue;
            }

            if (typeof value === 'string' && value.includes('{')) {
                if (DEBUG) console.log('Found internal variable in', value);
                value = fillTextVariables(value, valueDict, used.concat(foundName));
                if (DEBUG) console.log('Filled internal variables to', value);
            }
            value = applyVariableTransforms(value, parseVariableTransforms(foundVariable));

            if (typeof value === 'string' || typeof value === 'number') {
                body = body.slice(0, startIndex) + value + body.slice(index + 1);

                index += value.length - foundVariable.length - 2;
                length = body.length;
            } else if ((value as any) instanceof Date) {
                body = body.slice(0, startIndex) + (value as string) + body.slice(index + 1);
                index += (value as string).length - foundVariable.length - 2;
                length = body.length;
            }

        }
        index++;
    }
    return body;
}

export function fillQuillVariables(variables: EmailVariable[], values: ValueDict = {}): Op[] {
    let totalOffset = 0, workingOps = [] as Op[], lastVariableEndIndex = 0, skipCount = 0;
    variables = variables.sort((a, b) => a.startIndex - b.startIndex);
    if (DEBUG) console.log('Filling variables', variables, ' with ', values);
    variables.forEach(variable => {
        if (skipCount > 0) {
            if (DEBUG) console.log('Skipping', variable.written);
            skipCount--;
            return;
        }

        const startIndex = variable.startIndex + totalOffset;
        const endIndex = variable.startIndex + variable.written.length - 1 + totalOffset;
        const foundVariable = variable.written;
        const foundName = variable.name;
        const valueName = resolveDependencies([variable], values)[0].name;
        let value = values[valueName]?.value;
        if (DEBUG) console.log('Found variable', foundVariable, 'with value', value);

        if (typeof value === 'string' && value.includes('{')) {
            if (DEBUG) console.log('Found internal variable in', value);
            value = fillTextVariables(value, values, [foundName]);
            if (DEBUG) console.log('Filled internal variables to', value);
        }
        else
            value = applyVariableTransforms(value, parseVariableTransforms(foundVariable));

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

// export function fastFillQuillVariables(body: Quill, values: ValueDict = {}): Quill {
//     let isInStyleTag = 0, lastTimestamp = Date.now(), totalIncrementTime = 0, totalOpeningTime = 0, totalFillingTime = 0;
//     forEachChar(body, (char: string, index: number) => {
//         // Check if we are in a style tag
//         if (char == '<' && body.getText(index, 6) === '<style') {
//             isInStyleTag++;
//         } else if (char == '<' && body.getText(index, 7) === '</style') {
//             isInStyleTag--;
//         }

//         totalIncrementTime += debug_addToTime(lastTimestamp);
//         lastTimestamp = Date.now();
//         if (isInStyleTag === 0 && char === '}') {
//             let startIndex = index - 1, tempInternalVariableCount = 0;
//             while (((body.getText(startIndex, 1)) !== '{' || tempInternalVariableCount > 0) && startIndex >= 0) {
//                 if ((body.getText(startIndex, 1)) === '}') {
//                     tempInternalVariableCount++;
//                 } else if ((body.getText(startIndex, 1)) === '{' && tempInternalVariableCount > 0) {
//                     tempInternalVariableCount--;
//                 }
//                 startIndex--;
//             }
//             if (startIndex < 0) {
//                 console.error('Un-opened closing bracket at', index);
//                 return 0;
//             }
//             totalOpeningTime += debug_addToTime(lastTimestamp);
//             lastTimestamp = Date.now();

//             const foundVariable = body.getText(startIndex + 1, index - startIndex - 1);
//             const foundName = parseVariableName(foundVariable);
//             let value = values[foundName]?.value;
//             if (DEBUG) console.log('Found variable', foundVariable, 'with value', value);

//             if (typeof value === 'string' && value.includes('{')) {
//                 if (DEBUG) console.log('Found internal variable in', value);
//                 value = fillTextVariables(value, values, [foundName]);
//                 if (DEBUG) console.log('Filled internal variables to', value);
//             }
//             else
//                 value = applyVariableTransforms(value, parseVariableTransforms(foundVariable));

//             if (typeof value === 'string') {
//                 body.deleteText(startIndex, foundVariable.length + 2);
//                 body.insertText(startIndex, value);

//                 console.log('length difference is ', value.length - foundVariable.length - 2);
//                 return value.length - foundVariable.length - 2;
//             }
//             totalFillingTime += debug_addToTime(lastTimestamp);
//         }
//         lastTimestamp = Date.now();
//         return 0;
//     })
//     console.log('Total increment time', totalIncrementTime);
//     console.log('Total opening time', totalOpeningTime);
//     console.log('Total filling time', totalFillingTime);
//     console.log('Total time', totalIncrementTime + totalOpeningTime + totalFillingTime);
//     return body;
// }

function debug_addToTime(lastTimestamp: number) {
    const currentTimestamp = Date.now();
    const timeDiff = currentTimestamp - lastTimestamp;
    return timeDiff;
}

function applyVariableTransforms(value: any, transforms: string[]): string {
    transforms.forEach(transform => {
        if (value instanceof Date || value instanceof moment) {
            try {
                if (moment.tz.zone(transform.replace('GMT', 'Africa/Abidjan')) !== null) {
                    value = moment(value).tz("America/New_York", true).clone().tz(transform.replace('GMT', 'Africa/Abidjan')).toDate();
                } else if (transform.substring(0, 1) === '+') {
                    if (transform.substring(transform.length - 1, transform.length) === 'd') {
                        value = moment(value).add(parseInt(transform.substring(1, transform.length - 1)), 'days').toDate();
                    } else if (transform.substring(transform.length - 1, transform.length) === 'h') {
                        value = moment(value).add(parseInt(transform.substring(1, transform.length - 1)), 'hours').toDate();
                    }
                } else if (transform.substring(0, 1) === '-') {
                    if (transform.substring(transform.length - 1, transform.length) === 'd') {
                        value = moment(value).add(-1 * parseInt(transform.substring(1, transform.length - 1)), 'days').toDate();
                    } else if (transform.substring(transform.length - 1, transform.length) === 'h') {
                        value = moment(value).add(-1 * parseInt(transform.substring(1, transform.length - 1)), 'hours').toDate();
                    }
                } else {
                    value = moment(value).format(transform);
                }
            } catch { }
        }
    });
    return value;
}

export function resolveDependencies(textVariables: EmailVariable[], values: ValueDict = {}) {
    let variables: EmailVariable[] = [];
    // console.log('Resolving dependencies for', variables, 'with', values);
    for (let i = 0; i < textVariables.length; i++) {
        const variable = { ...textVariables[i] };
        variables.push(tryResolveDependencies(variable, values));
    }
    // console.log('Done all', variables);
    return variables;
}

function tryResolveDependencies(inputVariable: EmailVariable, values: ValueDict) {
    if (DEBUG) console.log('Resolving ' + inputVariable.dependencies.length + ' dependencies for', inputVariable);
    let variable = { ...inputVariable };
    const dependencies = variable.dependencies;
    variable.dependencies = [];
    for (let j = 0; j < dependencies.length; j++) {
        let dependency = dependencies[j];
        if (dependency.dependencies.length > 0) {
            // console.log('+ Dependency ' + dependency.dependencies.length + ' dependencies for', dependency);
            dependency = tryResolveDependencies(dependency, values);
        }
        if (dependency.name && values[dependency.name] && values[dependency.name].value) {
            let newValue = applyVariableTransforms(values[dependency.name].value, dependency.transforms);
            if (typeof newValue === 'string' && newValue.includes('{')) {
                if (DEBUG) console.log('Found internal variable in', newValue);
                newValue = fillTextVariables(newValue, values, [dependency.name]);
                if (DEBUG) console.log('Filled internal variables to', newValue);
            }
            variable.name = variable.name.replace('{' + parseVariableName(dependency.name) + '}', parseVariableName(newValue));
            variable.written = variable.written.replace(dependency.written, newValue);
            variable.writtenName = variable.writtenName.replace(dependency.written, newValue);
        } else {
            variable.dependencies.push(dependency);
        }
    }
    // console.log('Done', variable);
    return variable;
}

export function createValueDictFromDict(values: { [key: string]: any }): ValueDict {
    const valueDict: ValueDict = {};
    Object.keys(values).forEach(key => {
        valueDict[key] = {
            value: values[key],
            // uses: parseVariables(values[key])
        };
    });
    return valueDict;
}

export function sanitizeValueDict(values: ValueDict): ValueDict {
    const sanitizedValues: ValueDict = {};
    Object.keys(values).forEach(key => {
        sanitizedValues[parseVariableName(key)] = values[key];
    });
    return sanitizedValues;
}