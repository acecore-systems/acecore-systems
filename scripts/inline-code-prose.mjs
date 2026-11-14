/** Remove only closed, same-length Markdown inline code spans. */
export function withoutInlineCode(text) {
  let result = "";
  let position = 0;
  while (position < text.length) {
    if (text[position] !== "`") {
      result += text[position++];
      continue;
    }
    let end = position;
    while (text[end] === "`") end++;
    // An escaped opening backtick is literal, not a delimiter.
    let slashes = 0;
    for (let i = position - 1; i >= 0 && text[i] === "\\"; i--) slashes++;
    if (slashes % 2) {
      result += text.slice(position, end);
      position = end;
      continue;
    }
    const length = end - position;
    let cursor = end;
    let closingEnd = -1;
    while (
      cursor < text.length &&
      text[cursor] !== "\n" &&
      text[cursor] !== "\r"
    ) {
      if (text[cursor] !== "`") {
        cursor++;
        continue;
      }
      let runEnd = cursor;
      while (text[runEnd] === "`") runEnd++;
      if (runEnd - cursor === length) {
        closingEnd = runEnd;
        break;
      }
      cursor = runEnd;
    }
    if (closingEnd < 0) {
      result += text.slice(position, end);
      position = end;
    } else {
      position = closingEnd;
    }
  }
  return result;
}
