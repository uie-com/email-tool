import { EmailVariables } from "../schema";
import { VARIABLE_TYPES } from "../settings/variables";

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

export function parseVariables(body: string) {
    let index = 0, variables: EmailVariables = {};

    while (index < body.length) {
        if (body[index] === '}') {
            let startIndex = index - 1, tempInternalVariableCount = 0, totalInternalVariableCount = 0;
            while ((body[startIndex] !== '{' || tempInternalVariableCount > 0) && startIndex >= 0) {
                if (body[startIndex] === '}') {
                    tempInternalVariableCount++;
                    totalInternalVariableCount++;
                } else if (body[startIndex] === '{' && tempInternalVariableCount > 0) {
                    tempInternalVariableCount--;
                }
                startIndex--;
            }
            if (startIndex < 0) {
                console.error('Invalid variable syntax at', index);
                break;
            }

            const variable = body.substring(startIndex + 1, index);
            const variableName = parseVariableName(variable);
            const variableId = createVariableId();
            const variableType = parseVariableType(variableName);
            const internalVariables = Object.keys(variables).reverse().slice(0, totalInternalVariableCount).map(key => variables[key].id);
            const variableWrittenName = variable.includes('(') ? variable.substring(0, variable.indexOf('(')) : variable;

            if (!variables[variableName]) {
                variables[variableName] = {
                    name: variableName,
                    written: variable,
                    writtenName: variableWrittenName,
                    type: variableType,
                    value: null,
                    id: variableId,
                    occurs: 1,
                    dependsOn: internalVariables,
                }
                console.log('New variable:', variables[variableName]);
            } else {
                console.log('New instance of variable:', variableName);
                variables[variableName].occurs++;
            }
        }
        index++;
    }

    return variables;
}