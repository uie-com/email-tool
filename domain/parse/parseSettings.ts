//  Terms for this file:
// Setting: a key-value pair that defines a value for the email, ie. "font-size": "12px"
// SettingsObject: a nested object that contains settings for different tags, ie. "TUXS" or "Upcoming Topics"
// Tags: a name of an aspect of the email, ie. "TUXS" or "Upcoming Topics"
// Settings: a simple collection of settings that are applied to an email, ie. "font-size": "12px", "font-family": "Arial"
// Bundle: a one-level object that contains all the settings, before multi-part settings have been merged

import { parseVariableName } from "./parseVariables";
import { SettingValue, TestSettingValue } from "../schema";
import { getAllIdentifiers } from "./parsePrograms";
import { PROGRAM_VALUES } from "../settings/emails";
import { PROGRAM_SCHEMA } from "../settings/programs";


// Returns a one-level bundle of the final settings for a given set of tags
export const getSettings = (settingsObject: any, identifiers?: string[]): { [settingName: string]: any } => {
    if (!identifiers) {
        return {};
    }
    identifiers = identifiers.map((tag) => parseVariableName(tag));
    const bundle = bundleSettings({}, settingsObject, identifiers);
    return mergeMultiPartSettings(bundle);
}

function bundleSettings(settingsBundle: { [settingName: string]: SettingValue[] }, settingsObject: any, tags: string[]) {

    Object.keys(settingsObject).forEach((key) => {
        if (tags.includes(parseVariableName(key))) {
            const tagSettings = settingsObject[key].settings;
            settingsBundle = addSettingsToBundle(settingsBundle, tagSettings);
            settingsBundle = bundleSettings(settingsBundle, settingsObject[key], tags);
        }
    });

    return settingsBundle;
}

// Adds to/overrides settings in a bundle
// Saves all instances of values with the 'part' setting 
// Returns new bundle
function addSettingsToBundle(bundle: { [settingName: string]: SettingValue[] }, settings: { [settingName: string]: SettingValue }) {
    Object.keys(settings).forEach((key) => {
        if (settings[key].part) {
            if (bundle[key]) {
                while (bundle[key].length <= settings[key].part) {
                    bundle[key].push({ value: '', part: bundle[key].length });
                }
                bundle[key][settings[key].part] = (settings[key]);
            } else {
                bundle[key] = [settings[key]];
            }

        } else {
            bundle[key] = [settings[key]];
        }
    });
    return bundle;
}

function mergeMultiPartSettings(settings: { [settingName: string]: SettingValue[] }): { [settingName: string]: any } {
    let collapsedSettings: { [settingName: string]: any } = {};
    Object.keys(settings).forEach((key) => {
        if (settings[key].length > 1 && settings[key].find((setting) => setting.part === undefined) === undefined) {
            settings[key].sort((a, b) => (a.part ?? 0) - (b.part ?? 0));
            collapsedSettings[key] = settings[key].map((setting) => setting.value).join('');
        } else {
            collapsedSettings[key] = settings[key][0].value;
        }
    });
    return collapsedSettings;
}

export function testSettings(settingsObject: any, identifiers?: string[]): { [settingName: string]: any } {
    if (!identifiers) {
        identifiers = getAllIdentifiers(PROGRAM_SCHEMA)
    }
    console.log(identifiers);
    identifiers = identifiers.map((tag) => parseVariableName(tag));
    const bundle = testBundleSettings({}, settingsObject, identifiers);

    return bundle;
}

function testBundleSettings(settingsBundle: { [settingName: string]: TestSettingValue[] }, settingsObject: any, tags: string[]) {

    Object.keys(settingsObject).forEach((key) => {
        if (tags.includes(parseVariableName(key))) {
            const tagSettings = settingsObject[key].settings;
            settingsBundle = addAllSettingsToBundle(settingsBundle, tagSettings);
            settingsBundle = testBundleSettings(settingsBundle, settingsObject[key], tags);
        }
    });

    return settingsBundle;
}

// Doesn't override settings, for testing
function addAllSettingsToBundle(bundle: { [settingName: string]: TestSettingValue[] }, settings: { [settingName: string]: TestSettingValue }) {
    Object.keys(settings).forEach((key) => {
        if (settings[key].part) {
            if (bundle[key]) {
                while (bundle[key].length <= settings[key].part) {
                    bundle[key].push({ value: [], part: bundle[key].length });
                }
                if (!bundle[key][settings[key].part])
                    bundle[key][settings[key].part] = (settings[key]);
                else
                    bundle[key][settings[key].part].value.push(...[settings[key].value].flat());
            } else {
                bundle[key] = [settings[key]];
            }

        } else {
            bundle[key] = [settings[key]];
        }
    });
    return bundle;
}