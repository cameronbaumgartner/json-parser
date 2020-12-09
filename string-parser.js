const startToEndings = {
    '{': '}',
    '[': ']',
    "'": "'",
    '"': '"'
}
const keywords = {
    "true": true,
    "false": false,
    "null": null
}
const findNextDelimiter = (string, search = undefined) => {
    const firstDelimiter = string[0]
    const firstEndMatch = startToEndings[firstDelimiter]
    let stack = firstEndMatch ? [firstEndMatch] : [];

    for (var i = 1; i < string.length; i++) {
        if (search && search === string[i] && stack.length === 0) {
            return i
        }

        // check if the current character = the ending of the last item in the stack.
        // if so, pop it.
        // if length of stack is 0, then return the current index
        // otherwise iterate.

        if (string[i] === stack[stack.length - 1]) {
            stack.pop()

            if (stack.length === 0 && !search) {
                return i;
            }

            continue;
        }

        const match = startToEndings[string[i]]
        // check if the current character = a start iterator.
        // if it does, push it

        if (match) {
            stack.push(match)
        }
    }
    throw Error("Matching delimiter not found, invalid json string")
}
const findNextComma = str => {
    try {
        return findNextDelimiter(str, ",")
    } catch (e) {
        return str.length
    }

}
const parseObjectBody = objectBodyString => {
    if (objectBodyString === "") {
        return {}
    }
    const trimmed = objectBodyString.trim()
    const keyEnd = findNextDelimiter(trimmed)

    const key = trimmed.slice(1, keyEnd)
    const afterKey = trimmed.slice(keyEnd + 1);

    const colonIndex = afterKey.indexOf(":");
    const afterColon = afterKey.slice(colonIndex + 1)

    let nextCommaIndex = findNextComma(afterColon)
    const value = afterColon.slice(0, nextCommaIndex);

    const restObjectBody = afterColon.slice(nextCommaIndex + 1)

    return {
        [key]: parse(value),
        ...parseObjectBody(restObjectBody)
    }
}
const parseArray = (arrayBodyString) => {
    const trimmed = arrayBodyString.trim()
    if (trimmed.length === 0) {
        return []
    }
    const nextCommaIndex = findNextComma(trimmed, ",")
    const nextValue = trimmed.slice(0, nextCommaIndex)
    const rest = trimmed.slice(nextCommaIndex + 1)

    return [
        parse(nextValue),
        ...parseArray(rest)
    ]
}
const removeFirstAndLastChar = (str) => {
    return str.slice(1, str.length - 1)
}
const parse = json_str => {
    const trimmed_str = json_str.trim()
    const first_char = trimmed_str[0]

    // check if number
    if (!isNaN(Number(trimmed_str))) {
        return Number(trimmed_str)
    }

    if (keywords[trimmed_str] !== undefined) {
        return keywords[trimmed_str]
    }

    // check if string, if so return contents.
    if (first_char === '"') {
        const nextDelimiter = findNextDelimiter(trimmed_str)

        if (nextDelimiter + 1 === trimmed_str.length) {
            return removeFirstAndLastChar(trimmed_str)
        }
        throw Error("Invalid json")
    }

    // if start of an array, find the end of array, call split array function, recur on each component
    if (first_char === '[') {
        const nextDelimiterIndex = findNextDelimiter(trimmed_str)
        if (nextDelimiterIndex === 1) {
            return []
        }
        // full array parse
        return parseArray(removeFirstAndLastChar(trimmed_str))
    }

    // if start of object, find the end of the object and parse the body inside.
    if (first_char === '{') {
        const nextDelimiterIndex = findNextDelimiter(trimmed_str)
        const body = removeFirstAndLastChar(trimmed_str)

        if (nextDelimiterIndex === 1) {
            return {}
        }

        // full object parse
        return parseObjectBody(body)
    }
}
module.exports = {
    parse,
    findNextDelimiter
}