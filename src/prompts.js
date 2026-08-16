import inquirer from "inquirer";
import pc from "picocolors";

const supportedLanguages = {
  spa: ["js", "ts", "jsx", "tsx"],
  fbr: ["js", "ts", "jsx"],
  ssr: ["js", "ts"],
};

const languageNames = {
  js: pc.yellowBright("JavaScript"),
  ts: pc.blueBright("TypeScript"),
  jsx: pc.cyanBright("JSX"),
  tsx: pc.magentaBright("TSX"),
};

const projectTypes = [
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

function getFlag(args, ...names) {
  const index = args.findIndex((arg) => names.includes(arg));

  if (index === -1) return undefined;

  const value = args[index + 1];

  if (!value || value.startsWith("-")) {
    return true;
  }

  return value;
}

function getProjectName(args) {
  const flagNames = [
    "--type",
    "-t",
    "--lang",
    "--language",
    "-l",
  ];

  return args.find((arg, index) => {
    if (arg.startsWith("-")) return false;

    return !flagNames.includes(args[index - 1]);
  });
}

function validateProjectName(value) {
  if (!value.trim()) {
    return "Project name is required.";
  }

  if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
    return "Project name can only contain letters, numbers, hyphens, and underscores.";
  }

  return true;
}

export async function getProjectConfig() {
  const args = process.argv.slice(2);

  let projectName = getProjectName(args);
  let projectType = getFlag(args, "--type", "-t");
  let language = getFlag(args, "--lang", "--language", "-l");

  // Project name
  if (!projectName) {
    ({ projectName } = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: "Project name:",
        default: "my-ziko-app",
        validate: validateProjectName,
      },
    ]));
  } else {
    const error = validateProjectName(projectName);

    if (error !== true) {
      throw new Error(error);
    }
  }

  // Project type
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
    const valid = projectTypes.some(
      (type) => type.value === projectType
    );

    if (!valid) {
      throw new Error(
        `Invalid project type: ${projectType}`
      );
    }
  }

  // Extra
  if (projectType === "extra") {
    return {
      projectName,
      projectType,
      language: null,
      install: false,
    };
  }

  // Language choices
  const languageChoices = supportedLanguages[projectType].map(
    (value) => ({
      name: languageNames[value],
      value,
    })
  );

  // Language
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
    const supported =
      supportedLanguages[projectType].includes(language);

    if (!supported) {
      throw new Error(
        `Language "${language}" is not supported for ${projectType}.`
      );
    }
  }

  // Install dependencies
  const { install } = await inquirer.prompt([
    {
      type: "confirm",
      name: "install",
      message: "Install dependencies?",
      default: true,
    },
  ]);

  return {
    projectName,
    projectType,
    language,
    install,
  };
}