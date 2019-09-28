import { Path } from '@angular-devkit/core';

export interface Schema {
  metadata?: string;

  type?: string;

  name: string;

  path?: string;

  language?: string;

  skipImport?: boolean;

  module?: Path;

  /**
   * Application root directory
   */
  rootDir?: string;
  /**
   * The name of the root module file
   */
  rootModuleFileName?: string;
  /**
   * The name of the root module class.
   */
  rootModuleClassName?: string;
  /**
   * Skip installing dependency packages.
   */
  skipInstall?: boolean;
}
