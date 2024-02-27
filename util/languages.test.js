const { strFormat, FormatSyntaxError, assignDeep } = require("./languages");

test('assignDeep', () => {
    expect(assignDeep(
        {
            a: {
                b: "bbb",
                c: "ccc"
            },
            e: "eee",
            f: "fff",
        },
        {
            a: {
                c: "CCC",
                d: "DDD"
            },
            f: "FFF",
            g: "GGG",
            h: {
                j: "JJJ"
            }
        }
    )).toStrictEqual(
        {
            a: {
                b: "bbb",
                c: "CCC",
                d: "DDD"
            },
            e: "eee",
            f: "FFF",
            g: "GGG",
            h: {
                j: "JJJ"
            }
        }
    );
});

test('strFormat', () => {
    expect(strFormat("text ${a} abc", { a: 123 })).toBe("text 123 abc");
    expect(strFormat("text \\${a} abc", { a: 123 })).toBe("text ${a} abc");
    expect(strFormat("text $\\{a} abc", { a: 123 })).toBe("text ${a} abc");
    expect(strFormat("${ a }${ b }", {
        a: 123,
        b: 456
    })).toBe("123456");
    expect(strFormat("a${0}c", ["b"])).toBe("abc")
    expect(strFormat("ab$cd")).toBe("ab$cd");
    expect(strFormat("ab\\")).toBe("ab\\");
    expect(strFormat("ab\\c")).toBe("ab\\c");
    expect(() => strFormat("abc${key")).toThrow(FormatSyntaxError);
    expect(strFormat("text ${0} abc", [123])).toBe("text 123 abc");
    expect(strFormat("text ${0} abc", 123)).toBe("text 123 abc");
});
