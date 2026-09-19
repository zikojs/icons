export const camel2hyphencase = (text = '') =>
  text.replace(/[A-Z]/g, (match, index) =>
    index ? `-${match.toLowerCase()}` : match.toLowerCase()
  );