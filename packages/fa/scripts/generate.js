import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { camel2hyphencase } from './utils/index.js'
import { nestedChildren2component } from '@zikojs/icons-shared-utils'

const Icons = {
  ...fas,
  ...far,
  ...fab
}

const defaultProps = (IconName, width, height) => JSON.stringify(
  {
    viewBox: `0 0 ${width} ${height}`,
    fill: "currentColor",
    width: 24,
    height: 24,
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

const createIconComponent = (
  IconName,
  items,
  tagNames,
  width,
  height
) => {
  return `
import { tags } from 'ziko/dom';

const { svg, i, ${tagNames} } = tags;

export const ${IconName} = (props) => i(
  svg(
    {
    ...${defaultProps(IconName, width, height)},
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

  for (const [key, icon] of Object.entries(Icons)) {
    if (!icon?.icon || !icon?.iconName) continue

    const [
      width,
      height,
      ,
      ,
      pathData
    ] = icon.icon

    const IconName = icon.iconName.replace(
      /(^|-)(\w)/g,
      (_, __, c) => c.toUpperCase()
    )

    const contents = Array.isArray(pathData)
      ? pathData.map(d => [
          'path',
          { d },
          []
        ])
      : [
          ['path', { d: pathData }, []]
        ]

    const result = nestedChildren2component(contents)

    if (result === -1) continue

    const [items, tags] = result
    const tagNames = [...tags].join(', ')
    const children = items.join(',\n\t')

    _exports.add(
      `export { ${IconName} } from './icons/${IconName}.js'`
    )

    writeFileSync(
      `${iconsDir}/${IconName}.js`,
      createIconComponent(
        IconName,
        children,
        tagNames,
        width,
        height
      )
    )
  }

  writeFileSync(
    './generated-src/index.js',
    [..._exports].join('\n')
  )
}

generate()