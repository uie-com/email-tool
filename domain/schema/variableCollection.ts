import moment from "moment-timezone";
import { parseVariableName } from "../parse/parse";
import { VARIABLE_TYPES, VariableType } from "../settings/variables";
import { Value, Values } from "./valueCollection";

const DEBUG = false;
export class Variables {
    variables: Variable[] = [];
    source: string;

    constructor(text: string) {
        if (DEBUG) console.log('Parsing variable collection for', text);
        this._parseVariables(text);
        this.source = text;
    }

    addVariable(writtenAs: string, at: number) {
        const variable = new Variable(writtenAs, at);
        this.variables.push(variable);
        this.sortVariables();
    }

    resolveWith(values: Values, used: string[]): string {
        return this._fillVariables(this.source, values, used);
    }

    sortVariables() {
        return this.variables.sort((a, b) => a.index - b.index);
    }

    getUniqueVariables(variables: Variable[] = this.variables): Variable[] {
        const uniqueVariables: Variable[] = [];
        variables.forEach(variable => {
            if (uniqueVariables.find(v => v.name === variable.name) === undefined) {
                uniqueVariables.push(variable);
            }
        }
        );
        return uniqueVariables;
    }

    getDisplayVariables(values?: Values): Variable[] {
        const sum = [
            ...this.variables.map(variable => {
                if (values === undefined) return variable;
                return variable.resolveDependencies(values);
            }),
            ...(values ? this.getValueVariables(values).map(variable => {
                return variable.resolveDependencies(values);
            }) : [])
        ]
        return this.getUniqueVariables(sum);
    }

    getValueVariables(values: Values): Variable[] {
        return new Variables(values.asArray().join(',')).variables;
    }

    _fillVariables(text: string, values: Values, used: string[]): string {
        if (DEBUG) console.log('Filling variables in', text);
        if (DEBUG) console.log('- Using', values);
        if (DEBUG) console.log('- Variable Stack', used);

        this._parseVariables(text, (variable, startIndex, endIndex) => {
            if (DEBUG) console.log('Filling variable', variable.writtenAs, 'at', startIndex, endIndex);

            if (used.find(v => v === variable.name) !== undefined) {
                console.error('Circular reference detected for', variable);
                return text;
            }

            let value = values.getFinalValue(variable);
            if (DEBUG) console.log('Found variable', variable.writtenAs, 'with value[' + variable.name + ']' + value);

            if ((typeof value === 'string' || value as string) && value.length > 0) {
                value = value as string;
                text = text.slice(0, startIndex) + value + text.slice(endIndex + 1);
                console.log('Replaced', variable.writtenAs, 'with', value, 'offset', value.length - variable.writtenAs.length);
                return text;
            }

            return text;
        });

        return text;
    }

    _parseVariables(text: string, callback?: (variable: Variable, startIndex: number, endIndex: number) => string) {
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
            const variable = new Variable(writtenAs, startIndex);
            let newText = text;

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

    constructor(writtenAs: string, at: number) {
        this.writtenAs = writtenAs;
        this.index = at;
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

    get writtenName(): string {
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

    get name() {
        return parseVariableName(this.writtenName);
    }

    get type() {
        let result = 'String';
        Object.keys(VARIABLE_TYPES).forEach(type => {
            if ((VARIABLE_TYPES[type as VariableType].keywords as string[]).find(keyword => this.name.includes(keyword)) !== undefined) {
                result = type;
            }
        });
        return result;
    }

    get hasParent() {
        return this.writtenNoBraces.includes('{');
    }

    get parents(): Variables {
        return new Variables(this.writtenNoBraces);
    }

    resolveDependencies(values: Values): Variable {
        return new Variable('{' + new Variables(this.writtenNoBraces).resolveWith(values, [this.name]) + '}', this.index);
    }

    resolveTransforms(value: any): string {
        this.transforms.forEach(transform => {
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

}