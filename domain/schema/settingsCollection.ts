export type Settings<T> = {
    [identifier: string]: Settings<T> | SettingDict<T>;
}
export type SettingDict<T> = { [key: string]: T };