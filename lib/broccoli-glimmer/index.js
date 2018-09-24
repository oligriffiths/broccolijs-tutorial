"use strict";

const Merge = require('broccoli-merge-trees');
const funnel = require('broccoli-funnel');
const GlimmerBundleCompiler = require('@glimmer/app-compiler').GlimmerBundleCompiler;
const UnwatchedDir = require("broccoli-source").UnwatchedDir;
const ResolverConfigurationBuilder = require('@glimmer/resolver-configuration-builder');

/**
 * Build a glimmer compile tree using the module unification options
 */
class BroccoliGlimmer extends Merge
{
  /**
   * @param {Node} appNode The app source root node, typically /src
   * @param {Object} options Options object:
   * {
   *  moduleConfiguration: {} // Optional module configuration to ResolverConfiguration to inform Glimmer DI how to locate things
   *  modulePrefix: '' // The module name used to prefix all JS modules created during compilation
   *  templateFile: 'templates.gbx' // The compiled templates file name
   *  dataSegmentFile: 'data-segment.js' // The compiled static variables registry used by Glimmer VM when rendering templates
   * }
   * @returns {BroccoliMergeTrees}
   */
  constructor(appNode, options)
  {
    options = options || {}

    // moduleConfiguration contains the config for how the ResolverConfiguration operates. This config tells glimmer
    // DI how to locate various things within templates, from components, to helpers, to utils, and what is allowed to be
    // contained within subfolders (e.g. a util can exist within a component)
    options.moduleConfiguration = options.moduleConfiguration || require('./defaultModuleConfig');

    // Module prefix is required to scope the namespace of glimmer elements, defaults to the package.json name
    options.modulePrefix = options.modulePrefix || require(process.cwd() + '/package.json').name;

    // Assign default compiled template file
    options.templateFile = options.templateFile || 'templates.gbx';

    // The data segment contains a table of static variables and constants that are referenced within the templates
    // It is generated at compile time and allows templates to refer to static strings/variables by an integer
    // reference rather than storing their actual value, reducing the file size of the compiled templates
    // @see https://en.wikipedia.org/wiki/Data_segment
    options.dataSegmentFile = options.dataSegmentFile || 'data-segment.js';

    // Extract templates
    const hbsTree = funnel(appNode, {
      include: ['ui/**/*.hbs', '**/*.js'],
      destDir: 'src',
    });

    // Template compiler needs access to root package.json
    let pkgJsonTree = new UnwatchedDir('./');
    pkgJsonTree = funnel(pkgJsonTree, {
      include: ['package.json']
    });

    // Get templates and package.json
    let templateTree = Merge([hbsTree, pkgJsonTree]);

    // The bundle compiler generates the compiled templates.gbx binary template and data-segment for the runtime
    let compiledTree = new GlimmerBundleCompiler(
      templateTree,
      {
        mode: 'module-unification',
        outputFiles: {
          heapFile: options.templateFile,
          dataSegment: options.dataSegmentFile,
        }
      }
    );

    // ResolverConfiguration used by glimmer DI, written to /config during build
    let resolverConfiguration = new ResolverConfigurationBuilder(compiledTree, {
      configPath: '@@', // For fs.existsSync to fail, seems like a bug
      defaultModulePrefix: options.modulePrefix,
      defaultModuleConfiguration: options.moduleConfiguration
    });

    /**
     * The output of this merge will be:
     [
     "config/",
     "config/resolver-configuration.d.ts",
     "config/resolver-configuration.js",
     "data-segment.js",
     "package.json",
     "templates.gbx"
     ]
     */
    super([compiledTree, resolverConfiguration], { overwrite: true, annotation: 'glimmer-tree' });
  }
}

/**
 * Build a glimmer compile tree using the module unification options
 *
 * @param {Node} appNode The app source root node, typically /src
 * @param {Object} options Options object:
 * {
 *  moduleConfiguration: {} // Optional module configuration to ResolverConfiguration to inform Glimmer DI how to locate things
 *  modulePrefix: '' // The module name used to prefix all JS modules created during compilation
 *  templateFile: 'templates.gbx' // The compiled templates file name
 *  dataSegmentFile: 'data-segment.js' // The compiled static variables registry used by Glimmer VM when rendering templates
 * }
 * @returns {BroccoliMergeTrees}
 */
function broccoliGlimmer(appNode, options) {
  return new BroccoliGlimmer(...arguments);
}

module.exports = broccoliGlimmer;
module.exports.BroccoliGlimmer = BroccoliGlimmer;