import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { Range, Position, Hover, MarkedString, TextEdit } from "../mod.ts";

const { test } = Deno;

test("Position", () => {
  const position: Position = {
    line: 0,
    character: 0,
  };
  assertEquals(Position.is(position), true);
});

test("Position - empty object", () => {
  const position = {};
  assertEquals(Position.is(position), false);
});

test("Position - missing character", () => {
  const position = {
    line: 0,
  };
  assertEquals(Position.is(position), false);
});

test("Position - null", () => {
  const position = null;
  assertEquals(Position.is(position), false);
});

test("Position - undefined", () => {
  const position = undefined;
  assertEquals(Position.is(position), false);
});

test("Range", () => {
  const range: Range = {
    start: {
      line: 0,
      character: 0,
    },
    end: {
      line: 1,
      character: 1,
    },
  };
  assertEquals(Range.is(range), true);
});

test("Range - empty object", () => {
  const range = {};
  assertEquals(Range.is(range), false);
});

test("Range - null", () => {
  const range = null;
  assertEquals(Range.is(range), false);
});

test("Range - undefined", () => {
  const range = undefined;
  assertEquals(Range.is(range), false);
});

test("MarkedString - string", () => {
  const markedString = "test";
  assertEquals(MarkedString.is(markedString), true);
});

test("MarkedString - language and value", () => {
  const markedString = { language: "foo", value: "test" };
  assertEquals(MarkedString.is(markedString), true);
});

test("MarkedString - null", () => {
  const markedString = null;
  assertEquals(MarkedString.is(markedString), false);
});

test("MarkedString - undefined", () => {
  const markedString = undefined;
  assertEquals(MarkedString.is(markedString), false);
});

test("Hover - string contents", () => {
  const hover = {
    contents: "test",
  };
  assertEquals(Hover.is(hover), true);
});

test("Hover - MarkupContent contents", () => {
  const hover = {
    contents: {
      kind: "plaintext",
      value: "test",
    },
  };
  assertEquals(Hover.is(hover), true);
});

test("Hover - MarkupContent contents array", () => {
  const hover = {
    contents: [
      {
        kind: "plaintext",
        value: "test",
      },
    ],
  };
  assertEquals(Hover.is(hover), false);
});

test("Hover - contents array", () => {
  const hover = {
    contents: [
      "test",
      {
        language: "foo",
        value: "test",
      },
    ],
  };
  assertEquals(Hover.is(hover), true);
});

test("Hover - null range", () => {
  const hover = {
    contents: "test",
    range: null,
  };
  assertEquals(Hover.is(hover), false);
});

test("Hover - null contents", () => {
  const hover = {
    contents: null,
  };
  assertEquals(Hover.is(hover), false);
});

test("Hover - contents array with null", () => {
  const hover = {
    contents: [null],
  };
  assertEquals(Hover.is(hover), false);
});

test("Hover - null", () => {
  const hover = null;
  assertEquals(Hover.is(hover), false);
});

test("Hover - undefined", () => {
  const hover = undefined;
  assertEquals(Hover.is(hover), false);
});

test("TextEdit - string contents, range defined", () => {
  const edit = {
    newText: "test",
    range: Range.create(Position.create(0, 0), Position.create(0, 1)),
  };
  assertEquals(TextEdit.is(edit), true);
});

test("TextEdit - string contents, range undefined", () => {
  const edit = {
    newText: "test",
    range: undefined,
  };
  assertEquals(TextEdit.is(edit), false);
});

test("TextEdit - string contents, range null", () => {
  const edit = {
    newText: "test",
    range: null,
  };
  assertEquals(TextEdit.is(edit), false);
});

test("TextEdit - null contents, range defined", () => {
  const edit = {
    contents: null,
    range: Range.create(Position.create(0, 0), Position.create(0, 1)),
  };
  assertEquals(TextEdit.is(edit), false);
});

test("TextEdit - undefined contents, range defined", () => {
  const edit = {
    contents: undefined,
    range: Range.create(Position.create(0, 0), Position.create(0, 1)),
  };
  assertEquals(TextEdit.is(edit), false);
});

test("TextEdit - null", () => {
  const edit = null;
  assertEquals(TextEdit.is(edit), false);
});

test("TextEdit - undefined", () => {
  const edit = undefined;
  assertEquals(TextEdit.is(edit), false);
});
