const config = {
    program: [
        {
            name: 'Win',
            urlIdentifier: 'stakeholders', // 'how-to-win-stakeholders' in URL
            slackChannelId: 'C03J1RT45V5',
            officialProgramTitle: 'How to Win Stakeholders & Influence Decisions',
            emailTag: '', // set later based on cohort month
            cohortType: 'monthYear', // monthYear or number
            priceTypeOptions: [
                { slug: 'individual', label: 'Individual', message: '<em><strong>Please Note: </strong>This was a limited time offer of the special extra discounted price of <s>$2,697</s> <strong>$1,697</strong> for this program.</em>' },
                { slug: 'team', label: 'Team', message: '<em><strong>Please Note: </strong>This was a limited time offer of the special extra discounted price of <s>$2,397</s> <strong>$1,497</strong> for this program.</em>' },
            ],
            discountOptions: [
                { slug: 'INFLUENCE2025', message: '<em><strong>Please Note: </strong>This was a limited time offer of the special extra discounted price of <s>$2,697</s> <strong>$1,697</strong> for this program.</em>' },
            ]
        },
        {
            name: 'Metrics',
            urlIdentifier: 'metrics',
            slackChannelId: 'C02HY4J4P2L',
            officialProgramTitle: 'Outcome-Driven UX Metrics',
            emailTag: 'METRICS',
            cohortType: 'number',
            priceTypeOptions: [
                { slug: 'individual', label: 'Individual' },
                { slug: 'team', label: 'Team' },
                { slug: 'unemployed', label: 'Unemployed' },
            ],
            discountOptions: []
        },
        {
            name: 'Research',
            urlIdentifier: 'research',
            slackChannelId: 'C02HY4J4P2L',
            officialProgramTitle: 'Adv. Strategic UX Research',
            emailTag: 'RESEARCH',
            cohortType: 'number',
            priceTypeOptions: [
                { slug: 'individual', label: 'Individual' },
                { slug: 'team', label: 'Team' },
                { slug: 'unemployed', label: 'Unemployed' },
            ],
            discountOptions: []
        },
        {
            name: 'Vision',
            urlIdentifier: 'vision',
            slackChannelId: 'C02HY4J4P2L',
            officialProgramTitle: 'Craft + Lead a Strategic UX Vision',
            emailTag: 'VISION',
            cohortType: 'number',
            priceTypeOptions: [
                { slug: 'individual', label: 'Individual' },
                { slug: 'team', label: 'Team' },
                { slug: 'unemployed', label: 'Unemployed' },
            ],
            discountOptions: []
        },
    ]


}

output = {
    // Error handling
    success: true,
    message: '',

    // Program
    program: '',
    officialProgramTitle: '',

    // Price outputs
    price: 0,           // in cents
    priceInDollars: 0,

    // Product outputs
    priceType: '', // 'Individual', 'Team'
    extraReceiptMessage: '<br/>', // Discount messages

    // Cohort outputs
    cohortAirtableName: '', // 'Cohort X' or 'August 2025'
    cohortAutomationName: '', // 'CX' or 'August'
    cohortDisplayName: '', // 'Cohort X' or 'August 2025 Cohort'
    cohortSalesReportName: '', // 'CX' or 'August 2025'
    emailTag: '', // 'METRICS COHORT X' or 'AUG'

    // Card
    cardType: '', // Visa

    // Slack
    slackChannelId: '', // Where to send sales message
}

const urlSlug = inputData.checkoutSlug;
if (!urlSlug || urlSlug.length === 0 || typeof urlSlug != 'string') {
    output.message = "Couldn't find checkout URL Slug: " + urlSlug;
    output.success = false;

    return output;
}

// Find program

const programConfig = config.program.find(prog => urlSlug.includes(prog.urlIdentifier));
if (programConfig) {
    output.program = programConfig.name;
    output.officialProgramTitle = programConfig.officialProgramTitle;
    output.slackChannelId = programConfig.slackChannelId;
    output.emailTag = programConfig.emailTag;
}

