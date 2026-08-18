#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import inquirer from "inquirer";
import pc from "picocolors";

// DEFAULT CONFIGURATIONS

export const DEFAULT_LANGUAGE_NAMES = {
  js: pc.yellowBright("JavaScript"),
  ts: pc.blueBright("TypeScript"),
  jsx: pc.cyanBright("JSX"),
  tsx: pc.magentaBright("TSX"),
};

// FILE SYSTEM & SHELL UTILITIES

export function detectPackageManager() {
  const userAgent = process.env.npm_config_user_agent || "";
  if (userAgent.startsWith("pnpm")) return "pnpm";
  if (userAgent.startsWith("yarn")) return "yarn";
  if (userAgent.startsWith("bun")) return "bun";
  return "npm";
}

export function installDependencies(targetDir, pkgManager = detectPackageManager()) {
  console.log(`\n${pc.dim(`Installing dependencies with ${pkgManager}...`)}\n`);
  const installCmd = pkgManager === "yarn" ? "yarn" : `${pkgManager} install`;
  execSync(installCmd, {
    cwd: targetDir,
    stdio: "inherit",
  });
}

export function initGitRepository(targetDir) {
  console.log(`\n${pc.dim("Initializing Git repository...")}`);
  try {
    execSync("git init", { cwd: targetDir, stdio: "ignore" });
    console.log(`${pc.green("✓")} Git repository initialized!`);
  } catch (error) {
    console.log(`${pc.yellow("!")} Could not initialize Git repository.`);
  }
}

export function isDirectoryEmpty(directory) {
  return !fs.existsSync(directory) || fs.readdirSync(directory).length === 0;
}

export function copyDirectory(source, target) {
  if (!fs.existsSync(source)) {
    throw new Error(`Template directory does not exist: ${source}`);
  }

  fs.cpSync(source, target, {
    recursive: true,
    force: true,
  });
}

export function updatePackageJsonName(targetDir, newName) {
  const pkgPath = path.join(targetDir, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      pkg.name = newName;
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
    } catch {
      // Ignore if package.json is missing or malformed
    }
  }
}

export async function handleExistingDirectory(targetDir) {
  if (isDirectoryEmpty(targetDir)) return "create";

  const { action } = await inquirer.prompt([
    {
      type: "select",
      name: "action",
      message: "Target directory is not empty. Choose how to proceed:",
      choices: [
        { name: "Remove existing files and continue", value: "remove" },
        { name: "Ignore files and continue", value: "ignore" },
        { name: "Cancel operation", value: "cancel" },
      ],
    },
  ]);

  if (action === "cancel") throw new Error("Operation cancelled.");

  if (action === "remove") {
    fs.rmSync(targetDir, { recursive: true, force: true });
    fs.mkdirSync(targetDir, { recursive: true });
    return "create";
  }

  return "ignore";
}

export const DEFAULT_UTILS = {
  installDependencies,
  initGitRepository,
  isDirectoryEmpty,
  copyDirectory,
  handleExistingDirectory,
  updatePackageJsonName,
};

// CLI ARGUMENT PARSERS

export function getSupportedLanguagesFromTemplates(templates = {}) {
  return Object.entries(templates).reduce((acc, [type, langsMap]) => {
    acc[type] = Object.keys(langsMap || {});
    return acc;
  }, {});
}

export function getFlag(args, ...names) {
  const index = args.findIndex((arg) => names.includes(arg));
  if (index === -1) return undefined;
  const value = args[index + 1];
  return !value || value.startsWith("-") ? true : value;
}

export function getProjectNameFromArgs(args) {
  const flagNames = ["--type", "-t", "--lang", "--language", "-l"];
  return args.find((arg, index) => {
    if (arg.startsWith("-")) return false;
    return !flagNames.includes(args[index - 1]);
  });
}

export function validateProjectName(value) {
  if (!value || !value.trim()) return "Project name is required.";
  if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
    return "Project name can only contain letters, numbers, hyphens, and underscores.";
  }
  return true;
}

export function resolveTemplate(projectType, language, templatesMap = {}) {
  const typeEntry = templatesMap[projectType];

  if (typeof typeEntry === "string") return typeEntry;

  const template = typeEntry?.[language];
  if (!template) {
    throw new Error(
      `No template resolved for type: "${projectType}"${
        language ? ` + lang: "${language}"` : ""
      }.`
    );
  }
  return template;
}

export function parseArgs(args) {
  return {
    projectName: getProjectNameFromArgs(args),
    projectType: getFlag(args, "--type", "-t"),
    language: getFlag(args, "--lang", "--language", "-l"),
    git: getFlag(args, "--git", "-g"),
  };
}

// PROMPT ENGINE

