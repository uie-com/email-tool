import { parseVariableName } from "../parse/parse";
import { Variable, Variables } from "./variableCollection";

const DEBUG = false;
export class Values {
    initialValues: Value<any>[] = [];

    addValue(key: string, value: ValuePart<any>) {
        key = this._resolveKey(key);
        const loc = this.initialValues.find((v) => v.key === key)
        if (loc) loc.addValue(value);
        else this.initialValues.push(new Value(key, value));
    }

    setValue(key: string, value: ValuePart<any>) {
        key = this._resolveKey(key);
        const loc = this.initialValues.find((v) => v.key === key)
        if (DEBUG) console.log('Setting value', key, value, loc ? 'for another time' : 'for the first time');
        if (loc) loc.setValue(value.value, value.source ?? 'user');
        else this.initialValues.push(new Value(key, value));
    }

    getInitialValue(key: string): Value<any> | undefined {
        key = this._resolveKey(key);
        return this.initialValues.find((v) => v.key === key);
    }

    getLocalValue(key: string): any | undefined {
        key = this._resolveKey(key);
        return this.initialValues.find((v) => v.key === key)?.localValue;
    }

    getAllValues(key: string): any | undefined {
        key = this._resolveKey(key);
        return this.initialValues.find((v) => v.key === key)?.getAllValues();
    }

    getFinalValue(key: string | Variable): any | undefined {
        if (typeof key === 'string') {
            key = this._resolveKey(key);
            return this.initialValues.find((v) => v.key === key)?.finalValue;
        } else {
            const variable = key;
            key = this._resolveKey(variable.name);
            let value = this.initialValues.find((v) => v.key === key)?.finalValue;
            if (typeof value === 'string')
                value = new Variables(value).resolveWith(this, [variable.name]);
            return variable.resolveTransforms(value);
        }
    }

    asArray(source?: string): string[] {
        return this.initialValues.map((v) => v.getLocalValue()).filter((v) => v !== undefined) as string[];
    }

    _addArray(strings: string[], source?: string) {
        strings.forEach((s, i) => {
            this.addValue(s, {
                value: s,
                source: (source ?? 'user') as ValueSource,
            });
        });
    }

    hasValueFor(key: string): boolean {
        key = this._resolveKey(key);
        return this.initialValues.find((v) => v.key === key)?.getLocalValue() !== undefined;
    }

    hasValueOf(value: any): boolean {
        value = this._resolveKey(value);
        return this.initialValues.find((v) => parseVariableName(v.getLocalValue()) === value) !== undefined;
    }

    source(source: string): Values {
        const values = new Values();
        this.initialValues.forEach((v) => {
            const value = v.source(source);
            if (value.initialValues.length > 0) values.initialValues.push(value);
        });
        return values;
    }

    asDict(): { [key: string]: Value<any>[] } {
        return this.initialValues.reduce((acc, v) => {
            const value = v;
            if (value !== undefined) acc[v.key] = value;
            return acc;
        }, {} as { [key: string]: any }) ?? {};
    }

    maxParts(): number {
        return this.initialValues.reduce((acc, v) => {
            const maxPart = v.initialValues.reduce((acc, part) => {
                if (part.part === undefined) return acc;
                return Math.max(acc, part.part);
            }, 0);
            return Math.max(acc, maxPart);
        }, 0);
    }

    _resolveKey(key: string) {
        key = parseVariableName(key);
        return parseVariableName(new Variables(key).resolveWith(this, [key]));
    }

    constructor(initalValues?: Value<any>[]) {
        this.initialValues = initalValues?.map((v) => {
            return new Value(v.name, ...v.initialValues);
        }) ?? [];
    }
}

export type ValueSource = 'email' | 'settings' | 'user';
export const VALUE_SOURCE_ORDER: ValueSource[] = ['email', 'settings', 'user'];
export type ValuePart<T> = {
    value: T;
    part?: number;
    fetch?: undefined | 'airtable';
    source?: ValueSource
}

export class Value<T> {
    initialValues: ValuePart<T>[] = [];
    name: string;
    key: string;

