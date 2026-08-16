import pc from "picocolors";

export const TEMPLATES = {
  spa: {
    js: "spa-js",
    ts: "spa-ts",
    jsx: "spa-jsx",
    tsx: "spa-tsx",
  },

  fbr: {
    js: "fbr-js",
    ts: "fbr-ts",
    jsx: "fbr-jsx",
  },

  ssr: {
    js: "ssr-js",
    ts: "ssr-ts",
  },
};

export const SUPPORTED_LANGUAGES = {
  spa: ["js", "ts", "jsx", "tsx"],
  fbr: ["js", "ts", "jsx"],
  ssr: ["js", "ts"],
};

export const LANGUES_NAMES = {
  js: pc.yellowBright("JavaScript"),
  ts: pc.blueBright("TypeScript"),
  jsx: pc.cyanBright("JSX"),
  tsx: pc.magentaBright("TSX"),
};

export const PROJECT_TYPES = [
  {
    name: "Single Page App",
    value: "spa",
  },
  {
    name: "Single Page App — File-based Router",
    value: "fbr",
  },
  {
    name: "Server-Side Rendering",
    value: "ssr",
  },
  {
    name: "Extra",
    value: "extra",
  },
];