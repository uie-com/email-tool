import moment from "moment-timezone";
import { fetchAirtableData } from "../data/airtable";
import { parseVariableName } from "../parse/parse";
import { Variable, Variables } from "./variableCollection";

import Editor from '@monaco-editor/react';

const DEBUG = false;
export class Values {
    initialValues: Value<any>[] = [];

    addValue(name: string, value: ValuePart<any>) {
        const key = this._resolveKey(name);
        const loc = this.initialValues.find((v) => v.key === key)
        if (loc) loc.addValue(value);
        else this.initialValues.push(new Value(name, value));
    }

    setValue(name: string, value: ValuePart<any>) {
        const key = this._resolveKey(name);
        const loc = this.initialValues.find((v) => v.key === key)
        if (DEBUG) console.log('Setting value', key, value, loc ? 'for another time' : 'for the first time');
        if (loc) loc.setValue(value.value, value.source ?? 'user');
        else this.initialValues.push(new Value(name, value));
    }

    getValueObj(key: string): Value<any> | undefined {
        key = this._resolveKey(key);
        return this.initialValues.find((v) => v.key === key);
    }

    getCurrentValue(key: string): any | undefined {
        key = this._resolveKey(key);
        return this.initialValues.find((v) => v.key === key)?.currentValue;
    }

    getAllValuesForTesting(key: string): any | undefined {
        key = this._resolveKey(key);
        return this.initialValues.find((v) => v.key === key)?.getAllValues();
    }

    finalValue(key: string, showOnlyEditable: boolean = false): any | undefined {
        key = this._resolveKey(key);
        return this.initialValues.find((v) => v.key === key)?.resolveWith(this, showOnlyEditable);
    }

    isFetching(key: string): boolean {
        key = this._resolveKey(key);
        const value = this.initialValues.find((v) => v.key === key);
        if (value === undefined) return false;
        return value.currentSource !== 'remote' && value.remoteType !== undefined;
    }

    resolveValue(key: Variable | string, ignoreRecursionRisk: boolean = false, showOnlyEditable: boolean = false): any | undefined {
        if (typeof key === 'string') {
            if (!ignoreRecursionRisk)
                console.warn('Resolving value for string, unsure of recursion', key);
            key = this._resolveKey(key);
            key = new Variable('{' + key + '}', 0, []);
        }
        let value = this.finalValue(key.key, showOnlyEditable);
        if (typeof value === 'string')
            value = new Variables(value, [key.key, ...key.parentKeys]).resolveWith(this);

        if (key.type === 'Date' && moment(value).isValid())
            try {
                value = moment(value).toDate();
            }
            catch (e) {
                if (DEBUG) console.log('Couldn\'t cast ' + value + ' to date', e);
            }

        return key.resolveTransforms(value);
    }

    remoteType(key: string): FetchType | undefined {
        key = this._resolveKey(key);
        const type = this.initialValues.find((v) => v.key === key)?.remoteType
        return type as FetchType;
    }

    addDict(dict: { [key: string]: any }, source: string) {
        Object.keys(dict).forEach((key) => {
            const value = dict[key];
            if (value !== undefined) {
                this.addValue(key, {
                    value: value,
                    source: (source) as ValueSource,
                });
            }
        });
    }

    addArrayDict(dict: { [key: string]: any[] }, source: string) {
        Object.keys(dict).forEach((key) => {
            const values = dict[key];
            if (values !== undefined) {
                values.forEach((value) => {
                    this.addValue(key, {
                        value: value,
                        source: (source) as ValueSource,
                    });
                });
            }
        });
    }

    get keys(): string[] {
        return this.initialValues.map((v) => v.key);
    }

    get names(): string[] {
        return this.initialValues.map((v) => v.name);
    }

    asArray(source?: string): string[] {
        return this.initialValues.map((v) => v.getCurrentValue()).filter((v) => v !== undefined) as string[];
    }

