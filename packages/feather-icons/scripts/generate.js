import { writeFileSync, existsSync, mkdirSync } from 'fs'
import * as FeatherIconsModule from 'feather-icons/dist/icons.json' with { type: 'json' }
import { parseDocument } from 'htmlparser2'
import { 
  camel2hyphencase,
  nestedChildren2component
 } from '@zikojs/icons-shared-utils'

const FeatherIcons = FeatherIconsModule.default

const defaultProps = IconName => JSON.stringify(
  {
    viewBox: "0 0 24 24",
    fill: "none",
    width: 24,
    height: 24,
    stroke: "currentColor",
    "stroke-width": 2,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "aria-label": camel2hyphencase(IconName)
  },
  null,
  9
).replace(/\n\}/, '\n    }')

const svgNode2children = nodes => nodes
  .filter(node => node.type === 'tag')
  .map(node => [
    node.name,
    node.attribs || {},
    svgNode2children(node.children || [])
  ])

const contents2children = contents => {
  const document = parseDocument(contents)
  return svgNode2children(document.children)
}

const createIconComponent = (IconName, items, tagNames) => {
  return `
import { tags } from 'ziko/dom';

const { svg, i, ${tagNames} } = tags;

export const ${IconName} = (props) => i(
  svg(
    {
    ...${defaultProps(IconName)},
    "role": "img",
    ...props
    },
    ${items}
  )
)

export default ${IconName};
`.trimStart()
}

function generate() {
  const iconsDir = './generated-src/icons'

  if (!existsSync(iconsDir)) {
    mkdirSync(iconsDir, { recursive: true })
  }

  const _exports = new Set()

  for (const [name, contents] of Object.entries(FeatherIcons)) {
    const IconName = name.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase())

    const children = contents2children(contents)

    if (!children.length) continue

    const result = nestedChildren2component(children)

    if (result === -1) continue

    const [items, tags] = result
    const tagNames = [...tags].join(', ')
    const components = items.join(',\n\t')

    _exports.add(
      `export { ${IconName} } from './icons/${IconName}.js'`
    )

    writeFileSync(
      `${iconsDir}/${IconName}.js`,
      createIconComponent(IconName, components, tagNames)
    )
  }

  writeFileSync(
    './generated-src/index.js',
    [..._exports].join('\n')
  )
}

generate()