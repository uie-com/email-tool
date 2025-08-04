//  Terms for this file:
// Setting: a key-value pair that defines a value for the email, ie. "font-size": "12px"
// SettingsObject: a nested object that contains settings for different tags, ie. "TUXS" or "Upcoming Topics"
// Tags: a name of an aspect of the email, ie. "TUXS" or "Upcoming Topics"
// Settings: a simple collection of settings that are applied to an email, ie. "font-size": "12px", "font-family": "Arial"
// Bundle: a one-level object that contains all the settings, before multi-part settings have been merged

import { SETTINGS } from "../../config/email-settings/email-settings";
import { SettingDict, Settings } from "../schema";
import { ValuePart, Values } from "./valueCollection";

const DEBUG = false;

// Returns a one-level bundle of the final settings for a given set of tags
export const initializeSettings = (values?: Values): Values => {
    values = new Values(values?.initialValues);
    if (DEBUG) console.log('\n\n\n\n[SETTINGS] Starting settings for email: ' + values.getCurrentValue('Program') + values.getCurrentValue('Email Type'));

    if (!values) values = new Values();
    if (SETTINGS.settings as SettingDict<ValuePart<any>>)
        values = saveSettings(SETTINGS.settings as SettingDict<ValuePart<any>>, values);
    values = findSettings(SETTINGS, values);
    if (DEBUG) console.log('\n[SETTINGS] Final settings: ', values.getCurrentValue('Link Color'));
    return values;
}

function saveSettings(settings: SettingDict<ValuePart<any>>, values: Values) {
    if (DEBUG) console.log('[SETTINGS] Adding settings: ', settings);
    Object.keys(settings).forEach((key) => values.addValue(key, { ...settings[key], source: 'settings' }));
    return values;
}

function findSettings(settings: Settings<ValuePart<any>>, values: Values) {
    Object.keys(settings).forEach((key) => {
        let [keyName, keyValue] = key.split(':');
        if (keyName.startsWith('Is'))
            keyValue = keyName;
        else if (!keyName || !keyValue && key !== 'settings')
            console.warn('Invalid settings filter key: "' + key + '". This should be in the form of "key:value"');

        if (!values.source('email').hasValueForOf(keyName, keyValue) && !values.source('schedule').hasValueForOf(keyName, keyValue) && !values.source('settings').hasValueForOf(keyName, keyValue)) {
            if (DEBUG) console.log('\n[SETTINGS] Not a match for', key);
            return;
        }
        if (DEBUG) console.log('\n[SETTINGS] Found match for', key);
        if ((settings[key].settings as SettingDict<ValuePart<any>>))
            values = saveSettings(settings[key].settings as SettingDict<ValuePart<any>>, values);
        if ((settings[key] as Settings<ValuePart<any>>))
            values = findSettings(settings[key] as Settings<ValuePart<any>>, values);
    });
    return values;
}
