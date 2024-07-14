export const onEditTextField = (results, id, text) => {
  const newExtractedTextList = results.map((item) => {
    if (item.id === id) {
      item.text = text;
    }
    return item;
  });
  return newExtractedTextList;
};

export function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}
