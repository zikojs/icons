import reactLogo from '/react.svg'
import viteLogo from '/vite.svg'
import zikoLogo from '/ziko.svg'
import './App.css'

import {ZikoWrapper} from "ziko-wrapper/react"
import {Flex, image, link} from "ziko"

const ImageWithLink = (href, imgSrc, alt) => link(href, image(imgSrc, alt).style({
  border : "none",
  width : "200px",
  height : "200px"
})).setAttr({
  target : "_blank",
  class : "logo"
})

const Logos=()=> Flex(
    ImageWithLink("https://react.dev", reactLogo, ""),
    ImageWithLink("https://vite.dev", viteLogo, ""),
    ImageWithLink("https://github.com/zakarialaoui10/ziko.js", zikoLogo, "")
  ).horizontal(0,"space-around").resp("150px", true)


function App(){
  return (
    <>
    <p>Hello world! The content above the thematic break consists of JSX React elements, while the section below features a ZikoJS element rendered within a React app.</p>
    <hr/>
      <ZikoWrapper>
        <Logos />
      </ZikoWrapper>
    </>
  )
}

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={zikoLogo} className="logo react" alt="Zikojs logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

export default App
