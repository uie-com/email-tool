//  Terms for this file:
// Setting: a key-value pair that defines a value for the email, ie. "font-size": "12px"
// SettingsObject: a nested object that contains settings for different tags, ie. "TUXS" or "Upcoming Topics"
// Tags: a name of an aspect of the email, ie. "TUXS" or "Upcoming Topics"
// Bundle: a simple collection of settings that are applied to an email, ie. "font-size": "12px", "font-family": "Arial"

import { parseVariableName } from "../parse/parseVariables";


// Returns a one-level bundle of the final settings for a given set of tags
export const getSettingsForTags = (settingsObject: any, tags: string[]) => {
    tags = tags.map((tag) => parseVariableName(tag));
    return bundleSettings({}, settingsObject, tags);
}

function bundleSettings(settingsBundle: any, settingsObject: any, tags: string[]) {

    Object.keys(settingsObject).forEach((key) => {
        if (tags.includes(parseVariableName(key))) {
            const tagSettings = settingsObject[key].settings;
            settingsBundle = addSettingsToBundle(settingsBundle, tagSettings);
            settingsBundle = bundleSettings(settingsBundle, settingsObject[key], tags);
        }
    });

    return settingsBundle;
}

// Adds to / overrides settings in a bundle
// Supports adding / concatenating to a setting with the 'add' key 
// Returns new bundle
function addSettingsToBundle(bundle: any, settings: any) {
    Object.keys(settings).forEach((key) => {
        if (parseVariableName(key) === 'add') {
            Object.keys(settings[key]).forEach((addKey) => {
                if (bundle[addKey]) {
                    bundle[addKey] = bundle[addKey] + settings[key][addKey];
                } else {
                    bundle[addKey] = settings[key][addKey];
                }
            });
        } else {
            bundle[key] = settings[key];
        }
    });
    return bundle;
}
