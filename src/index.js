#!/usr/bin/env node

import pc from "picocolors";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { getProjectConfig } from "./prompts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..");
const TEMPLATES_DIR = path.join(ROOT, "templates");
const SHARED_TEMPLATE = path.join(TEMPLATES_DIR, "shared");

const templates = {
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

function resolveTemplate(projectType, language) {
  const template = templates[projectType]?.[language];

  if (!template) {
    throw new Error(
      `No template found for ${projectType} + ${language}.`
    );
  }

  return template;
}

function copyDirectory(source, target) {
  if (!fs.existsSync(source)) {
    throw new Error(
      `Template directory does not exist: ${source}`
    );
  }

  fs.cpSync(source, target, {
    recursive: true,
    force: true,
  });
}

function copyTemplates(template, targetDir) {
  // Copy shared files first
  copyDirectory(
    SHARED_TEMPLATE,
    targetDir
  );

  // Copy selected template on top of shared files
  const templateDir = path.join(
    TEMPLATES_DIR,
    template
  );

  copyDirectory(
    templateDir,
    targetDir
  );
}

function installDependencies(targetDir) {
  console.log(
    `\n${pc.dim("Installing dependencies...")}\n`
  );

  execSync("npm install", {
    cwd: targetDir,
    stdio: "inherit",
  });
}

function createProject(config) {
  const {
    projectName,
    projectType,
    language,
    install,
  } = config;

  const targetDir = path.resolve(
    process.cwd(),
    projectName
  );

  if (fs.existsSync(targetDir)) {
    throw new Error(
      `Directory "${projectName}" already exists.`
    );
  }

  const template = resolveTemplate(
    projectType,
    language
  );

  console.log(
    `\n${pc.dim("Creating project...")}`
  );

  console.log(
    `${pc.dim("Template:")} ${pc.cyan(template)}`
  );

  console.log(
    `${pc.dim("Location:")} ${pc.cyan(targetDir)}`
  );

  fs.mkdirSync(targetDir, {
    recursive: true,
  });

  copyTemplates(template, targetDir);

  console.log(
    `\n${pc.green("✓")} Project created successfully!`
  );

  if (install) {
    installDependencies(targetDir);

    console.log(
      `\n${pc.green("✓")} Dependencies installed!`
    );
  }

  console.log(
    `\n${pc.dim("Next steps:")}`
  );

  console.log(
    `  ${pc.cyan(`cd ${projectName}`)}`
  );

  if (!install) {
    console.log(
      `  ${pc.cyan("npm install")}`
    );
  }

  console.log(
    `  ${pc.cyan("npm run dev")}\n`
  );
}

try {
  const config = await getProjectConfig();

  if (config.projectType === "extra") {
    console.log(
      `\n${pc.yellow("Extra")} projects are not implemented yet.\n`
    );

    process.exit(0);
  }

  createProject(config);
} catch (error) {
  if (error?.name === "ExitPromptError") {
    console.log(`\n${pc.dim("Cancelled.")}`);
    process.exit(0);
  }

  console.error(
    `\n${pc.red("✖")} ${error.message}\n`
  );

  process.exit(1);
}