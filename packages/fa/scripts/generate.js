import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import {
  camel2hyphencase,
  nestedChildren2component
} from '@zikojs/icons-shared-utils'

const PACKS = [
  {
    name: 'solid',
    prefix: 'fas',
    icons: fas
  },
  {
    name: 'regular',
    prefix: 'far',
    icons: far
  },
  {
    name: 'brands',
    prefix: 'fab',
    icons: fab
  }
]

const normalizeIconName = name => {
  name = String(name)

  let formatted = name.replace(
    /(^|-)(\w)/g,
    (_, __, c) => c.toUpperCase()
  )

  if (/^\d/.test(formatted)) {
    formatted = `_${formatted}`
  }

  return formatted
}

const defaultProps = (IconName, width, height) => JSON.stringify(
  {
    viewBox: `0 0 ${width} ${height}`,
    fill: 'currentColor',
    width: 24,
    height: 24,
    'aria-label': camel2hyphencase(IconName)
  },
  null,
  9
).replace(/\n\}/, '\n        }')

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

const generatePack = ({ name, icons }) => {
  const iconsDir = `./generated-src/icons/${name}`

  if (!existsSync(iconsDir)) {
    mkdirSync(iconsDir, { recursive: true })
  }

  const _exports = new Set()

  for (const [, icon] of Object.entries(icons)) {
    if (!icon?.icon || !icon?.iconName) continue

    const [
      width,
      height,
      ,
      ,
      pathData
    ] = icon.icon

    const IconName = normalizeIconName(icon.iconName)

    const contents = Array.isArray(pathData)
      ? pathData.map(d => [
          'path',
          { d }
        ])
      : [
          ['path', { d: pathData }]
        ]

    const result = nestedChildren2component(contents)

    if (result === -1) continue

    const [items, tags] = result
    const tagNames = [...tags].join(', ')
    const children = items.join(',\n\t')

    _exports.add(
      `export { ${IconName} } from './icons/${name}/${IconName}.js'`
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
    `./generated-src/${name}.js`,
    [..._exports].join('\n')
  )
}

const generate = () => {
  if (!existsSync('./generated-src')) {
    mkdirSync('./generated-src', {
      recursive: true
    })
  }

  for (const pack of PACKS) {
    generatePack(pack)
  }
}

generate()