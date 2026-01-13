const path = require('path')
const { getDefaultConfig } = require('@expo/metro-config')

// Force all imports of @tamagui/portal to resolve to a single copy.
// This avoids multiple portal contexts (one per nested dependency) that cause
// "PortalDispatchContext cannot be null" runtime errors with Sheet/Portal.
const projectRoot = __dirname
const config = getDefaultConfig(projectRoot)

config.resolver = {
  ...(config.resolver || {}),
  extraNodeModules: {
    ...(config.resolver?.extraNodeModules || {}),
    '@tamagui/portal': path.resolve(
      projectRoot,
      'node_modules',
      'tamagui',
      'node_modules',
      '@tamagui',
      'portal'
    ),
  },
}

module.exports = config
