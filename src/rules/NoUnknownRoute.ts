import { Rule } from 'eslint';
import Fuze from 'fuse.js';

import { getSpecs } from '../SpecStore';
import { escapeForRegExp, getRouteArg, getSettings, parseRouteArg } from '../Utils';

export function NoUnknownRoute(context: Rule.RuleContext): Rule.RuleListener {
    const settings = getSettings(context.settings);
    const specs = getSpecs(settings);

    const fuze = new Fuze(Array.from(specs.keys()), { includeScore: true });

    return {
        CallExpression(node) {
            const routeArg = getRouteArg(node);

            if (routeArg) {
                const parsedRoute = parseRouteArg(routeArg, context);

                if (!parsedRoute.value || !parsedRoute.raw) {
                    return;
                }

                const routeWithBase = `${settings.basePath}${parsedRoute.value}`;

                if (!specs.has(parsedRoute.value) && !specs.has(routeWithBase)) {
                    const matchWithBase = fuze.search(routeWithBase)[0];
                    const matchWithoutBase = fuze.search(parsedRoute.value)[0];

                    const report: Rule.ReportDescriptor = {
                        node,
                        loc: routeArg.loc || node.loc || { line: 0, column: 0 },
                        message: `Specified route '${parsedRoute.value}'${
                            settings.basePath ? ` or '${routeWithBase}'` : ''
                        } not found!`,
                    };

                    if (matchWithBase || matchWithoutBase) {
                        const match =
                            matchWithBase && matchWithoutBase
                                ? (matchWithBase.score || 1) < (matchWithoutBase.score || 1)
                                    ? matchWithBase
                                    : matchWithoutBase
                                : matchWithoutBase || matchWithBase;

                        if (/\$\{.*?\}/g.test(match.item)) parsedRoute.quoteChar = '`';

                        const templateMatches = parsedRoute.raw.matchAll(/\$\{(.*?)\}/g);
                        const newPath = `${parsedRoute.quoteChar}${(match.item.includes('${}')
                            ? match.item.replace(/\$\{\}/g, function (str) {
                                  const templateMatch = templateMatches.next();
                                  if (templateMatch.value) {
                                      return templateMatch.value[0];
                                  }

                                  return str;
                              })
                            : match.item
                        ).replace(new RegExp(`^${escapeForRegExp(settings.basePath || '')}`, 'g'), '')}${
                            parsedRoute.raw.includes('?') ? `?${parsedRoute.raw.split('?')[1]}` || '' : ''
                        }${parsedRoute.quoteChar}`;

                        report.suggest = [
                            {
                                desc: `Replace with ${newPath}`,
                                fix: (fixer) => {
                                    return fixer.replaceText(routeArg, newPath);
                                },
                            },
                        ];
                    }

                    context.report(report);
                }
            }
        },
    };
}
