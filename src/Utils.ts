import { Rule } from 'eslint';
import { CallExpression, Expression, SpreadElement } from 'estree';

import { Method } from './enums';
import { Settings } from './types';

export function getSettings(sharedSettings: Record<string, unknown>): Settings {
    if (typeof sharedSettings['axios-swagger'] !== 'object') {
        throw new Error("Plugin settings not specified! Specify 'axios-swagger' in settings!");
    }

    return sharedSettings['axios-swagger'] as Settings;
}

export function getRouteArg(
    node: CallExpression & Rule.NodeParentExtension
): (Expression & Rule.NodeParentExtension) | (SpreadElement & Rule.NodeParentExtension) | null {
    if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression') {
        if (node.callee.object.type === 'Identifier' && node.callee.object.name === 'axios') {
            if (
                node.callee.property.type === 'Identifier' &&
                Object.values(Method).includes(node.callee.property.name as Method) &&
                node.arguments.length > 0
            ) {
                return node.arguments[0] as
                    | (Expression & Rule.NodeParentExtension)
                    | (SpreadElement & Rule.NodeParentExtension);
            }
        }
    }

    return null;
}

export function parseRouteArg(routeArg: Expression | SpreadElement, context: Rule.RuleContext) {
    let raw = '';
    let value = '';
    let quoteChar = '`';

    if (routeArg.type === 'Literal' && typeof routeArg.value === 'string' && typeof routeArg.raw === 'string') {
        quoteChar = routeArg.raw.charAt(0);
        raw = routeArg.value;
        value = raw.split('?')[0];
    } else if (routeArg.type === 'TemplateLiteral') {
        raw = context.getSourceCode().getText(routeArg).replace(/`/g, '');
        value = raw.split('?')[0].replace(/\$\{.*?\}/g, '${}');
    }

    return { raw, value, quoteChar };
}

const regExpSpecials = new RegExp(
    '(\\' + ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'].join('|\\') + ')',
    'g'
);
export function escapeForRegExp(text: string) {
    return text.replace(regExpSpecials, '\\$1');
}
