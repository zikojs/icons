#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import inquirer from "inquirer";
import pc from "picocolors";

export function getSupportedLanguagesFromTemplates(templates) {
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

export function resolveTemplate(projectType, language, templatesMap) {
  const template = templatesMap[projectType]?.[language];
  if (!template) {
    throw new Error(`No template found for ${projectType} + ${language}.`);
  }
  return template;
}

export function parseArgs(args) {
  return {
    projectName: getProjectNameFromArgs(args),
    projectType: getFlag(args, "--type", "-t"),
    language: getFlag(args, "--lang", "--language", "-l"),
  };
}

// =============================================================================
// INTERACTIVE PROMPT ENGINE
// =============================================================================

export async function getProjectConfig(rawArgs = process.argv.slice(2), configOptions = {}) {
  const {
    templates,
    projectTypes,
    languageNames,
    defaultProjectName = "my-ziko-app",
  } = configOptions;

  const supportedLanguages = getSupportedLanguagesFromTemplates(templates);
  let { projectName, projectType, language } = parseArgs(rawArgs);

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

  if (!projectType) {
    ({ projectType } = await inquirer.prompt([
      {
        type: "select",
        name: "projectType",
        message: "Project type:",
        choices: projectTypes,
      },
    ]));
  } else {
    const valid = projectTypes.some((type) => type.value === projectType);
    if (!valid) throw new Error(`Invalid project type: ${projectType}`);
  }

  if (projectType === "extra") {
    return { projectName, projectType, language: null, install: false };
  }

  const validLanguages = supportedLanguages[projectType] || [];
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
  } else {
    if (!validLanguages.includes(language)) {
      throw new Error(`Language "${language}" is not supported for ${projectType}.`);
    }
  }

  const { install } = await inquirer.prompt([
    {
      type: "confirm",
      name: "install",
      message: "Install dependencies?",
      default: true,
    },
  ]);

  return { projectName, projectType, language, install };
}

// =============================================================================
// FILE SYSTEM UTILITIES & GENERATOR LOGIC
// =============================================================================

export function copyTemplates(templateName, targetDir, templatesDir, options = {}) {
  const { sharedDirName = "shared", copyDirFn } = options;
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
    templatesMap,
    utils = {},
  } = options;

  const {
    installDependencies = () => {},
    copyDirectory = () => {},
    handleExistingDirectory = async () => "override",
  } = utils;

  const { projectName, projectType, language, install } = config;

  if (projectType === "extra") {
    console.log(`\n${pc.yellow("Extra projects are not implemented yet.")}\n`);
    return;
  }

  const targetDir = path.resolve(process.cwd(), projectName);
  const template = resolveTemplate(projectType, language, templatesMap);
  const directoryMode = await handleExistingDirectory(targetDir);

  if (directoryMode === "ignore") {
    console.log(`\n${pc.dim("Existing files will be preserved.")}`);
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  console.log(`\n${pc.dim("Creating project...")}`);
  console.log(`${pc.dim("Template:")} ${pc.cyan(template)}`);
  console.log(`${pc.dim("Location:")} ${pc.cyan(targetDir)}`);

  copyTemplates(template, targetDir, templatesDir, {
    copyDirFn: copyDirectory,
  });

  console.log(`\n${pc.green("✓")} Project created successfully!`);

  if (install) {
    installDependencies(targetDir);
    console.log(`\n${pc.green("✓")} Dependencies installed!`);
  }

  console.log(`\n${pc.dim("Next steps:")}`);
  console.log(`  ${pc.cyan(`cd ${projectName}`)}`);
  if (!install) console.log(`  ${pc.cyan("npm install")}`);
  console.log(`  ${pc.cyan("npm run dev")}\n`);
}

// =============================================================================
// CLI ENTRYPOINT EXECUTION
// =============================================================================

export async function runCli(configOverrides = {}) {
  const {
    templates,
    languageNames,
    projectTypes,
    templatesDir,
    utils,
  } = configOverrides;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const resolvedTemplatesDir = templatesDir || path.join(path.resolve(__dirname, ".."), "templates");
  const resolvedUtils = utils || (await import("./utils/index.js").catch(() => ({})));

  const configOptions = {
    templates,
    projectTypes,
    languageNames,
  };

  try {
    const config = await getProjectConfig(process.argv.slice(2), configOptions);
    
    await createProject(config, {
      templatesDir: resolvedTemplatesDir,
      templatesMap: templates,
      utils: resolvedUtils,
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

// // Auto-run with default configurations if executed directly from the terminal
// if (import.meta.url === `file://${process.argv[1]}`) {
//   runCli();
// }