import { Rule } from 'eslint';
import Fuze from 'fuse.js';

import { getSpecs } from '../SpecStore';
import { escapeForRegExp, getRouteArg, getSettings } from '../Utils';

export function NoUnknownRoute(context: Rule.RuleContext): Rule.RuleListener {
    const settings = getSettings(context.settings);
    const specs = getSpecs(settings);

    const fuze = new Fuze(Array.from(specs.keys()), { includeScore: true });

    return {
        CallExpression(node) {
            const routeArg = getRouteArg(node);

            if (routeArg) {
                let routeOriginalValue = '';
                let route = '';
                let quoteChar = '`';

                if (
                    routeArg.type === 'Literal' &&
                    typeof routeArg.value === 'string' &&
                    typeof routeArg.raw === 'string'
                ) {
                    quoteChar = routeArg.raw.charAt(0);
                    routeOriginalValue = routeArg.value;
                    route = routeOriginalValue.split('?')[0];
                } else if (routeArg.type === 'TemplateLiteral') {
                    routeOriginalValue = context.getSourceCode().getText(routeArg).replace(/`/g, '');
                    route = routeOriginalValue.split('?')[0].replace(/\$\{.*?\}/g, '${}');
                }

                if (!routeOriginalValue || !route) {
                    return;
                }

                const routeWithBase = `${settings.basePath}${route}`;

                if (!specs.has(route) && !specs.has(routeWithBase)) {
                    const matchWithBase = fuze.search(routeWithBase)[0];
                    const matchWithoutBase = fuze.search(route)[0];

                    const report: Rule.ReportDescriptor = {
                        node,
                        loc: routeArg.loc || node.loc || { line: 0, column: 0 },
                        message: `Specified route '${route}'${
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

                        if (/\$\{.*?\}/g.test(match.item)) quoteChar = '`';

                        const templateMatches = routeOriginalValue.matchAll(/\$\{(.*?)\}/g);
                        const newPath = `${quoteChar}${(match.item.includes('${}')
                            ? match.item.replace(/\$\{\}/g, function (str) {
                                  const templateMatch = templateMatches.next();
                                  if (templateMatch.value) {
                                      return templateMatch.value[0];
                                  }

                                  return str;
                              })
                            : match.item
                        ).replace(new RegExp(`^${escapeForRegExp(settings.basePath || '')}`, 'g'), '')}${
                            routeOriginalValue.includes('?') ? `?${routeOriginalValue.split('?')[1]}` || '' : ''
                        }${quoteChar}`;

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
