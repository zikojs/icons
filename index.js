import inquirer from "inquirer";

const args = process.argv.slice(2);

function getFlag(...names) {
  const index = args.findIndex((arg) => names.includes(arg));

  if (index === -1) return undefined;

  const value = args[index + 1];

  if (!value || value.startsWith("-")) {
    return true;
  }

  return value;
}

const projectNameArg = args.find(
  (arg) => !arg.startsWith("-")
);

const typeArg = getFlag("--type", "-t");
const languageArg = getFlag("--lang", "--language", "-l");

const answers = await inquirer.prompt([
  {
    type: "input",
    name: "projectName",
    message: "Project name:",
    default: projectNameArg || "my-ziko-app",
    when: !projectNameArg,
    validate(value) {
      if (!value.trim()) {
        return "Project name is required.";
      }

      if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
        return "Project name can only contain letters, numbers, hyphens, and underscores.";
      }

      return true;
    },
  },

  {
    type: "select",
    name: "projectType",
    message: "Project type:",
    choices: [
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
    ],
    default: typeArg,
    when: !typeArg,
  },

  {
    type: "select",
    name: "language",
    message: "Language:",
    choices: [
      {
        name: "JavaScript",
        value: "js",
      },
      {
        name: "TypeScript",
        value: "ts",
      },
      {
        name: "JSX",
        value: "jsx",
      },
    ],
    default: languageArg,
    when: ({ projectType }) =>
      projectType !== "extra" && !languageArg,
  },
]);

const projectName = projectNameArg || answers.projectName;
const projectType = typeArg || answers.projectType;
const language = languageArg || answers.language;

console.log({
  projectName,
  projectType,
  language,
});