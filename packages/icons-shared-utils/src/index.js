export const children2component = children => {
  if (!children?.map) return -1

  const tags = new Set()

  const components = children.map(([key, value]) => {
    tags.add(key)
    return `${key}(${JSON.stringify(value)})`
  })

  return [components, tags]
}

export const nestedChildren2component = children => {
  if (!children?.map) return -1

  const tags = new Set()

  const convert = children => children.map(([key, value, nested]) => {
    tags.add(key)

    if (nested?.map) {
      return `${key}(${JSON.stringify(value)}, ${convert(nested).join(', ')})`
    }

    return `${key}(${JSON.stringify(value)})`
  })

  return [convert(children), tags]
}

export const camel2hyphencase = (text = '') =>
  text.replace(/[A-Z]/g, (match, index) =>
    index ? `-${match.toLowerCase()}` : match.toLowerCase()
  );