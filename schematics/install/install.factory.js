"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const tasks_1 = require("@angular-devkit/schematics/tasks");
const schematics_utils_1 = require("@nestjsplus/schematics-utils");
const schematics_utils_2 = require("@nestjsplus/schematics-utils");
const schematics_utils_3 = require("@nestjsplus/schematics-utils");
const schematics_utils_4 = require("@nestjsplus/schematics-utils");
function main(options) {
    options = transform(options);
    return (tree, context) => {
        console.log('options :', options.skipInstall);
        if (!options.skipInstall) {
            console.log('should run package install...');
            context.addTask(new tasks_1.NodePackageInstallTask());
        }
        return schematics_1.branchAndMerge(schematics_1.chain([
            schematics_utils_4.mergeSourceRoot(options),
            addDeclarationToModule(options),
            addDependenciesAndScripts(),
        ]))(tree, context);
    };
}
exports.main = main;
function transform(options) {
    const target = Object.assign({}, options);
    target.metadata = 'imports';
    target.type = 'module';
    const defaultName = 'configModule';
    target.name = core_1.strings.dasherize(defaultName);
    const location = new schematics_utils_3.NameParser().parse(target);
    target.path = core_1.join(core_1.strings.dasherize(location.path), target.name);
    target.language = 'ts';
    return target;
}
function addDependenciesAndScripts() {
    console.log('V6');
    console.log('running addDependenciesAndScripts...');
    return (host) => {
        const pkgPath = '/package.json';
        const buffer = host.read(pkgPath);
        if (buffer === null) {
            throw new schematics_1.SchematicsException('Could not find package.json');
        }
        const pkg = JSON.parse(buffer.toString());
        pkg.scripts['start:configtrace'] = 'DEBUG=trace nest start';
        host.overwrite(pkgPath, JSON.stringify(pkg, null, 2));
        return host;
    };
}
function addDeclarationToModule(options) {
    return (tree) => {
        if (options.skipImport !== undefined && options.skipImport) {
            return tree;
        }
        options.module = new schematics_utils_2.ModuleFinder(tree).find({
            name: options.name,
            path: options.path,
        });
        if (!options.module) {
            return tree;
        }
        const content = tree.read(options.module).toString();
        const declarator = new schematics_utils_1.ModuleDeclarator();
        const staticOptions = { name: 'register', value: {} };
        const declarationOptions = Object.assign({ staticOptions }, options);
        tree.overwrite(options.module, declarator.declare(content, declarationOptions));
        return tree;
    };
}
