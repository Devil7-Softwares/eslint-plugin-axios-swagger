import { Rule } from 'eslint';

import { Method } from '../enums';
import { getSpecs } from '../SpecStore';
import { getRouteArg, getSettings, parseRouteArg } from '../Utils';

export function NoUnsupportedMethod(context: Rule.RuleContext): Rule.RuleListener {
    const settings = getSettings(context.settings);
    const specs = getSpecs(settings);

    return {
        CallExpression(node) {
            const routeArg = getRouteArg(node);

            if (routeArg && routeArg.parent && routeArg.parent.type === 'CallExpression') {
                const callee = routeArg.parent.callee;
                if (callee && callee.type === 'MemberExpression' && callee.property.type === 'Identifier') {
                    const usedMethod = callee.property.name as Method;

                    const parsedRoute = parseRouteArg(routeArg, context);

                    if (!parsedRoute.value || !parsedRoute.raw) {
                        return;
                    }

                    const pathData =
                        specs.get(parsedRoute.value) || specs.get(`${settings.basePath}${parsedRoute.value}`);
                    if (pathData && !pathData[usedMethod]) {
                        const expectedMethods = Object.keys(pathData).filter((method) => !!pathData[method as Method]);

                        const report: Rule.ReportDescriptor = {
                            node,
                            loc: callee.property.loc || node.loc || { line: 0, column: 0 },
                            message: `Method '${usedMethod}' is not supported given route. Expected ${expectedMethods
                                .map((method) => `'${method}'`)
                                .join(' or ')} method${expectedMethods.length > 1 ? 's' : ''}`,
                        };

                        if (expectedMethods.length === 1) {
                            report.fix = (fixer) => {
                                return fixer.replaceText(callee.property, expectedMethods[0]);
                            };
                        } else if (expectedMethods.length > 1) {
                            report.suggest = expectedMethods.map((expectedMethod) => ({
                                desc: `Use '${expectedMethod}' method.`,
                                fix: (fixer) => {
                                    return fixer.replaceText(callee.property, expectedMethod);
                                },
                            }));
                            console.log({ suggestions: report.suggest });
                        }

                        context.report(report);
                    }
                }
            }
        },
    };
}
