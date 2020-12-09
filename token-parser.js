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
const isNumeric = (c) => {
    return !isNaN(Number(c)) || c === ".";
}

let tokenize = (base_string) => {
    let characters = base_string.slice(0);
    let tokens = []
    while (characters.length > 0) {
        // skip whitespace
        if ("\n\t ".includes(characters[0])) {
            characters = characters.slice(1)
            continue
        }

        if (["{", "}", ":", "[", "]", ","].includes(characters[0])) {
            tokens.push(characters[0])
            characters = characters.slice(1)
            continue
        }

        if (characters[0] === '"') {
            const endQuoteIndex = characters.slice(1).indexOf('"');

            tokens.push(characters.slice(1, endQuoteIndex + 1));
            characters = characters.slice(endQuoteIndex + 2)
            continue
        }

        if (isNumeric(characters[0])) {
            let i = 0;
            while (isNumeric(characters[i]) && i < characters.length) {
                i += 1
            }
            tokens.push(characters.slice(0, i));
            characters = characters.slice(i)
            continue
        }
        throw Error("Invalid character at index")
    }
    return tokens
}

// this method is the same between the token and the string implementations
const findNextTokenDelimiter = (tokens, search) => {
    if (tokens.length === 0) {
        return 0;
    }

    const firstDelimiter = tokens[0]
    const firstEndMatch = startToEndings[firstDelimiter]
    let stack = firstEndMatch ? [firstEndMatch] : [];

    for (var i = 1; i < tokens.length; i++) {
        if (search && search === tokens[i] && stack.length === 0) {
            return i
        }
        // check if the current token = the ending of the last item in the stack.
        // if so, pop it.
        // if length of stack is 0, then return the current index
        // otherwise iterate.

        if (tokens[i] === stack[stack.length - 1]) {
            stack.pop()

            if (stack.length === 0 && !search) {
                return i;
            }

            continue;
        }

        const match = startToEndings[tokens[i]]

        // check if the current character = a start iterator.
        // if it does, push it

        if (match) {
            stack.push(match)
        }
    }
    // console.error("failure", tokens, search)
    throw Error("Matching delimiter not found, invalid json string")
}
const findNextCommaToken = tokens => {
    try {
        return findNextTokenDelimiter(tokens, ",")
    } catch (e) {
        return tokens.length
    }

}
const parseTokenObjectBody = (body) => {
    if (body.length === 0) {
        return {};
    }

    if (body.length < 3) {
        throw Error("Invalid json")
    }

    const key = body[0]
    const colon = body[1]
    let commaIndex = findNextCommaToken(body.slice(2))

    const value = body.slice(2, commaIndex + 2)

    if (colon !== ":") {
        throw Error("Invalid json")
    }

    return {
        [key]: parseTokens(value),
        ...parseTokenObjectBody(body.slice(commaIndex + 3))
    }
}
const parseTokenArrayBody = (body) => {
    if (body.length === 0) {
        return []
    }

    const commaIndex = findNextCommaToken(body)
    const value = body.slice(0, commaIndex)

    return [parseTokens(value), ...parseTokenArrayBody(body.slice(commaIndex + 1))]
}
const parseTokens = tokens => {
    if (tokens[0] === "{") {
        const closingIndex = findNextTokenDelimiter(tokens)
        const body = tokens.slice(1, closingIndex);
        return parseTokenObjectBody(body);
    }

    if (tokens[0] === "[") {
        const closingIndex = findNextTokenDelimiter(tokens)
        const body = tokens.slice(1, closingIndex)

        return parseTokenArrayBody(body);
    }

    if (!isNaN(Number(tokens[0]))) {
        return Number(tokens[0])
    }

    if (keywords[tokens[0]] !== undefined) {
        return keywords[tokens[0]]
    }

    return tokens[0]
}

/* Note: This tokenization method doesn't understand stringified numbers, ie "3" */
const parse = (str) => {
    const tokens = tokenize(str)
    const result = parseTokens(tokens)
    return result
}

module.exports = {
    parse
}