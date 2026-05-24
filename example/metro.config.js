const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// Directly alias expo-mathjax to the workspace root so Metro reads
// package.json#main without following a symlink into node_modules.
// Also shim Node's `buffer` module — react-native-svg imports it even in
// the compiled CommonJS output, but it is unavailable in the RN runtime.
config.resolver.extraNodeModules = {
    "expo-mathjax": workspaceRoot,
    buffer: require.resolve("buffer"),
};

// react-native-svg's package.json has "react-native": "src/index.ts".
// Metro prefers that field for RN bundles, but src/index.ts imports Node's
// `buffer` module which doesn't exist in the React Native runtime.
// Force Metro to always use the compiled CommonJS output instead.
const RN_SVG_CJS = path.resolve(
    projectRoot,
    "node_modules/react-native-svg/lib/commonjs/index.js"
);
config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName === "react-native-svg") {
        return { filePath: RN_SVG_CJS, type: "sourceFile" };
    }
    return context.resolveRequest(context, moduleName, platform);
};

// Watch workspace root so file changes in build/ trigger hot-reload.
config.watchFolders = [workspaceRoot];

// Block only the packages from root node_modules that conflict with
// example's versions (react-native 0.85.x vs 0.83.x, etc.).
// mathjax-full lives ONLY in root node_modules, so it must stay accessible.
const escapedRoot = workspaceRoot.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const BLOCKED_ROOT_PKGS = [
    "react",
    "react-native",
    "react-native-svg",
    "react-refresh",
    "react-devtools-core",
    "react-is",
    "react-is-18",
    "react-is-19",
];
const blockedPattern = BLOCKED_ROOT_PKGS.map(
    (pkg) => `${escapedRoot}/node_modules/${pkg}/`
).join("|");
config.resolver.blockList = new RegExp(`^(${blockedPattern}).*`);

// Resolve peer deps from example's node_modules first; fall back to root
// node_modules for packages only found there (e.g. mathjax-full).
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, "node_modules"),
    path.resolve(workspaceRoot, "node_modules"),
];

module.exports = config;
