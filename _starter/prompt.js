import inquirer from 'inquirer';
import pc from 'picocolors';
const questions = [
    {
        type : "input",
        name : "project_title",
        message :  "What is the name of the app ?",
        default : "my-zikojs-app"
    },
    {
        type : 'list',
        name : 'language',
        message : 'Pick a language',
        choices : [
            {
                name : pc.yellowBright("Javascript"),
                value : "js"
            },
            {
                name : pc.blue("Typescript"),
                value : "ts",
                disabled : 1==1 ? "Not supported yet" : false
            },
        ]
    },
    {
        type : 'list',
        name : 'template',
        message : 'Choose a template',
        choices : [
            {
                name : "Blank",
                value : "blank"
            },
            {
                name : "File Based Routing",
                value : "file-based-routing"
            },
            {
                name : "Blog",
                value : "blog"
            },
            {
                name : "Wrapper",
                value : "wrapper"
            }
        ],
        when: (answers) => answers.language === 'js',
    }, 
    {
        type : 'list',
        name : 'wrapping_mode',
        message: 'Select how you want to use ZikoJS with a framework : ',
        choices : [
            {
                name : "Wrap Zikojs inside Other Framework",
                value : 0
            },
            {
                name : "Use Other framework inside Zikojs App",
                value : 1
            }
        ],
        when:({template}) => template === "wrapper"
    },
    {
        type : "list",
        name : "wrapper",
        message : "Select the framework",
        choices:({wrapping_mode})=> {
            const CHOICES = [
                {
                    name : pc.cyan("React"),
                    value : "react"
                },
                {
                    name : pc.red("Svelte"),
                    value : "svelte"
                },
                {
                    name : pc.green("Vue"),
                    value : "vue"
                },
                {
                    name : pc.blue("Solid"),
                    value : "solid"
                },
                {
                    name : pc.magenta("Preact"),
                    value : "preact"
                },
            ]
            if(wrapping_mode === 0) CHOICES.push(
                {
                    name : pc.white("Astro"),
                    value : "astro",
                },
                {
                    name : pc.white("Next"),
                    value : "next",
                },
                {
                    name : pc.white("SvelteKit"),
                    value : "sveltekit",
                },
                {
                    name : pc.white("Remix"),
                    value : "remix",
                },
                {
                    name : pc.white("Nuxt"),
                    value : "nuxt",
                }
            );
            return CHOICES;
        },
        when:({template}) => template === "wrapper"
    },
    { 
        type: 'confirm', 
        name: 'confirm_install', 
        message: 'Do you want to install dependencies ?',
    }
]

export const parsePrompt= async ()=>{
    const {project_title, language, template, wrapping_mode, wrapper, confirm_install} = await inquirer.prompt(questions);
    let template_path = `templates-${language}/${template}`;
    if(template === "wrapper") {
        if(wrapping_mode) template_path = `${template_path}/ziko-${wrapper}`;
        else template_path = `${template_path}/${wrapper}-ziko`
    }
    return {
        project_title,
        template_path,
        confirm_install
    }
}
