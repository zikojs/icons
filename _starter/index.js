#!/usr/bin/env node
import {parsePrompt} from "./prompt.js"
import path from "path"
import { fileURLToPath } from 'node:url';

import { createFolder, copyFolder , runCommand } from "./utils/commands.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const Root = path.join(__dirname, "");

parsePrompt().then(({project_title, template_path, confirm_install})=>{
    const url = path.join(Root, template_path)
    console.log({url, project_title})
    if(!createFolder(project_title)){
        console.log(1)
    };
    copyFolder(url,path.join(process.cwd(), project_title));
    if(confirm_install)runCommand(`cd ${project_title} && npm install`);

})
