import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
const runCommand=command=>{
  try{
      execSync(command,{stdio:"inherit"});
  }
  catch(e){
      console.error(`Failed to execute ${command}`,e);
      return false;
  }
  return true
}

const createFolder = (FolderName = "") => {
  if (!FolderName) {
    throw new Error("Folder name must be provided.");
  }

  if (fs.existsSync(FolderName)) {
    console.log(`The project "${FolderName}" already exists.`);
    return false;
  }

  fs.mkdirSync(FolderName);
  console.log(`The project "${FolderName}" has been created.`);
  return true
};


const copyFolder=(source, target)=>{
  (!fs.existsSync(target)) && fs.mkdirSync(target);
  const files = fs.readdirSync(source);
  files.forEach((file) => {
      const currentPath = path.join(source, file);
      const targetPath = path.join(target, file);
      (fs.lstatSync(currentPath).isDirectory())?copyFolder(currentPath, targetPath):fs.copyFileSync(currentPath, targetPath);
  });
}
export {
  createFolder,
  copyFolder,
  runCommand
}