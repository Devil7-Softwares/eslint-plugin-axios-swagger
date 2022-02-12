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

export function getRouteArg(node: CallExpression & Rule.NodeParentExtension): Expression | SpreadElement | null {
    if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression') {
        if (node.callee.object.type === 'Identifier' && node.callee.object.name === 'axios') {
            if (
                node.callee.property.type === 'Identifier' &&
                Object.values(Method).includes(node.callee.property.name as Method) &&
                node.arguments.length > 0
            ) {
                return node.arguments[0];
            }
        }
    }

    return null;
}

const regExpSpecials = new RegExp(
    '(\\' + ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'].join('|\\') + ')',
    'g'
);
export function escapeForRegExp(text: string) {
    return text.replace(regExpSpecials, '\\$1');
}
