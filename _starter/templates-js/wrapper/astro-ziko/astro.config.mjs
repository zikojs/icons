// @ts-check
import { defineConfig } from 'astro/config';
import Ziko from "ziko-wrapper/astro"

// https://astro.build/config
export default defineConfig({
    integrations : [
        Ziko()
    ]
});
