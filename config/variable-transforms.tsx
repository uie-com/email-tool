import moment from "moment-timezone";
import { shortenIdentifier } from "../domain/parse/parsePrograms";

import { render } from '@react-email/render';
import { Markdown } from "@react-email/markdown";
import { Values } from "../domain/schema/valueCollection";
import { Variables } from "../domain/schema/variableCollection";
import { parse } from "path";
const renderToString = require('react-dom/server').renderToStaticMarkup;




export function resolveTransforms(transforms: string[], value: any, context: Values): Promise<any> {
    let remainingTransforms = [...transforms];

    // Date-specific transforms
    if (value instanceof Date || value instanceof moment) {
        // Enforce ET timezone
        value = moment(value).tz('America/New_York', true);

        // Timezone conversion ex. (America/New_York) or (GMT)
        const timezoneTransform = remainingTransforms.find(transform =>
            moment.tz.names().includes(transform)
            || transform === 'GMT'
        );
        if (timezoneTransform)
            value = moment(value).tz(timezoneTransform);
        remainingTransforms = remainingTransforms.filter(transform => transform !== timezoneTransform);

        // Day add or subtract ex. (+1d) or (-1d)
        const dateTransform = remainingTransforms.find(transform =>
            (transform.substring(0, 1) === '+' || transform.substring(0, 1) === '-')
            && (transform.substring(transform.length - 1, transform.length) === 'd')
        );
        if (dateTransform)
            value = moment(value).add(parseInt(dateTransform.substring(0, dateTransform.length - 1)), 'days').toDate();
        remainingTransforms = remainingTransforms.filter(transform => transform !== dateTransform);

        // Hour add or subtract ex. (+1h) or (-1h)
        const hourTransform = remainingTransforms.find(transform =>
            (transform.substring(0, 1) === '+' || transform.substring(0, 1) === '-')
            && (transform.substring(transform.length - 1, transform.length) === 'h')
        );
        if (hourTransform)
            value = moment(value).add(parseInt(hourTransform.substring(0, hourTransform.length - 1)), 'hours').toDate();
        remainingTransforms = remainingTransforms.filter(transform => transform !== hourTransform);

        // Month add or subtract ex. (+1M) or (-1M)
        const monthTransform = remainingTransforms.find(transform =>
            (transform.substring(0, 1) === '+' || transform.substring(0, 1) === '-')
            && (transform.substring(transform.length - 1, transform.length) === 'M')
        );
        if (monthTransform)
            value = moment(value).add(parseInt(monthTransform.substring(0, monthTransform.length - 1)), 'months').toDate();
        remainingTransforms = remainingTransforms.filter(transform => transform !== monthTransform);

        // Day before ex. (Monday before)
        const dayBeforeTransform = remainingTransforms.find(transform =>
            transform.endsWith(' Before')
        );
        const newDateBefore = moment(value);
        while (dayBeforeTransform && newDateBefore.format('dddd') !== dayBeforeTransform.substring(0, dayBeforeTransform.length - ' Before'.length)) {
            newDateBefore.subtract(1, 'days');
        }
        if (dayBeforeTransform && newDateBefore.isValid())
            value = newDateBefore.toDate();
        remainingTransforms = remainingTransforms.filter(transform => transform !== dayBeforeTransform);

        // Day after ex. (Monday after)
        const dayAfterTransform = remainingTransforms.find(transform =>
            transform.endsWith(' After')
        );
        const newDateAfter = moment(value);
        while (dayAfterTransform && newDateAfter.format('dddd') !== dayAfterTransform.substring(0, dayAfterTransform.length - ' After'.length)) {
            newDateAfter.add(1, 'days');
        }
        if (dayAfterTransform && newDateAfter.isValid())
            value = newDateAfter.toDate();
        remainingTransforms = remainingTransforms.filter(transform => transform !== dayAfterTransform);

        // Override time ex. (12:00pm)
        const timeTransform = remainingTransforms.find(transform =>
            transform.match(/^\d{1,2}:\d{2}(am|pm)$/)
        );
        const time = moment(timeTransform, 'hh:mmA');
        const dateWithNewTime = moment(moment(value).set('hour', time.hour()).set('minute', time.minute()));
        if (timeTransform && dateWithNewTime.isValid())
            value = dateWithNewTime.toDate();
        remainingTransforms = remainingTransforms.filter(transform => transform !== timeTransform);


        // THIS CODE NEEDS TO BE LAST, WE CAN'T INTERPRET VALUE AS A DATE AFTER
        // Format date into string ex. (YYYY-MM-DD)
        const formatTransform = remainingTransforms.find(transform =>
            transform.includes('YY') || transform.includes('MM') || transform.includes('DD')
            || transform.includes('hh') || transform.includes('mm') || transform.includes('ss') || transform.includes('dd') || transform === 'z'
        );
        if (formatTransform)
            value = moment(value).format(formatTransform);
        remainingTransforms = remainingTransforms.filter(transform => transform !== formatTransform);
    }

    // String-specific transforms
    if (typeof value === 'string') {
        value = value as string;

        // Iterate variable: {Text to Repeat (Iterate x{Number})}
        // Increments all '#1's in original string to '#2', '#3', etc.
        // Inside of incremental value, use [] instead of {} for variables to be resolved _after_ iteration
        const iterateTransform = remainingTransforms.find(transform =>
            transform.includes('Iterate x')
        );
        if (iterateTransform) {
            const number = parseInt(iterateTransform.substring(iterateTransform.indexOf('x') + 1, iterateTransform.length));
            const textToRepeat = value;
            const repeatedText = Array.from({ length: number }, (_, i) => {
                return textToRepeat.replaceAll('#1', '#' + (i + 1).toString()).replaceAll('|[', '{|{').replaceAll(']|', '}|}').replaceAll('[', '{').replaceAll(']', '}').replaceAll('{|{', '[').replaceAll('}|}', ']');
            }).join('');
            if (context.initialValues.length > 0)
                value = new Variables(repeatedText).resolveWith(context);
            else
                value = repeatedText;
        }
        remainingTransforms = remainingTransforms.filter(transform => transform !== iterateTransform);


        // Add to number ex. (+1)
        const addToNumberTransform = remainingTransforms.find(transform =>
            transform.includes('+')
            && !Number.isNaN(parseInt(transform.substring(1, transform.length)))
        );
        if (addToNumberTransform) {
            const numberToAdd = parseInt(addToNumberTransform.substring(1, addToNumberTransform.length));
            const number = parseInt(value.split(' ')[value.split(' ').length - 1]);
            if (!isNaN(number)) {
                value = value.replaceAll(number.toString(), (number + numberToAdd).toString());
            }
        }
        remainingTransforms = remainingTransforms.filter(transform => transform !== addToNumberTransform);


        // Remove :00 ex. (-:00)
        const remove00Transform = remainingTransforms.find(transform =>
            transform.includes(':00')
        );
        if (remove00Transform)
            value = value.replace(/:00/g, '');
        remainingTransforms = remainingTransforms.filter(transform => transform !== remove00Transform);

        // Next Cohort 'April 2025' -> 'March 2025' OR 'Cohort 2' -> 'Cohort 3' ex. (Next Cohort)
        const nextCohortTransform = remainingTransforms.find(transform =>
            transform.includes('Next Cohort')
        );
        if (nextCohortTransform) {
            const cohortRegex = /Cohort (\d+)/;
            const match = value.match(cohortRegex);
            if (match) {
                const cohortNumber = parseInt(match[1]) + 1;
                value = value.replace(cohortRegex, `Cohort ${cohortNumber}`);
            } else {
                const dateRegex = /(\w+ \d{4})/;
                const matchDate = value.match(dateRegex);
                if (matchDate) {
                    const date = moment(matchDate[0]);
                    date.add(1, 'month');
                    value = value.replace(dateRegex, date.format('MMMM YYYY'));
                }
            }
        }
        remainingTransforms = remainingTransforms.filter(transform => transform !== nextCohortTransform);

        /// Shorthand like 'Cohort ' -> 'C' ex. (Shorthand)
        const shorthandTransform = remainingTransforms.find(transform =>
            transform.includes('Shorthand')
        );
        if (shorthandTransform)
            value = shortenIdentifier(value);
        remainingTransforms = remainingTransforms.filter(transform => transform !== shorthandTransform);

        /// First Word like 'April 2024' -> 'April' ex. (First Word)
        const monthShorthandTransform = remainingTransforms.find(transform =>
            transform.includes('First Word')
        );
        if (monthShorthandTransform)
            value = value.split(' ')[0];
        remainingTransforms = remainingTransforms.filter(transform => transform !== monthShorthandTransform);

        // Just numbers ex. (#)
        const numberTransform = remainingTransforms.find(transform =>
            transform === '#'
        );
        if (numberTransform)
            value = value.replace(/[^0-9]/g, '');
        remainingTransforms = remainingTransforms.filter(transform => transform !== numberTransform);

        // All Caps ex. (Caps)
        const capsTransform = remainingTransforms.find(transform =>
            transform.includes('Caps')
        );
        if (capsTransform)
            value = value.toUpperCase();
        remainingTransforms = remainingTransforms.filter(transform => transform !== capsTransform);

        // Title Case ex. (Title Case)
        const titleCaseTransform = remainingTransforms.find(transform =>
            transform.includes('Title Case')
        );
        if (titleCaseTransform)
            value = value.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        remainingTransforms = remainingTransforms.filter(transform => transform !== titleCaseTransform);

        // Shorten to X letters ex. (3 Letters)
        const shortenTransform = remainingTransforms.find(transform =>
            transform.includes('Letters')
        );
        if (shortenTransform)
            value = value.substring(0, parseInt(shortenTransform.replace(' Letters', '')));
        remainingTransforms = remainingTransforms.filter(transform => transform !== shortenTransform);

        // Replace spaces with dashes ex. (Tag)
        const tagTransform = remainingTransforms.find(transform =>
            transform.includes('Tag')
        );
        if (tagTransform)
            value = value.replaceAll('  ', ' ').replaceAll(' ', '-');
        remainingTransforms = remainingTransforms.filter(transform => transform !== tagTransform);

        // Convert number to once, twice, etc. ex. (Number to Adverb)
        const numberToAdverbTransform = remainingTransforms.find(transform =>
            transform.includes('Number to Adverb')
        );
        if (numberToAdverbTransform) {
            const number = parseInt(value);
            if (!isNaN(number)) {
                if (number === 1) {
                    value = 'once';
                } else if (number === 2) {
                    value = 'twice';
                } else {
                    value = numberToName(number);
                }
            } else {
                console.warn('Value is not a number for Number to Adverb transform:', value);
            }
        }
        remainingTransforms = remainingTransforms.filter(transform => transform !== numberToAdverbTransform);

        // Convert number to once, twice, etc. ex. (Number to Word)
        const numberToWordTransform = remainingTransforms.find(transform =>
            transform.includes('Number to Word')
        );
        if (numberToWordTransform) {
            const number = parseInt(value);
            if (!isNaN(number)) {
                value = numberToName(number);
            } else {
                console.warn('Value is not a number for Number to Word transform:', value);
            }
        }
        remainingTransforms = remainingTransforms.filter(transform => transform !== numberToWordTransform);

        // Convert TUXS Descriptions to (1st Person)
        const tuxsTransform = remainingTransforms.find(transform =>
            transform.includes('1st Person')
        );
        if (tuxsTransform) {
            value = value
                .replaceAll('Jared Spool', 'me')
                .replaceAll('Jared', 'me')
                .replaceAll(' he ', ' I ')
                .replaceAll(' explores ', ' explore ')
                .replaceAll(' his ', ' my ')
        }
        remainingTransforms = remainingTransforms.filter(transform => transform !== tuxsTransform);

        // Grab only last paragraph ex. (Last Paragraph)
        const lastParagraphTransform = remainingTransforms.find(transform =>
            transform.includes('Last Paragraph')
        );
        if (lastParagraphTransform) {
            const paragraphs = value.trim().split('\n');
            const lastParagraph = paragraphs[paragraphs.length - 1];
            value = lastParagraph;
        }
        remainingTransforms = remainingTransforms.filter(transform => transform !== lastParagraphTransform);

        // Convert markdown to HTML ex. (MD to HTML)
        const markdownTransform = remainingTransforms.find(transform =>
            transform.includes('MD to HTML')
        );
        const defaultStyles = {
            'fontFamily': '' + (context.getCurrentValue('Font') ?? 'arial') + ', helvetica neue, helvetica, sans-serif',
            margin: 0,
            'color': '#333333',
            'letterSpacing': '0',
            'marginBottom': '1.33rem',
            'lineHeight': '24px',
            'fontSize': '16px',
        };
        if (markdownTransform) {
            value = renderToString((<Markdown
                markdownCustomStyles={{
                    p: {
                        ...defaultStyles,
                    },
                    li: {
                        ...defaultStyles,
                        'marginBottom': '0.75rem',
                    },
                    ul: {
                        ...defaultStyles,
                        'marginTop': '-0.66rem',
                    },
                    h1: {
                        ...defaultStyles,
                        'fontSize': '28px',
                        'paddingTop': '2rem',
                        'paddingBottom': '0.25rem',
                    },
                    h2: {
                        ...defaultStyles,
                        'fontSize': '24px',
                        'paddingTop': '1rem',
                        'paddingBottom': '0.25rem',

                    },
                    h3: {
                        ...defaultStyles,
                        'fontSize': '20px',
                        'paddingTop': '1.25rem',
                        'paddingBottom': '0.25rem',
                    },

                    link: {
                        'textDecoration': context && context.getCurrentValue ? context.getCurrentValue('Link Text Decoration') as string ?? 'underline' : 'underline',
                        'color': context && context.getCurrentValue ? context.getCurrentValue('Link Color') as string : '#007bff',
                    }
                }}
            >{removeEscapes(value as string)}</Markdown >))
                .replaceAll('<li', '<li><p')
                .replaceAll('/li>', '/p></li>')
        }
        remainingTransforms = remainingTransforms.filter(transform => transform !== markdownTransform);
    }

    if (remainingTransforms.length > 0)
        console.warn('Unrecognized transforms: ', remainingTransforms);

    return value;
}


function removeEscapes(str: string): string {
    return str.replaceAll('\\_', '_').replaceAll('\\**', '**').replaceAll('\\-', '-');
}

import converter from 'number-to-words';
function numberToName(i: number): string {
    return converter.toWords(i);
}