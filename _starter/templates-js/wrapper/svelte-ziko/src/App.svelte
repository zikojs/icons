<script>
  import svelteLogo from '/svelte.svg'
  import viteLogo from '/vite.svg'
  import zikoLogo from '/ziko.svg'
  import {ZikoWrapper} from "ziko-wrapper/svelte";
  import {Flex, image, link} from "ziko"

const ImageWithLink = (href="", imgSrc="", alt="") => link(href, image(imgSrc, alt).style({
  border : "none",
  width : "200px",
  height : "200px"
})).setAttr({
  target : "_blank",
  class : "logo"
})

const Logos=()=> Flex(
    ImageWithLink("https://svelte.dev", svelteLogo, ""),
    ImageWithLink("https://vite.dev", viteLogo, ""),
    ImageWithLink("https://github.com/zakarialaoui10/ziko.js", zikoLogo, "")
  ).horizontal(0,"space-around").resp("150px", true)
</script>

<main>
  <p>Hello world! The content above the thematic break consists of Svelte elements, while the section below features a ZikoJS element rendered within a React app.</p>
    <hr/>
  <ZikoWrapper ui={Logos()} />
</main>

<style>
  /* .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  } */
</style>
