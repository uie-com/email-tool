
export const PROGRAM_COLORS = {
    'Metrics': '#056368',
    'Research': '#652450',
    'Win': '#8c9b28',
    'Stand Out': '#e26730',
    'Visions': '#00a5b7',
    'TUXS': '#00a3b4',
    'AI': '#bd1f23',
}

export const DAY_OF_WEEK_COLOR = {
    'Monday': 'blue',
    'Tuesday': 'cyan',
    'Wednesday': 'lime',
    'Thursday': 'yellow',
    'Friday': 'orange',
    'Saturday': 'pink',
    'Sunday': 'grape',
}

export const TIME_OF_DAY_COLOR = (hour: number) => {
    if (hour < 12) {
        return 'yellow'
    } else if (hour >= 12 && hour <= 17) {
        return 'blue'
    } else {
        return 'violet'
    }
}