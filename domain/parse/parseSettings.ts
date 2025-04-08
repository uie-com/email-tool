//  Terms for this file:
// Setting: a key-value pair that defines a value for the email, ie. "font-size": "12px"
// SettingsObject: a nested object that contains settings for different tags, ie. "TUXS" or "Upcoming Topics"
// Tags: a name of an aspect of the email, ie. "TUXS" or "Upcoming Topics"
// Settings: a simple collection of settings that are applied to an email, ie. "font-size": "12px", "font-family": "Arial"
// Bundle: a one-level object that contains all the settings, before multi-part settings have been merged

import { SettingDict, Settings, Values } from "../schema/variables";

const DEBUG = false;
// Returns a one-level bundle of the final settings for a given set of tags
export const getSettings = (settingsObject: Settings, values?: Values): Values => {
    console.log('Getting settings for', values);
    values = new Values(values?.initialValues);

    if (!values) values = new Values();
    if (settingsObject.settings as SettingDict)
        values = saveSettings(settingsObject.settings as SettingDict, values);
    values = findSettings(settingsObject, values);
    return values;


    // let identifiers: string[] | undefined = identifierDict ? Object.keys(identifierDict).map(
    //     (key) => {
    //         if (typeof identifierDict[key].value !== 'string') return '';
    //         return identifierDict[key].value
    //     }
    // ) : undefined;
    // if (!identifiers || !identifierDict) {
    //     return {};
    // }
    // const identifiersAsSettingValues = Object.keys(identifierDict || {}).reduce<{ [key: string]: SettingValue[] }>((acc, key) => {
    //     const value = identifierDict[key].value;
    //     if (!value || (value instanceof Promise)) return acc;
    //     acc[key] = [{ value: value }];
    //     return acc;
    // }, {});

    // if (DEBUG) console.log('Identifiers', identifiers);
    // if (DEBUG) console.log('Identifiers as setting values', identifiersAsSettingValues);

    // identifiers = identifiers.map((tag) => parseVariableName(tag));
    // let bundle = addSettingsToBundle(identifiersAsSettingValues, settingsObject.settings);
    // bundle = bundleSettings(bundle, settingsObject, identifiers);
    // return resolveSettingValues(bundle);
}


// Adds to/overrides settings in a bundle
// Saves all instances of values with the 'part' setting 
// Returns new bundle
function saveSettings(settings: SettingDict, values: Values) {
    if (DEBUG) console.log('Adding settings: ', settings);
    Object.keys(settings).forEach((key) => values.addValue(key, { ...settings[key], source: 'settings' }));
    if (DEBUG) console.log('To : ', values);
    return values;
}

function findSettings(settings: Settings, values: Values) {
    if (DEBUG) console.log('Searching for relevant dictionaries at', settings);
    Object.keys(settings).forEach((key) => {
        if (!values.source('email').hasValueFor(key)) return;
        if (DEBUG) console.log('Found settings for', key);
        if ((settings[key].settings as SettingDict))
            values = saveSettings(settings[key].settings as SettingDict, values);
        if ((settings[key] as Settings))
            values = findSettings(settings[key] as Settings, values);
    });
    return values;
}

// function bundleSettings(settingsBundle: { [settingName: string]: SettingValue[] }, settingsObject: any, tags: string[]) {

//     Object.keys(settingsObject).forEach((key) => {
//         if (tags.includes(parseVariableName(key))) {
//             const tagSettings = settingsObject[key].settings;
//             settingsBundle = addSettingsToBundle(settingsBundle, tagSettings);
//             settingsBundle = bundleSettings(settingsBundle, settingsObject[key], tags);
//         }
//     });

//     return settingsBundle;
// }


// function resolveSettingValues(settings: { [settingName: string]: SettingValue[] }): ValueDict {
//     let resolvedSettings: { [settingName: string]: any } = mergeMultiPartSettings(settings);
//     if (DEBUG) console.log('Resolving setting values for', resolvedSettings);

//     // Fill in variables
//     let initialValues: ValueDict = Object.keys(resolvedSettings).reduce<ValueDict>((acc, key) => {
//         acc[parseVariableName(key)] = { value: resolvedSettings[key].value };
//         return acc;
//     }, {});
//     if (DEBUG) console.log('Initial values', initialValues);
//     Object.keys(resolvedSettings).forEach((key) => {
//         if (resolvedSettings[key].value && typeof resolvedSettings[key].value === 'string' && resolvedSettings[key].value.includes('{')) {
//             resolvedSettings[key].value = fillTextVariables(resolvedSettings[key].value, initialValues, [parseVariableName(key)]);
//             if (DEBUG) console.log('Resolved variables in setting', key, resolvedSettings[key].value);
//         }
//     });


