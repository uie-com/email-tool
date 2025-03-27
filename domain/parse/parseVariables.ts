import Quill, { Delta } from "quill";
import { EmailVariable, EmailVariableValues } from "../schema";
import { VARIABLE_TYPES } from "../settings/variables";
import moment from "moment-timezone";
import { parse } from "path";


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

export function isSelfReferencing(name: string, dependencies: EmailVariable[]) {
    return dependencies.find(dependency => dependency.name === name) !== undefined;
}

export function parseVariables(text: string): EmailVariable[] {
    let index = 0, variables: EmailVariable[] = [];

    while (index < text.length) {
        if (text[index] === '}') {
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
            variables.push(parseVariable(variable));

        }
        index++;
    }
    return variables;
}

function parseVariable(variable: string): EmailVariable {
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
    };
}

export function parseValuesDependencies(values: EmailVariableValues = {}): EmailVariable[] {
    let dependencies: EmailVariable[] = [];
    Object.keys(values).forEach(key => {
        if (typeof values[key].value === 'string')
            dependencies.push(...parseVariables(values[key].value))
    });
    return dependencies;
}

export function fillVariables(body: Quill | string, values: EmailVariableValues = {}, used: string[] = []): string {
    let index = 0;
    console.log('Filling variables with', values);
    while (index < (typeof body === 'string' ? body.length : body.getLength())) {
        if ((typeof body === 'string' ? body[index] : body.getText(index, 1)) === '}') {
            let startIndex = index - 1, tempInternalVariableCount = 0;
            while (((typeof body === 'string' ? body[startIndex] : body.getText(startIndex, 1)) !== '{' || tempInternalVariableCount > 0) && startIndex >= 0) {
                if ((typeof body === 'string' ? body[startIndex] : body.getText(startIndex, 1)) === '}') {
                    tempInternalVariableCount++;
                } else if ((typeof body === 'string' ? body[startIndex] : body.getText(startIndex, 1)) === '{' && tempInternalVariableCount > 0) {
                    tempInternalVariableCount--;
                }
                startIndex--;
            }
            if (startIndex < 0) {
                console.error('Un-opened closing bracket at', index);
                index++;
                continue;
            }
            const foundVariable = typeof body === 'string' ? body.slice(startIndex + 1, index) : body.getText(startIndex + 1, index - startIndex - 1);
            const foundName = parseVariableName(foundVariable);
            let value = values[foundName]?.value;
            console.log('Found variable', foundVariable, 'with value', value);

            if (used.includes(foundName)) {
                console.error('Circular reference detected for', foundName);
                index++;
                continue;
            }

            if (typeof value === 'string' && value.includes('{')) {
                console.log('Found internal variable in', value);
                value = fillVariables(value, values, used.concat(foundName));
                console.log('Filled internal variables to', value);
            }
            else
                value = applyVariableTransforms(value, parseVariableTransforms(foundVariable));

            if (typeof value === 'string') {
                if (typeof body === 'string')
                    body = body.slice(0, startIndex) + value + body.slice(index + 1);
                else {
                    body.deleteText(startIndex, foundVariable.length + 2);
                    body.insertText(startIndex, value);
                }

                index += value.length - foundVariable.length - 2;
            }

        }
        index++;
    }
    return typeof body === 'string' ? body : '';
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

export function resolveDependencies(textVariables: EmailVariable[], values: EmailVariableValues = {}) {
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
    console.log('Resolving ' + inputVariable.dependencies.length + ' dependencies for', inputVariable);
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
                console.log('Found internal variable in', newValue);
                newValue = fillVariables(newValue, values, [dependency.name]);
                console.log('Filled internal variables to', newValue);
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