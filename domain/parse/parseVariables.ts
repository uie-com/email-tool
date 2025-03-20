import Quill, { Delta } from "quill";
import { EmailVariables } from "../schema";
import { VARIABLE_TYPES } from "../settings/variables";
import moment from "moment-timezone";
import { findDeltaString } from "./parseRichText";


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
        if (VARIABLE_TYPES[type].keywords.find(keyword => name.includes(keyword)) !== undefined) {
            result = type;
        }
    });
    return result;
}

export function createVariableId() {
    return Math.floor(Math.random() * 1000000).toString();
}

export function parseVariables(quill: Quill, oldVariables: EmailVariables, shouldId: boolean): EmailVariables {
    let index = 0, variables: EmailVariables = {};

    while (index < quill.getLength()) {
        if (quill.getText(index, 1) === '}') {
            // console.log('Searching for opening bracket for', index, getDeltaSubstring(body, 0, index));
            let startIndex = index - 1, tempInternalVariableCount = 0, totalInternalVariableCount = 0;
            while ((quill.getText(startIndex, 1) !== '{' || tempInternalVariableCount > 0) && startIndex >= 0) {
                // console.log('Checking', startIndex, getDeltaChar(body, startIndex));
                if (quill.getText(startIndex, 1) === '}') {
                    tempInternalVariableCount++;
                    totalInternalVariableCount++;
                } else if (quill.getText(startIndex, 1) === '{' && tempInternalVariableCount > 0) {
                    tempInternalVariableCount--;
                }
                startIndex--;
            }
            if (startIndex < 0) {
                console.error('Un-opened closing bracket at', index);
                break;
            }

            const variable = quill.getText(startIndex + 1, index - startIndex - 1);
            const variableName = parseVariableName(variable);
            const variableType = parseVariableType(variableName);
            let variableId = createVariableId();
            const internalVariables = Object.keys(variables).reverse().slice(0, totalInternalVariableCount).map(key => variables[key].id);
            const variableWrittenName = variable.includes('(') ? variable.substring(0, variable.indexOf('(')) : variable;;

            if (!variables[variableName] && !oldVariables[variableName]) {
                variables[variableName] = {
                    name: variableName,
                    written: [variable],
                    writtenName: variableWrittenName,
                    type: variableType,
                    value: null,
                    id: variableId,
                    occurs: 1,
                    dependsOn: internalVariables,
                }
                console.log('New variable:', variables[variableName], oldVariables[variableName]);
            } else if (!variables[variableName] && oldVariables[variableName]) {
                variables[variableName] = {
                    ...oldVariables[variableName],
                    written: [variable],
                    writtenName: variableWrittenName,
                    occurs: 1,
                    dependsOn: internalVariables,
                }
                variableId = oldVariables[variableName].id;
            } else if (variables[variableName] && !oldVariables[variableName]) {
                console.log('New instance of new variable:', variableName);
                variables[variableName].written.push(variable);
                variables[variableName].occurs++;
            } else if (variables[variableName] && oldVariables[variableName]) {
                variables[variableName].written.push(variable);
                variables[variableName].occurs++;
                variableId = oldVariables[variableName].id;
            }

            if (shouldId) {
                quill.insertText(startIndex, variableId);
                startIndex += variableId.length;
                index += variableId.length;
            }
        }
        index++;
    }

    return variables;
}

export function renderVariables(quill: Quill, variables: EmailVariables) {
    Object.keys(variables).forEach(key => {
        const variable = variables[key];
        while (findDeltaString(quill, variable.id) !== -1) {
            const index = findDeltaString(quill, variable.id);
            if (index === -1) {
                console.error('Could not find variable', variable.id, 'in', quill.getContents());
                return;
            }
            if (variable.value === null) {
                quill.deleteText(index, 6);
                return;
            }
            const instanceName = quill.getText(index, findDeltaString(quill, '}', index) + 1 - index);
            const value = applyVariableTransforms(variable.value, parseVariableTransforms(instanceName));
            quill.deleteText(index, instanceName.length);
            quill.insertText(index, value);
        }
    });
}

function applyVariableTransforms(value: any, transforms: string[]): string {
    transforms.forEach(transform => {
        if (value instanceof Date || value instanceof moment) {
            try {
                if (moment.tz.zone(transform.replace('GMT', 'Africa/Abidjan')) !== null) {
                    value = moment(value).tz("America/New_York", true).clone().tz(transform.replace('GMT', 'Africa/Abidjan'));
                } else {
                    value = moment(value).format(transform);
                }
            } catch { }
        }
    });
    return value;
}