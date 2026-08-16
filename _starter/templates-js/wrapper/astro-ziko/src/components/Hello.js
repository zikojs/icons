import {h1} from "ziko"
export default function Hello({color}){
    return h1("Hello world").style({
        color 
    })
}