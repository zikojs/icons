import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import {
  camel2hyphencase,
  nestedChildren2component
} from '@zikojs/icons-shared-utils'

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

    // 1. Convert to camelCase (e.g., "360-degrees" -> "360Degrees")
    let IconName = icon.iconName.replace(
      /(^|-)(\w)/g,
      (_, __, c) => c.toUpperCase()
    )

    // 2. Prefix with '_' if it starts with a number
    if (/^\d/.test(IconName)) {
      IconName = `_${IconName}`
    }

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