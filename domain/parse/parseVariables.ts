import Quill, { Delta } from "quill";
import { EmailVariable, EmailVariableValues } from "../schema";
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

export function parseVariables(quill: Quill): EmailVariable[] {
    let index = 0, variables: EmailVariable[] = [];

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
            const internalVariables = variables.slice(variables.length - totalInternalVariableCount);
            const variableWrittenName = variable.includes('(') ? variable.substring(0, variable.indexOf('(')) : variable;;
            const variableTransforms = parseVariableTransforms(variable);

            variables.push({
                name: variableName,
                written: '{' + variable + '}',
                writtenName: variableWrittenName,
                type: variableType,
                transforms: variableTransforms,
                dependsOn: internalVariables,
            });

        }
        index++;
    }

    return variables;
}

export function renderVariables(quill: Quill, variables: EmailVariable[], values: EmailVariableValues) {
    let index = 0;
    while (index < quill.getLength()) {
        if (quill.getText(index, 1) === '}') {
            let startIndex = index - 1, tempInternalVariableCount = 0, totalInternalVariableCount = 0;
            while ((quill.getText(startIndex, 1) !== '{' || tempInternalVariableCount > 0) && startIndex >= 0) {
                if (quill.getText(startIndex, 1) === '}') {
                    tempInternalVariableCount++;
                    totalInternalVariableCount++;
                } else if (quill.getText(startIndex, 1) === '{' && tempInternalVariableCount > 0) {
                    tempInternalVariableCount--;
                }
                startIndex--;
            }
            const foundVariable = quill.getText(startIndex + 1, index - startIndex - 1);
            const foundName = parseVariableName(foundVariable);
            const value = values[foundName];
            if (value !== undefined) {
                const finalValue = applyVariableTransforms(value, parseVariableTransforms(foundVariable))
                if (typeof finalValue === 'string') {
                    quill.deleteText(startIndex, foundVariable.length + 2);
                    index -= foundVariable.length + 2;
                    quill.insertText(startIndex, finalValue);
                    index += finalValue.length;
                }
            }
        }
        index++;

    }
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

export function resolveDependencies(textVariables: EmailVariable[], values: EmailVariableValues) {
    let variables: EmailVariable[] = [];
    // console.log('Resolving dependencies for', variables, 'with', values);
    for (let i = 0; i < textVariables.length; i++) {
        const variable = { ...textVariables[i] };
        variables.push(tryResolveDependencies(variable, values));
    }
    // console.log('Done all', variables);
    return variables;
}

function tryResolveDependencies(inputVariable: EmailVariable, values: EmailVariableValues) {
    // console.log('Resolving ' + inputVariable.dependsOn.length + ' dependencies for', inputVariable);
    let variable = { ...inputVariable };
    const dependsOn = variable.dependsOn;
    variable.dependsOn = [];
    for (let j = 0; j < dependsOn.length; j++) {
        let dependency = dependsOn[j];
        if (dependency.dependsOn.length > 0) {
            // console.log('+ Dependency ' + dependency.dependsOn.length + ' dependencies for', dependency);
            dependency = tryResolveDependencies(dependency, values);
        }
        if (dependency.name && values[dependency.name]) {
            const newValue = applyVariableTransforms(values[dependency.name], dependency.transforms);
            variable.name = variable.name.replace('{' + parseVariableName(dependency.name) + '}', parseVariableName(newValue));
            variable.written = variable.written.replace(dependency.written, newValue);
            variable.writtenName = variable.writtenName.replace(dependency.written, newValue);
        } else {
            variable.dependsOn.push(dependency);
        }
    }
    // console.log('Done', variable);
    return variable;
}