//     let fetchedSettings = fetchRemoteSettings(resolvedSettings);

//     return fetchedSettings;
// }

// function fetchRemoteSettings(settings: { [settingName: string]: SettingValue }): ValueDict {
//     let fetchedSettings: ValueDict = {};
//     if (DEBUG) console.log('Fetching remote settings', settings);

//     const keys = Object.keys(settings);
//     for (const index in keys) {
//         const key = keys[index];
//         if (settings[key]?.fetch && settings[key].fetch === 'airtable' && typeof settings[key].value === 'string') {
//             if (DEBUG) console.log('Fetching setting', key, settings[key].value);
//             fetchedSettings[key] = {
//                 value: fetch(settings[key].value, {
//                     headers: {
//                         'Authorization': `Bearer ${process.env.AIRTABLE_READ_API_KEY}`
//                     }
//                 })
//                     .then((response) => response.json())
//                     .then((data) => {
//                         if (DEBUG) console.log('Fetched data', key, data);
//                         if (data.records && data.records.length > 0) {
//                             const fieldName = Object.keys(data.records[0].fields)[0];
//                             return data.records[0].fields[fieldName];
//                         }
//                         return undefined;
//                     })
//                     .catch((error) => {
//                         console.error('Error fetching setting', key, error);
//                         return undefined;
//                     })
//             };
//             if (DEBUG) console.log('Fetched setting', key, fetchedSettings[key]);
//         } else {
//             fetchedSettings[key] = { value: settings[key].value };
//         }
//     }
//     return fetchedSettings;

// }

// function mergeMultiPartSettings(settings: { [settingName: string]: SettingValue[] }): { [settingName: string]: SettingValue } {
//     let collapsedSettings: { [settingName: string]: any } = {};
//     Object.keys(settings).forEach((key) => {
//         if (settings[key].length > 1 && settings[key].find((setting) => setting.part === undefined) === undefined) {
//             settings[key].sort((a, b) => (a.part ?? 0) - (b.part ?? 0));
//             collapsedSettings[key] = {
//                 value: settings[key].map((setting) => setting.value).join(''),
//                 fetch: settings[key].find((setting) => setting.fetch)?.fetch
//             };
//         } else {
//             collapsedSettings[key] = {
//                 value: settings[key][0].value,
//                 fetch: settings[key].find((setting) => setting.fetch)?.fetch
//             };
//         }
//     });
//     return collapsedSettings;
// }

// export function testSettings(settingsObject: any, identifiers?: string[]): { [settingName: string]: any } {
//     if (!identifiers) {
//         identifiers = getAllIdentifiers(EMAIL_TYPES)
//     }
//     console.log(identifiers);
//     identifiers = identifiers.map((tag) => parseVariableName(tag));
//     const rootSettings = settingsObject.settings;
//     let bundle = addAllSettingsToBundle({}, rootSettings);
//     bundle = testBundleSettings(bundle, settingsObject, identifiers);

//     return bundle;
// }

// function testBundleSettings(settingsBundle: { [settingName: string]: TestSettingValue[] }, settingsObject: any, tags: string[]) {

//     Object.keys(settingsObject).forEach((key) => {
//         if (tags.includes(parseVariableName(key))) {
//             const tagSettings = settingsObject[key].settings;
//             settingsBundle = addAllSettingsToBundle(settingsBundle, tagSettings);
//             settingsBundle = testBundleSettings(settingsBundle, settingsObject[key], tags);
//         }
//     });

//     return settingsBundle;
// }

// // Doesn't override settings, for testing
// function addAllSettingsToBundle(bundle: { [settingName: string]: TestSettingValue[] }, settings: { [settingName: string]: TestSettingValue }) {
//     Object.keys(settings).forEach((key) => {
//         if (settings[key].part) {
//             if (bundle[key]) {
//                 while (bundle[key].length <= settings[key].part) {
//                     bundle[key].push({ value: [], part: bundle[key].length });
//                 }
//                 if (!bundle[key][settings[key].part])
//                     bundle[key][settings[key].part] = (settings[key]);
//                 else
//                     bundle[key][settings[key].part].value.push(...[settings[key].value].flat());
//             } else {
//                 bundle[key] = [settings[key]];
//             }

//         } else {
//             bundle[key] = [settings[key]];
//         }
//     });
//     return bundle;
// }