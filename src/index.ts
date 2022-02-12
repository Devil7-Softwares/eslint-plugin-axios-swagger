import { NoUnknownRoute, NoUnsupportedMethod } from './rules';

export = {
    rules: {
        'no-unknown-route': {
            meta: {
                hasSuggestions: true,
            },
            create: NoUnknownRoute,
        },
        'no-unsupported-method': {
            meta: {
                fixable: 'code',
                hasSuggestions: true,
            },
            create: NoUnsupportedMethod,
        },
    },
};
