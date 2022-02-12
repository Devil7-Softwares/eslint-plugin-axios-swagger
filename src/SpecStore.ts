import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { Spec } from 'swagger-schema-official';

import { Method } from './enums';
import { PathData, Settings } from './types';

let loadedSpecs: Map<string, PathData> | null = null;

function resolveFilePath(path: string): string {
    if (!existsSync(path) && __dirname.includes('node_modules')) {
        const newPath = resolve(__dirname.slice(0, __dirname.indexOf('node_modules')), path);
        if (existsSync(newPath)) {
            return newPath;
        }
    }
    return path;
}

export function getSpecs(settings: Settings): Map<string, PathData> {
    if (!loadedSpecs) {
        loadedSpecs = new Map<string, PathData>();

        const methods = Object.values(Method);

        if (typeof settings === 'object' && Array.isArray(settings.specs) && settings.specs.length > 0) {
            for (const specPath of settings.specs) {
                try {
                    const specString = readFileSync(resolveFilePath(specPath)).toString('utf-8');
                    const spec: Spec = JSON.parse(specString) as Spec;

                    for (const path in spec.paths) {
                        const data: PathData = {};

                        for (const methodStr in spec.paths[path]) {
                            const method = methodStr as Method;
                            if (methods.includes(method)) {
                                data[method] = true;
                            }
                        }

                        loadedSpecs.set(path.replace(/\{.*?\}/g, '${}'), data);
                    }
                } catch (error) {
                    console.error('Failed to parse spec file!', { error });
                }
            }
        }
    }

    return loadedSpecs;
}
