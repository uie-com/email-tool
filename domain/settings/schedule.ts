
import { Settings } from "../schema/settingsCollection";


// Emails of the same type will override previously resolved emails of that type
export const SESSION_BASE = 'applHtcejl4tEXatp';
export const SESSION_TABLE = 'tbl73qUZ2BTDEeBV9';

export const EMAILS_PER_SESSION: Settings<string> = {
    'Program:TUXS': {
        emails: {
            'New Topic': {
                'Send Date': '{Session Date(-5d)(10:00am)}',
            },
            'Today': {
                'Send Date': '{Session Date(8:00am)}',
            },
            'Recording': {
                'Send Date': '{Session Date(+1d)(12:00pm)}',
            },
            'Onboarding Upcoming Topics': {
                'Send Date': '{Session Date(12:00pm)}',
            },
        },
        'Session Week Type:Odd Week': {
            emails: {
                'Upcoming Topics': {
                    'Send Date': '{Session Date(+6d)(10:00am)}',
                },
            },
        },
    },
    'Program:Stand Out': {
        emails: {
            'Today\'s Session': {
                'Send Date': '{Session Date(8:00am)}',
            },
        },
        'Is First Session Of Week': {
            emails: {
                'Events of Week': {
                    'Send Date': '{Session Date(Monday Before)(10:00am)}',
                }
            }
        }
    },
    'Program:Visions': {
        emails: {
            'Today\'s Session': {
                'Send Date': '{Session Date(8:00am)}',
            }
        },
        'Is First Session Of Program': {
            emails: {
                'Before Week': {
                    'Send Date': '{Session Date(-5d)(2:00pm)}',
                }
            }
        },
        'Is Last Session Of Week': {
            emails: {
                'Before Week': {
                    'Send Date': '{Session Date(+1d)(2:00pm)}',
                }
            }
        },
        'Is Last Session Of Program': {
            emails: {
                'Before Week': {},
                'Certificate': {
                    'Send Date': '{Session Date(+1d)(10:00am)}',
                }
            }
        }
    },
    'Program:Metrics': {
        emails: {
            'Today\'s Session': {
                'Send Date': '{Session Date(8:00am)}',
            }
        },
        'Is First Session Of Program': {
            emails: {
                'Before Week': {
                    'Send Date': '{Session Date(-5d)(2:00pm)}',
                }
            }
        },
        'Is Last Session Of Week': {
            emails: {
                'Before Week': {
                    'Send Date': '{Session Date(+1d)(2:00pm)}',
                }
            }
        },
        'Is Last Session Of Program': {
            emails: {
                'Before Week': {},
                'Certificate': {
                    'Send Date': '{Session Date(+1d)(10:00am)}',
                }
            }
        }
    },
    'Program:Research': {
        emails: {
            'Today\'s Session': {
                'Send Date': '{Session Date(8:00am)}',
            }
        },
        'Is First Session Of Program': {
            emails: {
                'Before Week': {
                    'Send Date': '{Session Date(-5d)(2:00pm)}',
                }
            }
        },
        'Is Last Session Of Week': {
            emails: {
                'Before Week': {
                    'Send Date': '{Session Date(+1d)(2:00pm)}',
                }
            }
        },
        'Is Last Session Of Program': {
            emails: {
                'Before Week': {},
                'Certificate': {
                    'Send Date': '{Session Date(+1d)(10:00am)}',
                }
            }
        }
    },
    'Program:Win': {
        emails: {
            'Homework': {
                'Send Date': '{Session Date (Friday Before)(2:00pm)}',
            }
        },
        'Is Before Break': {
            emails: {
                'Homework': {
                    'Send Date': '{Session Date(Friday After)(2:00pm)}',
                }
            }
        },
        'Is After Break': {
            emails: {
                'Homework': {}, // Deletes the previous email
                'Returning From Break': {
                    'Send Date': '{Session Date (Friday Before)(2:00pm)}',
                }
            }
        },
        'Previous Topic:Pillar 2': {
            'Previous Session Type:Live Lab 2': {
                emails: {
                    'Homework': {},
                    'Transition': {
                        'Send Date': '{Session Date (Friday Before)(2:00pm)}',
                    }
                }
            }
        },
        'Is First Session Of Program': {
            'Topic:Pillar 1': {
                emails: {
                    'First Lab Reminder': {
                        'Send Date': '{Session Date(-1d)(10:00am)}',
                    },
                    'Onboarding': {
                        'Send Date': '{Session Date(-12d)(12:00pm)}',
                    },
                    'Welcome': {
                        'Send Date': '{Session Date(+1d)(10:00am)}',
                        'Next Cohort': '',
                        'Cohort': '{Next Cohort}'
                    }
                }
            },
        },
        'Session Type:Wrap Up': {
            emails: {
                'Homework': {},
                'Wrap Up': {
                    'Send Date': '{Session Date(Friday Before)(2:00pm)}',
                },
                'Certificate': {
                    'Send Date': '{Session Date(+1d)(10:00am)}',
                },
                'Extension Details': {
                    'Send Date': '{Session Date(+2d)(10:00am)}',
                }
            }
        }
    },
}
