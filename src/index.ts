import { NoUnknownRoute } from './rules';

export = {
    rules: {
        'no-unknown-route': {
            meta: {
                hasSuggestions: true,
            },
            create: NoUnknownRoute,
        },
    },
};