    _addArray(strings: string[], source?: string) {
        strings.forEach((s, i) => {
            this.addValue(s, {
                value: s,
                source: (source ?? 'user') as ValueSource,
            });
        });
    }

    async populateRemote() {
        await Promise.all(this.initialValues.map((v) => v.populateRemote(this)));
    }

    hasValueFor(key: string): boolean {
        key = this._resolveKey(key);
        return this.initialValues.find((v) => v.key === key)?.getCurrentValue() !== undefined;
    }

    hasValueOf(value: any): boolean {
        value = this._resolveKey(value);
        return this.initialValues.find((a) => a.initialValues.find((v) => parseVariableName(v.value) === value)) !== undefined;
    }

    hasValueForOf(key: string, value: any): boolean {
        key = this._resolveKey(key);
        value = this._resolveKey(value);
        return this.initialValues.find((v) => v.key === key)?.initialValues.find((v) => parseVariableName(v.value) === value) !== undefined;
    }

    isHidden(key: string): boolean {
        key = this._resolveKey(key);
        const value = this.initialValues.find((v) => v.key === key);
        if (value === undefined) return false;
        return value.initialValues.find((part) => part.hide)?.hide ?? false;
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
        return parseVariableName(new Variables(key, [key]).resolveWith(this));
    }

    constructor(initalValues?: Value<any>[]) {
        this.initialValues = initalValues?.map((v) => {
            return new Value(v.name, ...v.initialValues);
        }) ?? [];
    }
}

export type ValueSource = 'schedule' | 'email' | 'settings' | 'remote' | 'user';
export const VALUE_SOURCE_ORDER: ValueSource[] = ['schedule', 'email', 'settings', 'remote', 'user'];
export type ValuePart<T> = {
    value: T;
    part?: number;
    fetch?: FetchType;
    source?: ValueSource;
    message?: string;
    hide?: boolean;
}
export type FetchType = 'text' | 'airtable' | undefined;
export const EDITABLE_FETCH_TYPES = ['text'];

export class Value<T> {
    initialValues: ValuePart<T | string>[] = [];
    name: string;
    key: string;

    constructor(name: string, ...values: ValuePart<T>[]) {
        this.initialValues.push(...values);
        this.name = name;
        this.key = parseVariableName(name);
    }

    addValue(value: ValuePart<T | string>) {
        this.initialValues.push(value);
        this.sortValues();
    }

    setValue(value: T | string | undefined, source: ValueSource) {
        if (value === undefined) {
            this.initialValues = this.initialValues.filter((part) => part.source !== source);
            this.sortValues();
        } else {
            this.initialValues = this.initialValues.filter((part) => part.source !== source);
            this.initialValues.push({
                value: value,
                source: source,
            });
            this.sortValues();
        }
    }

    partialValueSource(values?: ValuePart<T | string>[]): string | undefined {
        if (!values) values = this.initialValues;
        this.sortValues();
        const currentSource = values[values.length - 1].source;
        return values.length > 1 && values.find((part) => part.part === undefined && part.source === currentSource) === undefined ? currentSource : undefined;
    }

    get currentSource(): string {
        return this.partialValueSource() ?? this.initialValues[this.initialValues.length - 1].source ?? 'user';
    }

    source(...source: string[]): Value<T | string> {
        const values = this.initialValues.filter((part) => source.includes(part.source ?? ''));
        if (values.length === 0) return new Value(this.name);
        return new Value(this.name, ...values);
    }

    getCurrentValue(showOnlyEditable: boolean = false): T | string | undefined {
        if (this.initialValues.length === 0) return undefined;
        else if (this.initialValues.length === 1) return this.initialValues[0].value;

        if (this.currentSource === 'remote' && EDITABLE_FETCH_TYPES.includes(this.originalRemoteType as string) && showOnlyEditable)
            return this.source('user').getCurrentValue() ?? this.source('settings').getCurrentValue();

        if (!this.partialValueSource(this.initialValues))
            return this.initialValues[this.initialValues.length - 1].value;

        const currentSource = this.initialValues[this.initialValues.length - 1].source;
        const parts = this.initialValues.filter((v) => v.source === currentSource)
            .reduce((acc, part) => {
                if (part.part === undefined) return acc;
                while (acc.length <= part.part)
                    acc.push('');
                acc[part.part] = part.value as string;
                return acc;
            }, [] as string[]);
        return parts.join('');
    }

