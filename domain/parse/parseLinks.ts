
export function createTemplateLink(id?: string) {
    return `https://centercentre.activehosted.com/campaign/template/?tid=${id ?? ''}`;
}

export function createCampaignLink(id?: string) {
    return `https://centercentre.activehosted.com/app/campaigns/${id ?? ''}`;
}

export function createAutomationLink(id?: string) {
    return `https://centercentre.activehosted.com/series/${id ?? ''}`;
}

export function createGoogleDocLink(id?: string) {
    return `https://docs.google.com/document/d/${id ?? ''}/edit`;
}

export function createNotionUri(url?: string) {
    return url?.replaceAll('https://', 'notion://') ?? '';
}

export const AIRTABLE_LINK = 'https://airtable.com/appHcZTzlfXAJpL7I/tblnfXd0SIViOkj6z';