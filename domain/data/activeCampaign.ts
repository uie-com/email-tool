
export function createTemplateLink(id?: string) {
    return `https://centercentre.activehosted.com/campaign/template/?tid=${id ?? ''}`;
}

export function createCampaignLink(id?: string) {
    return `https://centercentre.activehosted.com/app/campaigns/${id ?? ''}`;
}

export function createAutomationLink(id?: string) {
    return `https://centercentre.activehosted.com/series/${id ?? ''}`;
}