if (output.program === '') {
    output.message = "Couldn't find program in URL Slug: " + urlSlug;
    output.success = false;

    return output;
}


// Find cohort

// Numbered cohorts  ex. '-cohort3' or '-cohort-3'
if (programConfig.cohortType === 'number') {
    let cohortNumberStr = urlSlug.split('cohort')[1]; // characters after 'cohort'
    cohortNumberStr = cohortNumberStr.replace(/\D/g, ""); // remove everything that is not a number

    try {
        const cohortNumber = parseInt(cohortNumberStr);

        output.cohort = cohortNumber;
        output.cohortAutomationName = 'C' + cohortNumber;
        output.cohortSalesReportName = 'C' + cohortNumber;
        output.cohortAirtableName = 'Cohort ' + cohortNumber;
        output.cohortDisplayName = 'Cohort ' + cohortNumber;
        output.emailTag += ' COHORT ' + cohortNumber;

    } catch (error) {
        output.message = "Couldn't understand cohort number '" + cohortNumberStr + "' in: " + urlSlug;
        output.success = false;

        return output;
    }
} else if (programConfig.cohortType === 'monthYear') { // Win cohorts  ex. '-august2025'
    const splitByDashes = urlSlug.split('-');
    const lastSection = splitByDashes[splitByDashes.length - 1];

    let yearStr = lastSection.replace(/\D/g, ""); // only numbers of string
    let monthStr = lastSection.replace(/[^a-zA-Z]/g, ""); // only letters of string

    monthStr = monthStr.substring(0, 1).toUpperCase() + monthStr.substring(1);

    const cohort = monthStr + " " + yearStr;

    output.cohort = cohort;
    output.cohortAutomationName = monthStr;
    output.cohortSalesReportName = cohort;
    output.cohortAirtableName = cohort;
    output.cohortDisplayName = cohort + ' Cohort';
    output.emailTag = monthStr.substring(0, 3).toUpperCase();
}

if (!output.cohort || (typeof output.cohort === 'string' && output.cohort.trim().length === 0) || (typeof output.cohort === 'number' && output.cohort <= 0)) {
    output.message = "Couldn't find cohort in: " + urlSlug;
    output.success = false;

    return output;
}

// Price

const price = inputData.price;

try {
    output.price = Number(price);
} catch (error) {
    output.message = "Couldn't understand price from: " + price;
    output.success = false;

    return output;
}

if (typeof output.price !== 'number') {
    output.message = "Couldn't find purchase price: " + price;
    output.success = false;

    return output;
}

const priceInDollars = output.price / 100;
output.priceInDollars = priceInDollars.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});;

// Price Type

const priceTypeSlug = input.priceType;
if (!priceTypeSlug || priceTypeSlug.length === 0 || typeof priceTypeSlug != 'string') {
    output.message = "Couldn't find price type slug: " + priceTypeSlug;
    output.success = false;

    return output;
}

const priceTypeOption = programConfig.priceTypeOptions.find(option => priceTypeSlug.includes(option.slug));

output.priceType = priceTypeOption ? priceTypeOption.label : '';
output.extraReceiptMessage = priceTypeOption && priceTypeOption.message ? priceTypeOption.message : '<br/>';

if (output.priceType.length === 0) {
    output.message = "Couldn't find price type for '" + priceTypeSlug + "' in " + output.program;
    output.success = false;

    return output;
}

// Discount code

const discountCode = inputData.discountCode;
if (discountCode && discountCode.length > 0 && typeof discountCode === 'string') {
    const discountOption = programConfig.discountOptions.find(option => discountCode.includes(option.slug));

    if (discountOption && discountOption.message) {
        output.extraReceiptMessage += discountOption.message;
    }
}

// Card type

output.cardType = inputData.cardType.substring(0, 1).toUpperCase() + inputData.cardType.substring(1);

return output;
