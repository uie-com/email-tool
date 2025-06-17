import moment from "moment-timezone";
import { parseVariableName } from "../parse/parse";
import { VARIABLE_OVERRIDES, VARIABLE_TYPES, VariableType } from "../../config/variable-settings";
import { Value, Values } from "./valueCollection";
import { resolveTransforms } from "../../config/variable-transforms";
import { PRE_APPROVED_VALUES } from "../../config/email-settings";

const DEBUG = false;
export class Variables {
    variables: Variable[] = [];
    parentKeys: string[] = [];
    source: string;

    constructor(text: string, parentKeys: string[] = []) {
        if (DEBUG) console.log('Parsing variable collection for', text);
        this.parentKeys = parentKeys;
        this._parseVariables(text, this.parentKeys);
        this.source = text;
    }

    addVariable(writtenAs: string, at: number) {
        const variable = new Variable(writtenAs, at, this.parentKeys);
        this.variables.push(variable);
        this.sortVariables();
    }

    resolveWith(values: Values): string {
        return this._fillVariables(this.source, values);
    }

    sortVariables() {
        return this.variables.sort((a, b) => a.index - b.index);
    }

    getUniqueVariables(variables: Variable[] = this.variables): Variable[] {
        const uniqueVariables: Variable[] = [];
        variables.forEach(variable => {
            if (uniqueVariables.find(v => v.key === variable.key) === undefined) {
                uniqueVariables.push(variable);
            }
        }
        );
        return uniqueVariables;
    }

    getDisplayVariables(values?: Values, prepend?: Variable[], append?: Variable[]): Variable[] {
        let sum = [
            ...(prepend ? prepend : []),
            ...this.variables.map(variable => {
                if (values === undefined) return variable;
                return variable.resolveDependencies(values);
            }),
            ...(values ? this.getValueVariables(values).map(variable => {
                return variable.resolveDependencies(values);
            }) : []),
            ...(values ? this.getIterableVariables(values).map(variable => {
                return variable.resolveDependencies(values);
            }) : []),
            ...(append ? append : [])
        ]
        sum = sum.filter(variable => PRE_APPROVED_VALUES.includes(variable.name) === false);
        return this.getUniqueVariables(sum);
    }

    getValueVariables(values: Values): Variable[] {
        return new Variables(values.asArray().join(','), this.parentKeys).variables;
    }

    getIterableVariables(values: Values): Variable[] {
        const iterables = this.variables.filter(v => v.writtenAs.includes('Iterate x'));
        const iteratedValues = iterables.map(v => {
            console.log('Found iterable', v.writtenAs);
            console.log('With value', values.getCurrentValue(v.key));
            console.log('Resolving to object', new Variable(v.writtenAs, 0, this.parentKeys));
            console.log('Resolving to key', new Variable(v.writtenAs, 0, this.parentKeys).resolveDependencies(values));
            console.log('Resolving to', new Variable(v.writtenAs, 0, this.parentKeys).resolveDependencies(values).resolveTransforms(values.getCurrentValue(v.key), new Values([])));
            return new Variable(v.writtenAs, 0, this.parentKeys).resolveDependencies(values).resolveTransforms(values.getCurrentValue(v.key), new Values([]));
        })
        return new Variables(iteratedValues.join(','), this.parentKeys).variables;
    }

    _fillVariables(text: string, values: Values): string {
        // console.warn('Filling variables inside of', this.parentKeys.join(', '));
        if (DEBUG) console.log('- Using', values);
        if (DEBUG) console.log('- Variable Stack', this.parentKeys);

        this._parseVariables(text, this.parentKeys, (variable, startIndex, endIndex) => {
            if (DEBUG) console.log('Filling variable', variable.writtenAs, 'at', startIndex, endIndex);

            if (this.parentKeys.find(v => v === variable.key) !== undefined) {
                console.error('Circular reference detected for', variable);
                return text;
            }

            let value = values.resolveValue(variable);
            if (DEBUG) console.log('Found variable', variable.writtenAs, 'with value[' + variable.key + ']' + value);

            if ((typeof value === 'string' && value.length > 0) || (typeof value !== 'string' && value !== undefined)) {
                value = value as string;
                text = text.slice(0, startIndex) + value + text.slice(endIndex + 1);
                if (DEBUG) console.log('Replaced', variable.writtenAs, 'with', value, 'offset', value.length - variable.writtenAs.length);
                return text;
            }

            if (DEBUG) console.log('Replaced', variable.writtenAs, 'with', value, 'offset', text.length - (text.slice(0, startIndex) + text.slice(endIndex + 1)).length);
            text = text.slice(0, startIndex) + text.slice(endIndex + 1); // if the variable is not found, remove it
            return text;
        });

        return text;
    }

