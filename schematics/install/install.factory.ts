import { join, Path, strings } from '@angular-devkit/core';
import {
  apply,
  branchAndMerge,
  chain,
  mergeWith,
  Rule,
  SchematicContext,
  SchematicsException,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

import {
  addPackageJsonDependency,
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';

import {
  DeclarationOptions,
  ModuleDeclarator,
} from '@nestjsplus/schematics-utils';

import { ModuleFinder } from '@nestjsplus/schematics-utils';
import { Location, NameParser } from '@nestjsplus/schematics-utils';
import { mergeSourceRoot } from '@nestjsplus/schematics-utils';

import { Schema as ConfigManagerOptions } from './schema';

export function main(options: ConfigManagerOptions): Rule {
  options = transform(options);
  return (tree: Tree, context: SchematicContext) => {
    console.log('options :', options.skipInstall);
    if (!options.skipInstall) {
      console.log('should run package install...');
      context.addTask(new NodePackageInstallTask());
    }
    // const rootSource = apply(url('./files/root'), [
    //   template({
    //     ...strings,
    //     ...(options as object),
    //     rootDir: options.rootDir,
    //     getRootDirectory: () => options.rootDir,
    //     stripTsExtension: (s: string) => s.replace(/\.ts$/, ''),
    //     getRootModuleName: () => options.rootModuleClassName,
    //     getRootModulePath: () => options.rootModuleFileName,
    //   }),
    // ]);

    // return chain([mergeWith(rootSource), addDependenciesAndScripts()]);
    return branchAndMerge(
      chain([
        mergeSourceRoot(options),
        addDeclarationToModule(options),
        addDependenciesAndScripts(),
      ]),
    )(tree, context);
  };
}

function transform(options: ConfigManagerOptions): ConfigManagerOptions {
  const target: ConfigManagerOptions = Object.assign({}, options);

  target.metadata = 'imports';
  target.type = 'module';

  const defaultName = 'configModule';
  target.name = strings.dasherize(defaultName);

  const location: Location = new NameParser().parse(target);

  target.path = join(strings.dasherize(location.path) as Path, target.name);
  target.language = 'ts';

  return target;
}

function addDependenciesAndScripts(): Rule {
  console.log('V6');
  console.log('running addDependenciesAndScripts...');
  return (host: Tree) => {
    /*
    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: '@nestjsplus/config',
      version: '^1.1.0',
    });
    */
    const pkgPath = '/package.json';
    const buffer = host.read(pkgPath);
    if (buffer === null) {
      throw new SchematicsException('Could not find package.json');
    }

    const pkg = JSON.parse(buffer.toString());
    pkg.scripts['start:configtrace'] = 'DEBUG=trace nest start';

    host.overwrite(pkgPath, JSON.stringify(pkg, null, 2));
    return host;
  };
}

function addDeclarationToModule(options: ConfigManagerOptions): Rule {
  return (tree: Tree) => {
    if (options.skipImport !== undefined && options.skipImport) {
      return tree;
    }
    options.module = new ModuleFinder(tree).find({
      name: options.name,
      path: options.path as Path,
    });
    if (!options.module) {
      return tree;
    }
    const content = tree.read(options.module).toString();
    const declarator: ModuleDeclarator = new ModuleDeclarator();
    // for now, we'll pass in staticOptions using the `register()` method
    // with no default options
    const staticOptions = { name: 'register', value: {} };
    const declarationOptions = Object.assign({ staticOptions }, options);
    tree.overwrite(
      options.module,
      declarator.declare(content, declarationOptions as DeclarationOptions),
    );
    return tree;
  };
}
