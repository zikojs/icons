import { execSync } from "node:child_process";
import fs from "node:fs";
import inquirer from "inquirer";
import pc from "picocolors";

export function installDependencies(targetDir) {
  console.log(`\n${pc.dim("Installing dependencies...")}\n`);

  execSync("npm install", {
    cwd: targetDir,
    stdio: "inherit",
  });
}

export function isDirectoryEmpty(directory) {
  return fs.readdirSync(directory).length === 0;
}

export function copyDirectory(source, target) {
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


export async function handleExistingDirectory(targetDir) {
  if (!fs.existsSync(targetDir)) {
    return "create";
  }

  if (isDirectoryEmpty(targetDir)) {
    return "create";
  }

  const { action } = await inquirer.prompt([
    {
      type: "select",
      name: "action",
      message: "Current directory is not empty. Please choose how to proceed:",
      choices: [
        {
          name: "Remove existing files and continue",
          value: "remove",
        },
        {
          name: "Ignore files and continue",
          value: "ignore",
        },
        {
          name: "Cancel operation",
          value: "cancel",
        },
      ],
    },
  ]);

  if (action === "cancel") {
    throw new Error("Operation cancelled.");
  }

  if (action === "remove") {
    fs.rmSync(targetDir, {
      recursive: true,
      force: true,
    });

    fs.mkdirSync(targetDir, {
      recursive: true,
    });

    return "create";
  }

  return "ignore";
}