    _parseVariables(text: string, used: string[], callback?: (variable: Variable, startIndex: number, endIndex: number) => string) {
        let index = 0, isInStyleTag = 0;
        while (index < text.length) {
            if (text.substring(index, index + 6) === '<style') isInStyleTag++;
            else if (text.substring(index, index + 7) === '</style') isInStyleTag--;

            if (isInStyleTag !== 0 || text[index] !== '}') { index++; continue; }

            let startIndex = index - 1, tempInternalVariableCount = 0, totalInternalVariableCount = 0;
            while ((text[startIndex] !== '{' || tempInternalVariableCount > 0) && startIndex >= 0) {
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

            const writtenAs = text.substring(startIndex, index + 1);
            const variable = new Variable(writtenAs, startIndex, [...this.parentKeys, ...used]);
            let newText = text;

            if (used.find(v => v === variable.key) !== undefined) {
                console.error('Circular reference detected for', variable);
                return text;
            }

            if (!callback)
                this.variables.push(variable);
            else
                newText = callback(variable, startIndex, index);

            index += (newText.length - text.length) + 1;
            text = newText;
        }
        if (DEBUG) console.log('Parsed variables', this.variables);
    }
}

export class Variable {
    writtenAs: string;
    index: number;
    parentKeys: string[] = [];

    constructor(writtenAs: string, at: number, parentKeys: string[] = []) {
        this.parentKeys = parentKeys;
        this.writtenAs = writtenAs;
        this.index = at;
        this.replaceOverrides();
    }

    replaceOverrides() {
        const replaceAll = (str: string, strReplace: string, strWith: string) => {
            // See http://stackoverflow.com/a/3561711/556609
            var esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            var reg = new RegExp(esc, 'ig');
            return str.replace(reg, strWith);
        };
        Object.keys(VARIABLE_OVERRIDES).forEach(override => {
            this.writtenAs = replaceAll(this.writtenAs, ' ' + override, ' ' + VARIABLE_OVERRIDES[override]);
            this.writtenAs = replaceAll(this.writtenAs, override + ' ', VARIABLE_OVERRIDES[override] + ' ');
        });
    }

    get writtenNoBraces(): string {
        return this.writtenAs.substring(1, this.writtenAs.length - 1).trim();
    }

    get transforms(): string[] {
        const lastInternalEndIndex = this.writtenNoBraces.lastIndexOf('}');

        let transformArea;
        if (lastInternalEndIndex === -1) transformArea = this.writtenNoBraces;
        else transformArea = this.writtenNoBraces.substring(lastInternalEndIndex + 1);

        const tokens = transformArea.match(/\(([^)]+)\)/g);
        return tokens?.map(token => token.substring(1, token.length - 1)) ?? [];
    }

    get name(): string {
        const lastInternalEndIndex = this.writtenNoBraces.lastIndexOf('}');

        let nameArea;
        if (lastInternalEndIndex === -1) {
            const firstTransformIndex = this.writtenNoBraces.indexOf('(');
            if (firstTransformIndex === -1) nameArea = this.writtenNoBraces;
            else nameArea = this.writtenNoBraces.substring(0, firstTransformIndex);
        }
        else {
            const transformArea = this.writtenNoBraces.substring(lastInternalEndIndex + 1);
            const firstTransformIndex = transformArea.indexOf('(');
            if (firstTransformIndex === -1) nameArea = this.writtenNoBraces;
            else nameArea = this.writtenNoBraces.substring(0, firstTransformIndex + lastInternalEndIndex + 1);
        }

        return nameArea.trim();
    }

    get key() {
        return parseVariableName(this.name);
    }

    get type() {
        let result = 'String';
        Object.keys(VARIABLE_TYPES).forEach(type => {
            if ((VARIABLE_TYPES[type as VariableType].keywords as string[]).find(keyword => this.key.includes(keyword)) !== undefined) {
                result = type;
            }
        });
        return result;
    }

    get hasParent() {
        return this.writtenNoBraces.includes('{');
    }

    get parents(): Variables {
        return new Variables(this.writtenNoBraces, [this.key, ...this.parentKeys]);
    }

    resolveDependencies(values: Values): Variable {
        return new Variable('{' + new Variables(this.writtenNoBraces, [this.key, ...this.parentKeys]).resolveWith(values) + '}', this.index, [this.key, ...this.parentKeys]);
    }

    resolveTransforms(value: any, context: Values): any {
        return resolveTransforms(this.transforms, value, context);
    }

}