import Validator from "validatorjs";

export function isValidHttpUrl(string: string) {
    const validator = new Validator({ url: string }, { url: 'url' });
    return validator.passes();
}
