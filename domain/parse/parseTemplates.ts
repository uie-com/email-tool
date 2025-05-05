import { Values } from "../schema/valueCollection";

export function fixTemplate(template: string | undefined, values: Values) {
    if (!template)
        return undefined;

    if (values.resolveValue('Global Styles', true))
        template = template.substring(0, template.lastIndexOf('</style>'))
            + values.resolveValue('Global Styles', true).replaceAll('[', '{').replaceAll(']', '}')
            + template.substring(template.lastIndexOf('</style>'));

    return template
        .replaceAll('#2CB543', '#{Accent Color}')
        .replaceAll('#31CB4B', '#{Accent Color}')
        .replaceAll('#75de43', '{Link Color}')
}