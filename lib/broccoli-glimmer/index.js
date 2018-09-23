const funnel = require('broccoli-funnel');
const merge = require('broccoli-merge-trees');
const GlimmerBundleCompiler = require('@glimmer/app-compiler').GlimmerBundleCompiler;
const UnwatchedDir = require("broccoli-source").UnwatchedDir;
const ResolverConfigurationBuilder = require('@glimmer/resolver-configuration-builder');
const log = require('broccoli-stew').log;
const mv = require('broccoli-stew').mv;

/**
 * Build a glimmer compile tree using the module unification options
 *
 * @param {Node} appNode The app source root node, typically /src
 * @param {Node} configNode The config node containing config.js, typically /config
 * @param {Object} options Options object
 * @returns {BroccoliMergeTrees}
 */
module.exports = function(appNode, configNode, options) {

  options = options || {}
  
  // Extract templates
  const hbsTree = funnel(appNode, {
    include: ['**/*.hbs'],
    destDir: appNode
  });

  // Template compiler needs access to root package.json
  let pkgJsonTree = new UnwatchedDir('./');
  pkgJsonTree = funnel(pkgJsonTree, {
    include: ['package.json']
  });
  
  // Get templates and package.json
  let templateTree = merge([hbsTree, pkgJsonTree]);
  
  // The bundle compiler generates the compiled templates.gbx binary template and data-segment for the runtime
  let compiledTree = new GlimmerBundleCompiler(
    templateTree,
    {
      mode: 'module-unification',
      outputFiles: {
        heapFile: 'templates.gbx',
        dataSegment: 'data-segment.js',
        // The data segment contains a table of static variables and constants that are referenced within the templates
        // It is generated at compile time and allows templates to refer to static strings/variables by an integer
        // reference rather than storing their actual value, reducing the file size of the compiled templates
        // @see https://en.wikipedia.org/wiki/Data_segment
      }
    }
  );
  
  // Move data-segment into config
  compiledTree = mv(compiledTree, 'data-segment.js', 'config/data-segment.js');

  // moduleConfiguration contains the config for how the ResolverConfiguration operates. This config tells glimmer
  // DI how to locate various things within templates, from components, to helpers, to utils, and what is allowed to be
  // contained within subfolders (e.g. a util can exist within a component)
  let moduleConfiguration = options.moduleConfiguration || require('./defaultModuleConfig');
  
  // Module prefix is required to scope the namespace of glimmer elements, defaults to the package.json name
  let modulePrefix = options.modulePrefix || require(process.cwd() + '/package.json').name;
  
  // ResolverConfiguration used by glimmer DI, written to /config during build
  let resolverConfiguration = new ResolverConfigurationBuilder(compiledTree, {
    configPath: '@@', // For fs.existsSync to fail, seems like a bug
    defaultModulePrefix: modulePrefix,
    defaultModuleConfiguration: moduleConfiguration
  });

  /**
   * The output of this merge will be:
   [
     "config/",
     "config/data-segment.js",
     "config/resolver-configuration.d.ts",
     "config/resolver-configuration.js",
     "package.json",
     "templates.gbx"
   ]
   */
  return merge([compiledTree, resolverConfiguration], { overwrite: true, annotation: 'glimmer-tree' });
}