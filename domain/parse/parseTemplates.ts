export function fixTemplate(template: string): string {
    return template
        .replaceAll('#2CB543', '#{Accent Color}')
        .replaceAll('#31CB4B', '#{Accent Color}');
}