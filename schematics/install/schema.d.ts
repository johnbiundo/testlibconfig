import { Path } from '@angular-devkit/core';
export interface Schema {
    metadata?: string;
    type?: string;
    name: string;
    path?: string;
    language?: string;
    skipImport?: boolean;
    module?: Path;
    rootDir?: string;
    rootModuleFileName?: string;
    rootModuleClassName?: string;
    skipInstall?: boolean;
}
