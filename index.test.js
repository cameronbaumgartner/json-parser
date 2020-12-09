const {parse: parseWithTokens, tokenize} = require("./token-parser");
const {parse: parseWithStrings, findNextDelimiter} = require( "./string-parser");

const USE_TOKENS = false;
const parseFn = USE_TOKENS ? parseWithTokens : parseWithStrings

const check = json_str => {
  expect(parseFn(json_str)).toEqual(JSON.parse(json_str));
}

test('delimiter', () => {
    expect(findNextDelimiter('[1,"2]",3],,,, ')).toBe(9)
})
test('complex delimiter', () => {
    expect(findNextDelimiter('["]", {a: "]"}, 3], {}')).toBe(17)
})
test('find character', () => {
    expect(findNextDelimiter('["]", {a: "]"}, 3], {}')).toBe(17)
})

test('json', () => {
    check('{}')
});

test('number', () => {
  check('3')
});

test('string', () => {
    check('"a"')
});

test('array empty', () => {
    check('[]')
});

test('object with key', () => {
    check('{"a": 3}')
});

test('object with multiple keys', () => {
    check('{"a": 1, "b": 2}')
});

test('array', () => {
    check('[1,2, 3]')
});

test('complex', () => {
    check(`[{"a": 2}, {"b": "d"}, {"c:": ":"}, {"d": ["c"]}]`)
});


