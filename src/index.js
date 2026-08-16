#!/usr/bin/env node

import inquirer from "inquirer";
import pc from "picocolors";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { getProjectConfig } from "./prompts.js";
import { TEMPLATES } from "./const.js";
import { 
  installDependencies,
  isDirectoryEmpty,
  copyDirectory,
  handleExistingDirectory
} from "./utils/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..");
const TEMPLATES_DIR = path.join(ROOT, "templates");
const SHARED_TEMPLATE = path.join(TEMPLATES_DIR, "shared");


function resolveTemplate(projectType, language) {
  const template = TEMPLATES[projectType]?.[language];

  if (!template) {
    throw new Error(
      `No template found for ${projectType} + ${language}.`
    );
  }

  return template;
}

function copyTemplates(template, targetDir, mode) {
  // Shared files
  copyDirectory(
    SHARED_TEMPLATE,
    targetDir
  );

  // Selected template
  const templateDir = path.join(
    TEMPLATES_DIR,
    template
  );

  copyDirectory(
    templateDir,
    targetDir
  );
}

async function createProject(config) {
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

  const template = resolveTemplate(
    projectType,
    language
  );

  const directoryMode = await handleExistingDirectory(targetDir);

  if (directoryMode === "ignore") {
    console.log(`\n${pc.dim("Existing files will be preserved.")}`);
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, {
      recursive: true,
    });
  }

  console.log(`\n${pc.dim("Creating project...")}`);
  console.log(`${pc.dim("Template:")} ${pc.cyan(template)}`);
  console.log(`${pc.dim("Location:")} ${pc.cyan(targetDir)}`);

  copyTemplates(
    template,
    targetDir,
    directoryMode
  );

  console.log(`\n${pc.green("✓")} Project created successfully!`);

  if (install) {
    installDependencies(targetDir);
    console.log(`\n${pc.green("✓")} Dependencies installed!`);
  }

  console.log(`\n${pc.dim("Next steps:")}`);
  console.log(`  ${pc.cyan(`cd ${projectName}`)}`);
  if(!install) console.log(`  ${pc.cyan("npm install")}`);
  console.log(`  ${pc.cyan("npm run dev")}\n`);
}

try {
  const config = await getProjectConfig();

  if (config.projectType === "extra") {
    console.log(
      `\n${pc.yellow(
        "Extra projects are not implemented yet."
      )}\n`
    );

    process.exit(0);
  }

  await createProject(config);
} catch (error) {
  if (error?.name === "ExitPromptError") {
    console.log(`\n${pc.dim("Cancelled.")}`);
    process.exit(0);
  }
  console.error(`\n${pc.red("✖")} ${error.message}\n`);
  process.exit(1);
}