    getAllValues(): any[][] | undefined {
        if (this.initialValues.length === 0) return undefined;
        else if (this.initialValues.length === 1) return [[this.initialValues[0].value]];
        let searchedValues = structuredClone(this.initialValues);

        if (!this.partialValueSource(searchedValues))
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
        }, [] as (T | string | undefined)[][]);

        return array;
    }

    get currentValue(): T | string | undefined {
        return this.getCurrentValue();
    }

    get remoteType(): FetchType {
        let source = this.partialValueSource();
        if (source === undefined)
            return this.initialValues[this.initialValues.length - 1].fetch;
        else
            return this.initialValues.find((part) => part.fetch)?.fetch;
    }

    get originalRemoteType(): FetchType {
        return this.initialValues.find((part) => part.fetch)?.fetch;
    }

    get isHidden(): boolean {
        return this.source(this.currentSource).initialValues.find((part) => part.hide)?.hide ?? false;
    }

    resolveWith(values: Values, showOnlyEditable: boolean = false) {
        let resolvedValue = this.getCurrentValue(showOnlyEditable);
        if (typeof resolvedValue === 'string')
            resolvedValue = new Variables(resolvedValue, [this.key]).resolveWith(values);
        return resolvedValue;
    }

    async populateRemote(values: Values) {
        try {
            let resolvedValue = this.resolveWith(values), promise = undefined;
            if (this.originalRemoteType && typeof resolvedValue === 'string' && this.currentSource !== 'remote' && (this.currentValue as string).length > 0)
                promise = await this._fetchRemoteValue(resolvedValue);
            if (promise)
                this.setValue(promise, 'remote');
            else if (this.originalRemoteType && typeof resolvedValue === 'string' && this.currentSource !== 'remote' && (this.currentValue as string).length > 0)
                this.setValue('', 'remote');
        } catch (e) {
            console.warn('Error fetching remote value', e);
            this.setValue('', 'remote');
        }

    }

    sortValues() {
        this.initialValues = this.initialValues.sort((a, b) =>
            (VALUE_SOURCE_ORDER.indexOf(a.source ?? 'user') ?? 0) + (a.part ?? 0 * 0.001) -
            (VALUE_SOURCE_ORDER.indexOf(b.source ?? 'user') ?? 0) - (a.part ?? 0 * 0.001));
    }

    toString() {
        return this.initialValues.map((part) => part.value).join(', ');
    }

    toArray() {
        return this.initialValues.map((part) => part.value);
    }



    async _fetchRemoteValue(url: string) {
        const fetchDef = this.initialValues.reverse().find((part) => part.fetch);
        this.initialValues.reverse();
        if (fetchDef && fetchDef.fetch === 'airtable') {
            if (DEBUG) console.log('[Airtable] Fetching setting', this.name, 'with url', url);
            const response = await fetchAirtableData(url);
            if (DEBUG) console.log('[Airtable] Fetched data', this.name, response);
            if (response && response.records && response.records.length > 0) {
                const fieldName = Object.keys(response.records[0].fields)[0];
                return response.records[0].fields[fieldName];
            }
        } else if (fetchDef && fetchDef.fetch === 'text') {
            const response = await fetch(url);
            if (response.ok) {
                if (DEBUG) console.log('[Text] Fetched data', this.name, response);
                const text = await response.text();
                if (DEBUG) console.log('[Text] Fetched data', this.name, text);
                return text;
            } else {
                throw new Error('Failed to fetch text: ' + url);
            }
        }
        return undefined;
    }

}