    constructor(name: string, ...values: ValuePart<T>[]) {
        this.initialValues.push(...values);
        this.name = name;
        this.key = parseVariableName(name);
    }

    addValue(value: ValuePart<T>) {
        this.initialValues.push(value);
        this.sortValues();
    }

    setValue(value: T | undefined, source: ValueSource) {
        if (value === undefined) {
            this.initialValues = this.initialValues.filter((part) => part.source !== source);
            this.sortValues();
        } else {
            this.initialValues = this.initialValues.filter((part) => part.source !== source);
            this.initialValues.push({
                value: value,
                source: source
            });
            this.sortValues();
        }
    }

    isSetOfPartialValues(values?: ValuePart<T>[]): boolean {
        if (!values) values = this.initialValues;
        return values.length > 1 && values.find((part) => part.part === undefined) === undefined;
    }

    source(source: string): Value<T> {
        const values = this.initialValues.filter((part) => part.source === source);
        if (values.length === 0) return new Value(this.name);
        return new Value(this.name, ...values);
    }

    get allInitialValues(): (T | undefined)[] {
        return this.initialValues.reduce((acc, part) => {
            if (part.part === undefined) {
                acc[0] = part.value;
            } else {
                while (acc.length <= part.part) {
                    acc.push(undefined);
                }
                acc[part.part] = part.value;
            }
            return acc;
        }, [] as (T | undefined)[]);
    }

    getLocalValue(): T | string | undefined {
        if (this.initialValues.length === 0) return undefined;
        else if (this.initialValues.length === 1) return this.initialValues[0].value;
        let searchedValues = structuredClone(this.initialValues);

        if (!this.isSetOfPartialValues(searchedValues))
            return searchedValues[searchedValues.length - 1].value;

        searchedValues.sort((a, b) => (a.part ?? 0) - (b.part ?? 0));
        return searchedValues.map((part) => part.value).join('');
    }

    getAllValues(): any[][] | undefined {
        if (this.initialValues.length === 0) return undefined;
        else if (this.initialValues.length === 1) return [[this.initialValues[0].value]];
        let searchedValues = structuredClone(this.initialValues);

        if (!this.isSetOfPartialValues(searchedValues))
            return [[searchedValues[searchedValues.length - 1].value]];

        const array = searchedValues.reduce((acc, part) => {
            if (part.part === undefined) {
                acc[0] = [part.value];
            } else {
                while (acc.length <= part.part) {
                    acc.push([]);
                }
                acc[part.part].push(part.value);
            }
            return acc;
        }, [] as (T | undefined)[][]);

        console.log('Array', array);

        return array;
    }

    get localValue(): T | string | undefined {
        return this.getLocalValue();
    }

    get isRemote(): boolean {
        return (
            (!this.isSetOfPartialValues()
                && this.initialValues[this.initialValues.length - 1].fetch !== undefined)
            || (this.isSetOfPartialValues()
                && this.initialValues.find((part) => part.fetch) !== undefined)
        );
    }

    get finalValue(): T | string | undefined | Promise<any> {
        const localValue = this.localValue;
        if (localValue === undefined) return undefined;
        if (this.isRemote && typeof localValue === 'string')
            return this._fetchRemoteValue(localValue);
        return localValue;
    }

    sortValues() {
        this.initialValues = this.initialValues.sort((a, b) =>
            (VALUE_SOURCE_ORDER.indexOf(a.source ?? 'user') ?? 0) + (a.part ?? 0 * 0.001) -
            (VALUE_SOURCE_ORDER.indexOf(b.source ?? 'user') ?? 0) - (a.part ?? 0 * 0.001));
    }

    async _fetchRemoteValue(url: string) {
        const fetch = this.initialValues.reverse().find((part) => part.fetch);
        if (fetch && fetch.fetch === 'airtable') {
            console.log('[Airtable] Fetching setting', this.name, 'with url', fetch.value);
            const response = await fetchAirtableData(url);
            console.log('[Airtable] Fetched data', this.name, response);
            if (response && response.records && response.records.length > 0) {
                const fieldName = Object.keys(response.records[0].fields)[0];
                return response.records[0].fields[fieldName];
            }
        }
        return undefined;
    }

}

