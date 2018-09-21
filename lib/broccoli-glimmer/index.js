const funnel = require('broccoli-funnel');
const merge = require('broccoli-merge-trees');
const GlimmerBundleCompiler = require('@glimmer/app-compiler').GlimmerBundleCompiler;
const UnwatchedDir = require("broccoli-source").UnwatchedDir;
const ResolverConfigurationBuilder = require('@glimmer/resolver-configuration-builder');

/**
 * Build a glimmer compile tree using the module unification options
 *
 * @param {Node} appNode The app source root node, typically /src
 * @param {Node} configNode The config node containing config.js, typically /config
 * @param {String} modulePrefix The module prefix for the application
 * @param {String} configPath Optional config path for ResolverConfigurationBuilder (need more info on this)
 * @returns {BroccoliMergeTrees}
 */
module.exports = function(appNode, configNode, modulePrefix, configPath) {
  
  // Extract config.js
  configNode = funnel(configNode, {
    files: ['config.js'],
  });
  
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
        dataSegment: 'data-segment.js', // what is this?
      }
    }
  );
  
  // I don't know what this does...
  const defaultModuleConfiguration = require('./defaultModuleConfig');
  
  // ResolverConfiguration used by glimmer DI, written to /config during build
  const resolverConfiguration = new ResolverConfigurationBuilder(configNode, {
    configPath: configPath || '@@', // What does this do?
    defaultModulePrefix: modulePrefix,
    defaultModuleConfiguration: defaultModuleConfiguration
  });

  return merge([compiledTree, resolverConfiguration], { overwrite: true, annotation: 'glimmer-tree' });
}