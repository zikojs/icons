<script setup>
import {ZikoWrapper} from "ziko-wrapper/vue";
import {Flex, image, link} from "ziko";
import vueLogo from '/vue.svg'
import viteLogo from '/vite.svg'
import zikoLogo from '/ziko.svg'

const ImageWithLink = (href, imgSrc, alt) => link(href, image(imgSrc, alt).style({
  border : "none",
  width : "200px",
  height : "200px"
})).setAttr({
  target : "_blank",
  class : "logo"
})

const Logos=()=> Flex(
    ImageWithLink("https://vuejs.org/", vueLogo, ""),
    ImageWithLink("https://github.com/zakarialaoui10/ziko.js", zikoLogo, ""),
    ImageWithLink("https://vite.dev", viteLogo, ""),
  ).horizontal(0,"space-around").resp("150px", true)
</script>

<template>
  <p>Hello world! The content above the thematic break consists of JSX React elements, while the section below features a ZikoJS element rendered within a React app.</p>
  <hr/>
  <ZikoWrapper>
      <Logos />
  </ZikoWrapper>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