export async function getProjectConfig(rawArgs = process.argv.slice(2), configOptions = {}) {
  const {
    templates = {},
    projectTypes = [], // Clean fallback: no reference to commented out variable!
    languageNames = DEFAULT_LANGUAGE_NAMES,
    defaultProjectName = "my-app",
  } = configOptions;

  const supportedLanguages = getSupportedLanguagesFromTemplates(templates);
  let { projectName, projectType, language, git } = parseArgs(rawArgs);

  // 1. Project Name Prompt
  if (!projectName) {
    ({ projectName } = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: "Project name:",
        default: defaultProjectName,
        validate: validateProjectName,
      },
    ]));
  } else {
    const error = validateProjectName(projectName);
    if (error !== true) throw new Error(error);
  }

  // 2. Project Type Prompt
  if (!projectType && projectTypes.length > 0) {
    ({ projectType } = await inquirer.prompt([
      {
        type: "select",
        name: "projectType",
        message: "Project type:",
        choices: projectTypes,
      },
    ]));
  }

  // Find the selected type definition object
  const selectedTypeObj = projectTypes.find((t) => t.value === projectType);
  if (projectTypes.length > 0 && !selectedTypeObj) {
    throw new Error(`Invalid project type: ${projectType}`);
  }

  // IF project type has a custom action, skip language selection
  if (selectedTypeObj?.action) {
    return { projectName, projectType, language: null, git: false, install: false };
  }

  // 3. Language Prompt (standard template flow)
  const validLanguages = supportedLanguages[projectType] || [];
  if (validLanguages.length > 0) {
    const languageChoices = validLanguages.map((val) => ({
      name: languageNames[val] || val,
      value: val,
    }));

    if (!language) {
      ({ language } = await inquirer.prompt([
        {
          type: "select",
          name: "language",
          message: "Language:",
          choices: languageChoices,
        },
      ]));
    } else if (!validLanguages.includes(language)) {
      throw new Error(`Language "${language}" is not supported for ${projectType}.`);
    }
  } else {
    language = null;
  }

  // 4. Git Prompt
  if (git === undefined) {
    ({ git } = await inquirer.prompt([
      {
        type: "confirm",
        name: "git",
        message: "Initialize a new Git repository?",
        default: true,
      },
    ]));
  }

  // 5. Install Prompt
  const { install } = await inquirer.prompt([
    {
      type: "confirm",
      name: "install",
      message: "Install dependencies?",
      default: true,
    },
  ]);

  return { projectName, projectType, language, git, install };
}

// GENERATOR CORE LOGIC

export function copyTemplates(templateName, targetDir, templatesDir, options = {}) {
  const { sharedDirName = "shared", copyDirFn = copyDirectory } = options;
  const sharedTemplate = path.join(templatesDir, sharedDirName);
  const targetTemplateDir = path.join(templatesDir, templateName);

  if (fs.existsSync(sharedTemplate)) {
    copyDirFn(sharedTemplate, targetDir);
  }

  if (fs.existsSync(targetTemplateDir)) {
    copyDirFn(targetTemplateDir, targetDir);
  } else {
    throw new Error(`Template directory "${targetTemplateDir}" does not exist.`);
  }
}

export async function createProject(config, options = {}) {
  const {
    templatesDir,
    templatesMap = {},
    projectTypes = [], // Clean fallback
    utils = {},
    hooks = {},
  } = options;

  const activeUtils = { ...DEFAULT_UTILS, ...utils };
  const { projectName, projectType, language, git, install } = config;

  if (hooks.beforeCreate) await hooks.beforeCreate(config);

  const targetDir = path.resolve(process.cwd(), projectName);
  const selectedTypeObj = projectTypes.find((t) => t.value === projectType);

  // Prepare target directory
  const directoryMode = await activeUtils.handleExistingDirectory(targetDir);
  if (directoryMode === "ignore") {
    console.log(`\n${pc.dim("Existing files will be preserved.")}`);
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // --- CUSTOM ACTION BRANCH ---
  if (selectedTypeObj?.action) {
    await selectedTypeObj.action(config, { targetDir, utils: activeUtils });
    if (hooks.afterCreate) await hooks.afterCreate(config, { targetDir });
    return;
  }

  // --- STANDARD TEMPLATE BRANCH ---
  const template = resolveTemplate(projectType, language, templatesMap);

  console.log(`\n${pc.dim("Creating project...")}`);
  console.log(`${pc.dim("Template:")} ${pc.cyan(template)}`);
  console.log(`${pc.dim("Location:")} ${pc.cyan(targetDir)}`);

  copyTemplates(template, targetDir, templatesDir, {
    copyDirFn: activeUtils.copyDirectory,
  });

  activeUtils.updatePackageJsonName(targetDir, projectName);

  console.log(`\n${pc.green("✓")} Project created successfully!`);

  if (git) {
    activeUtils.initGitRepository(targetDir);
  }

  if (install) {
    const pkgManager = detectPackageManager();
    activeUtils.installDependencies(targetDir, pkgManager);
    console.log(`\n${pc.green("✓")} Dependencies installed!`);
  }

  if (hooks.afterCreate) await hooks.afterCreate(config, { targetDir });

  const pkgManager = detectPackageManager();
  const runCmd = pkgManager === "npm" ? "npm run dev" : `${pkgManager} dev`;

  console.log(`\n${pc.dim("Next steps:")}`);
  console.log(`  ${pc.cyan(`cd ${projectName}`)}`);
  if (!install) console.log(`  ${pc.cyan(`${pkgManager} install`)}`);
  console.log(`  ${pc.cyan(runCmd)}\n`);
}

// CLI ENTRYPOINT EXECUTION

export async function createScaffolder(configOverrides = {}) {
  const {
    templates,
    languageNames = DEFAULT_LANGUAGE_NAMES,
    projectTypes = [],
    defaultProjectName = "my-app",
    templatesDir,
    utils = {},
    hooks = {},
  } = configOverrides;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const resolvedTemplatesDir =
    templatesDir || path.join(path.resolve(__dirname, ".."), "templates");
  const resolvedUtils = { ...DEFAULT_UTILS, ...utils };

  const configOptions = {
    templates,
    projectTypes,
    languageNames,
    defaultProjectName,
  };

  try {
    const config = await getProjectConfig(process.argv.slice(2), configOptions);

    await createProject(config, {
      templatesDir: resolvedTemplatesDir,
      templatesMap: templates,
      projectTypes, // FIXED: projectTypes is now passed to createProject!
      utils: resolvedUtils,
      hooks,
    });
  } catch (error) {
    if (error?.name === "ExitPromptError") {
      console.log(`\n${pc.dim("Cancelled.")}`);
      process.exit(0);
    }
    console.error(`\n${pc.red("✖")} ${error.message}\n`);
    process.exit(1);
  }
}