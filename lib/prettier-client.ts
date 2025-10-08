import type { Options, Plugin } from "prettier";

type PrettierModule = typeof import("prettier/standalone");

type PrettierUserOptions = Omit<Options, "parser" | "plugins">;

type PluginKey = "html" | "babel" | "estree" | "postcss";

type PluginModule = Record<string, unknown> & { default?: unknown };

const pluginLoaders: Record<PluginKey, () => Promise<PluginModule>> = {
  html: () => import("prettier/plugins/html"),
  babel: () => import("prettier/plugins/babel"),
  estree: () => import("prettier/plugins/estree"),
  postcss: () => import("prettier/plugins/postcss"),
};

let prettierPromise: Promise<PrettierModule> | null = null;
const pluginCache = new Map<PluginKey, Promise<Plugin>>();

async function loadPrettier() {
  if (!prettierPromise) {
    prettierPromise = import("prettier/standalone");
  }
  return prettierPromise;
}

async function loadPlugin(key: PluginKey): Promise<Plugin> {
  const existing = pluginCache.get(key);
  if (existing) return existing;
  const loader = pluginLoaders[key];
  const pluginPromise = loader().then((mod) => {
    const plugin = "default" in mod && mod.default ? mod.default : mod;
    return plugin as Plugin;
  });
  pluginCache.set(key, pluginPromise);
  return pluginPromise;
}

async function resolvePlugins(keys: PluginKey[]): Promise<Plugin[]> {
  const plugins = await Promise.all(keys.map((key) => loadPlugin(key)));
  return plugins;
}

export async function formatHtml(source: string, options: PrettierUserOptions = {}) {
  const prettier = await loadPrettier();
  const plugins = await resolvePlugins(["html", "babel", "estree"]);
  return prettier.format(source, {
    parser: "html",
    plugins,
    ...options,
  });
}

export async function formatCss(source: string, options: PrettierUserOptions = {}) {
  const prettier = await loadPrettier();
  const plugins = await resolvePlugins(["postcss"]);
  return prettier.format(source, {
    parser: "css",
    plugins,
    ...options,
  });
}

export async function formatJavaScript(source: string, options: PrettierUserOptions = {}) {
  const prettier = await loadPrettier();
  const plugins = await resolvePlugins(["babel", "estree"]);
  return prettier.format(source, {
    parser: "babel",
    plugins,
    ...options,
  });
}
