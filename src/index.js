import { runCli } from "./cli.js";
import {
    DEFAULT_TEMPLATES,
    DEFAULT_LANGUAGE_NAMES,
    DEFAULT_PROJECT_TYPES
} from './config.js'

runCli({
  templates : DEFAULT_TEMPLATES,
  languageNames : DEFAULT_LANGUAGE_NAMES,
  projectTypes : DEFAULT_PROJECT_TYPES,
})