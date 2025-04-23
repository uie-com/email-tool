import moment from "moment-timezone";
import { shortenIdentifier } from "./parsePrograms";

import { render } from '@react-email/render';
import { Markdown } from "@react-email/markdown";
import { renderToString } from 'react-dom/server';




export function resolveTransforms(transforms: string[], value: any): Promise<any> {
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
            || transform.includes('hh') || transform.includes('mm') || transform.includes('ss') || transform.includes('dd') || transform.includes(':')
        );
        if (formatTransform)
            value = moment(value).format(formatTransform);
        remainingTransforms = remainingTransforms.filter(transform => transform !== formatTransform);
    }

    // String-specific transforms
    if (typeof value === 'string') {
        value = value as string;

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

        // Convert markdown to HTML ex. (MD to HTML)
        const markdownTransform = remainingTransforms.find(transform =>
            transform.includes('MD to HTML')
        );
        const defaultStyles = {
            'fontFamily': 'arial, helvetica neue, helvetica, sans-serif',
            margin: 0,
            'color': '#333333',
            'letterSpacing': '0',
            'marginBottom': '1rem',
            'lineHeight': '24px',
            'fontSize': '16px',
        };
        if (markdownTransform)
            value = renderToString((<Markdown
                markdownCustomStyles={{
                    p: {
                        ...defaultStyles,
                    },
                    li: {
                        ...defaultStyles,
                    },
                    ul: {
                        ...defaultStyles,
                        'marginBottom': '-0.5rem',
                    }
                }}
            >{value as string}</Markdown >))
                .replaceAll('<li', '<li><p')
                .replaceAll('/li>', '/p></li>')
        remainingTransforms = remainingTransforms.filter(transform => transform !== markdownTransform);
    }

    if (remainingTransforms.length > 0)
        console.warn('Unrecognized transforms: ', remainingTransforms);

    return value;
}
