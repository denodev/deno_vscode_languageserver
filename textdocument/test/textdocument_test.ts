import {
  assertEquals,
  assertThrows,
  assertStrictEq,
} from "https://deno.land/std/testing/asserts.ts";

import { TextDocument } from "../mod.ts";
import {
  Positions,
  Ranges,
} from "./helper.ts";

function newDocument(str: string) {
  return TextDocument.create("file://foo/bar", "text", 0, str);
}

Deno.test("Text Document Lines Model Validator - Empty content", () => {
  const str = "";
  const document = newDocument(str);
  assertEquals(document.lineCount, 1);
  assertEquals(document.offsetAt(Positions.create(0, 0)), 0);
  assertEquals(document.positionAt(0), Positions.create(0, 0));
});

Deno.test("Text Document Lines Model Validator - Single line", () => {
  const str = "Hello World";
  const document = newDocument(str);
  assertEquals(document.lineCount, 1);

  for (let i = 0; i < str.length; i++) {
    assertEquals(document.offsetAt(Positions.create(0, i)), i);
    assertEquals(document.positionAt(i), Positions.create(0, i));
  }
});

Deno.test("Text Document Lines Model Validator - Multiple lines", () => {
  const str = "ABCDE\nFGHIJ\nKLMNO\n";
  const document = newDocument(str);
  assertEquals(document.lineCount, 4);

  for (let i = 0; i < str.length; i++) {
    const line = Math.floor(i / 6);
    const column = i % 6;

    assertEquals(document.offsetAt(Positions.create(line, column)), i);
    assertEquals(document.positionAt(i), Positions.create(line, column));
  }

  assertEquals(document.offsetAt(Positions.create(3, 0)), 18);
  assertEquals(document.offsetAt(Positions.create(3, 1)), 18);
  assertEquals(document.positionAt(18), Positions.create(3, 0));
  assertEquals(document.positionAt(19), Positions.create(3, 0));
});

Deno.test("Text Document Lines Model Validator - Starts with new-line", () => {
  const document = newDocument("\nABCDE");
  assertEquals(document.lineCount, 2);
  assertEquals(document.positionAt(0), Positions.create(0, 0));
  assertEquals(document.positionAt(1), Positions.create(1, 0));
  assertEquals(document.positionAt(6), Positions.create(1, 5));
});

Deno.test("Text Document Lines Model Validator - New line characters", () => {
  let str = "ABCDE\rFGHIJ";
  assertEquals(newDocument(str).lineCount, 2);

  str = "ABCDE\nFGHIJ";
  assertEquals(newDocument(str).lineCount, 2);

  str = "ABCDE\r\nFGHIJ";
  assertEquals(newDocument(str).lineCount, 2);

  str = "ABCDE\n\nFGHIJ";
  assertEquals(newDocument(str).lineCount, 3);

  str = "ABCDE\r\rFGHIJ";
  assertEquals(newDocument(str).lineCount, 3);

  str = "ABCDE\n\rFGHIJ";
  assertEquals(newDocument(str).lineCount, 3);
});

Deno.test("Text Document Lines Model Validator - getText(Range)", () => {
  const str = "12345\n12345\n12345";
  const document = newDocument(str);
  assertEquals(document.getText(), str);
  assertEquals(document.getText(Ranges.create(-1, 0, 0, 5)), "12345");
  assertEquals(document.getText(Ranges.create(0, 0, 0, 5)), "12345");
  assertEquals(document.getText(Ranges.create(0, 4, 1, 1)), "5\n1");
  assertEquals(document.getText(Ranges.create(0, 4, 2, 1)), "5\n12345\n1");
  assertEquals(document.getText(Ranges.create(0, 4, 3, 1)), "5\n12345\n12345");
  assertEquals(document.getText(Ranges.create(0, 0, 3, 5)), str);
});

Deno.test("Text Document Lines Model Validator - Invalid inputs", () => {
  const str = "Hello World";
  const document = newDocument(str);

  // invalid position
  assertEquals(document.offsetAt(Positions.create(0, str.length)), str.length);
  assertEquals(
    document.offsetAt(Positions.create(0, str.length + 3)),
    str.length,
  );
  assertEquals(document.offsetAt(Positions.create(2, 3)), str.length);
  assertEquals(document.offsetAt(Positions.create(-1, 3)), 0);
  assertEquals(document.offsetAt(Positions.create(0, -3)), 0);
  assertEquals(document.offsetAt(Positions.create(1, -3)), str.length);

  // invalid offsets
  assertEquals(document.positionAt(-1), Positions.create(0, 0));
  assertEquals(
    document.positionAt(str.length),
    Positions.create(0, str.length),
  );
  assertEquals(
    document.positionAt(str.length + 3),
    Positions.create(0, str.length),
  );
});

Deno.test("Text Document Full Updates - One full update", () => {
  const document = newDocument("abc123");
  TextDocument.update(document, [{ text: "efg456" }], 1);
  assertStrictEq(document.version, 1);
  assertStrictEq(document.getText(), "efg456");
});

Deno.test("Text Document Full Updates - Several full content updates", () => {
  const document = newDocument("abc123");
  TextDocument.update(document, [{ text: "hello" }, { text: "world" }], 2);
  assertStrictEq(document.version, 2);
  assertStrictEq(document.getText(), "world");
});

// assumes that only '\n' is used
function assertValidLineNumbers(doc: TextDocument) {
  const text = doc.getText();
  let expectedLineNumber = 0;
  for (let i = 0; i < text.length; i++) {
    assertEquals(doc.positionAt(i).line, expectedLineNumber);
    const ch = text[i];
    if (ch === "\n") {
      expectedLineNumber++;
    }
  }
  assertEquals(doc.positionAt(text.length).line, expectedLineNumber);
}

Deno.test("Text Document Incremental Updates - Incrementally removing content", () => {
  const document = newDocument(
    'function abc() {\n  console.log("hello, world!");\n}',
  );
  assertEquals(document.lineCount, 3);
  assertValidLineNumbers(document);
  TextDocument.update(
    document,
    [{ text: "", range: Ranges.forSubstring(document, "hello, world!") }],
    1,
  );
  assertStrictEq(document.version, 1);
  assertStrictEq(document.getText(), 'function abc() {\n  console.log("");\n}');
  assertEquals(document.lineCount, 3);
  assertValidLineNumbers(document);
});

Deno.test("Text Document Incremental Updates - Incrementally removing multi-line content", () => {
  const document = newDocument("function abc() {\n  foo();\n  bar();\n  \n}");
  assertEquals(document.lineCount, 5);
  assertValidLineNumbers(document);
  TextDocument.update(
    document,
    [{
      text: "",
      range: Ranges.forSubstring(document, "  foo();\n  bar();\n"),
    }],
    1,
  );
  assertStrictEq(document.version, 1);
  assertStrictEq(document.getText(), "function abc() {\n  \n}");
  assertEquals(document.lineCount, 3);
  assertValidLineNumbers(document);
});

Deno.test("Text Document Incremental Updates - Incrementally removing multi-line content 2", () => {
  const document = newDocument("function abc() {\n  foo();\n  bar();\n  \n}");
  assertEquals(document.lineCount, 5);
  assertValidLineNumbers(document);
  TextDocument.update(
    document,
    [{ text: "", range: Ranges.forSubstring(document, "foo();\n  bar();") }],
    1,
  );
  assertStrictEq(document.version, 1);
  assertStrictEq(document.getText(), "function abc() {\n  \n  \n}");
  assertEquals(document.lineCount, 4);
  assertValidLineNumbers(document);
});

Deno.test("Text Document Incremental Updates - Incrementally adding content", () => {
  const document = newDocument('function abc() {\n  console.log("hello");\n}');
  assertEquals(document.lineCount, 3);
  assertValidLineNumbers(document);
  TextDocument.update(
    document,
    [{ text: ", world!", range: Ranges.afterSubstring(document, "hello") }],
    1,
  );
  assertStrictEq(document.version, 1);
  assertStrictEq(
    document.getText(),
    'function abc() {\n  console.log("hello, world!");\n}',
  );
  assertEquals(document.lineCount, 3);
  assertValidLineNumbers(document);
});

Deno.test("Text Document Incremental Updates - Incrementally adding multi-line content", () => {
  const document = newDocument(
    "function abc() {\n  while (true) {\n    foo();\n  };\n}",
  );
  assertEquals(document.lineCount, 5);
  assertValidLineNumbers(document);
  TextDocument.update(
    document,
    [{
      text: "\n    bar();",
      range: Ranges.afterSubstring(document, "foo();"),
    }],
    1,
  );
  assertStrictEq(document.version, 1);
  assertStrictEq(
    document.getText(),
    "function abc() {\n  while (true) {\n    foo();\n    bar();\n  };\n}",
  );
  assertEquals(document.lineCount, 6);
  assertValidLineNumbers(document);
});

Deno.test("Text Document Incremental Updates - Incrementally replacing single-line content, more chars", () => {
  const document = newDocument(
    'function abc() {\n  console.log("hello, world!");\n}',
  );
  assertEquals(document.lineCount, 3);
  assertValidLineNumbers(document);
  TextDocument.update(
    document,
    [{
      text: "hello, test case!!!",
      range: Ranges.forSubstring(document, "hello, world!"),
    }],
    1,
  );
  assertStrictEq(document.version, 1);
  assertStrictEq(
    document.getText(),
    'function abc() {\n  console.log("hello, test case!!!");\n}',
  );
  assertEquals(document.lineCount, 3);
  assertValidLineNumbers(document);
});

Deno.test("Text Document Incremental Updates - Incrementally replacing single-line content, less chars", () => {
  const document = newDocument(
    'function abc() {\n  console.log("hello, world!");\n}',
  );
  assertEquals(document.lineCount, 3);
  assertValidLineNumbers(document);
  TextDocument.update(
    document,
    [{ text: "hey", range: Ranges.forSubstring(document, "hello, world!") }],
    1,
  );
  assertStrictEq(document.version, 1);
  assertStrictEq(
    document.getText(),
    'function abc() {\n  console.log("hey");\n}',
  );
  assertEquals(document.lineCount, 3);
  assertValidLineNumbers(document);
});

Deno.test("Text Document Incremental Updates - Incrementally replacing single-line content, same num of chars", () => {
  const document = newDocument(
    'function abc() {\n  console.log("hello, world!");\n}',
  );
  assertEquals(document.lineCount, 3);
  assertValidLineNumbers(document);
  TextDocument.update(
    document,
    [{
      text: "world, hello!",
      range: Ranges.forSubstring(document, "hello, world!"),
    }],
    1,
  );
  assertStrictEq(document.version, 1);
  assertStrictEq(
    document.getText(),
    'function abc() {\n  console.log("world, hello!");\n}',
  );
  assertEquals(document.lineCount, 3);
  assertValidLineNumbers(document);
});

Deno.test("Text Document Incremental Updates - Incrementally replacing multi-line content, more lines", () => {
  const document = newDocument(
    'function abc() {\n  console.log("hello, world!");\n}',
  );
  assertEquals(document.lineCount, 3);
  assertValidLineNumbers(document);
  TextDocument.update(
    document,
    [{
      text: "\n//hello\nfunction d(){",
      range: Ranges.forSubstring(document, "function abc() {"),
    }],
    1,
  );
  assertStrictEq(document.version, 1);
  assertStrictEq(
    document.getText(),
    '\n//hello\nfunction d(){\n  console.log("hello, world!");\n}',
  );
  assertEquals(document.lineCount, 5);
  assertValidLineNumbers(document);
});

Deno.test("Text Document Incremental Updates - Incrementally replacing multi-line content, less lines", () => {
  const document = newDocument("a1\nb1\na2\nb2\na3\nb3\na4\nb4\n");
  assertEquals(document.lineCount, 9);
  assertValidLineNumbers(document);
  TextDocument.update(
    document,
    [{
      text: "xx\nyy",
      range: Ranges.forSubstring(document, "\na3\nb3\na4\nb4\n"),
    }],
    1,
  );
  assertStrictEq(document.version, 1);
  assertStrictEq(document.getText(), "a1\nb1\na2\nb2xx\nyy");
  assertEquals(document.lineCount, 5);
  assertValidLineNumbers(document);
});

Deno.test("Text Document Incremental Updates - Incrementally replacing multi-line content, same num of lines and chars", () => {
  const document = newDocument("a1\nb1\na2\nb2\na3\nb3\na4\nb4\n");
  assertEquals(document.lineCount, 9);
  assertValidLineNumbers(document);
  TextDocument.update(
    document,
    [{
      text: "\nxx1\nxx2",
      range: Ranges.forSubstring(document, "a2\nb2\na3"),
    }],
    1,
  );
  assertStrictEq(document.version, 1);
  assertStrictEq(document.getText(), "a1\nb1\n\nxx1\nxx2\nb3\na4\nb4\n");
  assertEquals(document.lineCount, 9);
  assertValidLineNumbers(document);
});

Deno.test("Text Document Incremental Updates - Incrementally replacing multi-line content, same num of lines but diff chars", () => {
  const document = newDocument("a1\nb1\na2\nb2\na3\nb3\na4\nb4\n");
  assertEquals(document.lineCount, 9);
  assertValidLineNumbers(document);
  TextDocument.update(
    document,
    [{ text: "\ny\n", range: Ranges.forSubstring(document, "a2\nb2\na3") }],
    1,
  );
  assertStrictEq(document.version, 1);
  assertStrictEq(document.getText(), "a1\nb1\n\ny\n\nb3\na4\nb4\n");
  assertEquals(document.lineCount, 9);
  assertValidLineNumbers(document);
});

Deno.test("Text Document Incremental Updates - Incrementally replacing multi-line content, huge number of lines", () => {
  const document = newDocument("a1\ncc\nb1");
  assertEquals(document.lineCount, 3);
  assertValidLineNumbers(document);
  const text = new Array(20000).join("\ndd"); // a string with 19999 `\n`
  TextDocument.update(
    document,
    [{ text, range: Ranges.forSubstring(document, "\ncc") }],
    1,
  );
  assertStrictEq(document.version, 1);
  assertStrictEq(document.getText(), "a1" + text + "\nb1");
  assertEquals(document.lineCount, 20001);
  assertValidLineNumbers(document);
});

Deno.test("Text Document Incremental Updates - Several incremental content changes", () => {
  const document = newDocument(
    'function abc() {\n  console.log("hello, world!");\n}',
  );
  TextDocument.update(document, [
    { text: "defg", range: Ranges.create(0, 12, 0, 12) },
    { text: "hello, test case!!!", range: Ranges.create(1, 15, 1, 28) },
    { text: "hij", range: Ranges.create(0, 16, 0, 16) },
  ], 1);
  assertStrictEq(document.version, 1);
  assertStrictEq(
    document.getText(),
    'function abcdefghij() {\n  console.log("hello, test case!!!");\n}',
  );
  assertValidLineNumbers(document);
});

Deno.test("Text Document Incremental Updates - Basic append", () => {
  let document = newDocument("foooo\nbar\nbaz");

  assertEquals(document.offsetAt(Positions.create(2, 0)), 10);

  TextDocument.update(
    document,
    [{ text: " some extra content", range: Ranges.create(1, 3, 1, 3) }],
    1,
  );
  assertEquals(document.getText(), "foooo\nbar some extra content\nbaz");
  assertEquals(document.version, 1);
  assertEquals(document.offsetAt(Positions.create(2, 0)), 29);
  assertValidLineNumbers(document);
});

Deno.test("Text Document Incremental Updates - Multi-line append", () => {
  let document = newDocument("foooo\nbar\nbaz");

  assertEquals(document.offsetAt(Positions.create(2, 0)), 10);

  TextDocument.update(
    document,
    [{ text: " some extra\ncontent", range: Ranges.create(1, 3, 1, 3) }],
    1,
  );
  assertEquals(document.getText(), "foooo\nbar some extra\ncontent\nbaz");
  assertEquals(document.version, 1);
  assertEquals(document.offsetAt(Positions.create(3, 0)), 29);
  assertEquals(document.lineCount, 4);
  assertValidLineNumbers(document);
});

Deno.test("Text Document Incremental Updates - Basic delete", () => {
  let document = newDocument("foooo\nbar\nbaz");

  assertEquals(document.offsetAt(Positions.create(2, 0)), 10);

  TextDocument.update(
    document,
    [{ text: "", range: Ranges.create(1, 0, 1, 3) }],
    1,
  );
  assertEquals(document.getText(), "foooo\n\nbaz");
  assertEquals(document.version, 1);
  assertEquals(document.offsetAt(Positions.create(2, 0)), 7);
  assertValidLineNumbers(document);
});

Deno.test("Text Document Incremental Updates - Multi-line delete", () => {
  let lm = newDocument("foooo\nbar\nbaz");

  assertEquals(lm.offsetAt(Positions.create(2, 0)), 10);

  TextDocument.update(lm, [{ text: "", range: Ranges.create(0, 5, 1, 3) }], 1);
  assertEquals(lm.getText(), "foooo\nbaz");
  assertEquals(lm.version, 1);
  assertEquals(lm.offsetAt(Positions.create(1, 0)), 6);
  assertValidLineNumbers(lm);
});

Deno.test("Text Document Incremental Updates - Single character replace", () => {
  let document = newDocument("foooo\nbar\nbaz");

  assertEquals(document.offsetAt(Positions.create(2, 0)), 10);

  TextDocument.update(
    document,
    [{ text: "z", range: Ranges.create(1, 2, 1, 3) }],
    2,
  );
  assertEquals(document.getText(), "foooo\nbaz\nbaz");
  assertEquals(document.version, 2);
  assertEquals(document.offsetAt(Positions.create(2, 0)), 10);
  assertValidLineNumbers(document);
});

Deno.test("Text Document Incremental Updates - Multi-character replace", () => {
  let lm = newDocument("foo\nbar");

  assertEquals(lm.offsetAt(Positions.create(1, 0)), 4);

  TextDocument.update(
    lm,
    [{ text: "foobar", range: Ranges.create(1, 0, 1, 3) }],
    1,
  );
  assertEquals(lm.getText(), "foo\nfoobar");
  assertEquals(lm.version, 1);
  assertEquals(lm.offsetAt(Positions.create(1, 0)), 4);
  assertValidLineNumbers(lm);
});

Deno.test("Text Document Incremental Updates - Invalid update ranges", () => {
  // Before the document starts -> before the document starts
  let document = newDocument("foo\nbar");
  TextDocument.update(
    document,
    [{ text: "abc123", range: Ranges.create(-2, 0, -1, 3) }],
    2,
  );
  assertEquals(document.getText(), "abc123foo\nbar");
  assertEquals(document.version, 2);
  assertValidLineNumbers(document);

  // Before the document starts -> the middle of document
  document = newDocument("foo\nbar");
  TextDocument.update(
    document,
    [{ text: "foobar", range: Ranges.create(-1, 0, 0, 3) }],
    2,
  );
  assertEquals(document.getText(), "foobar\nbar");
  assertEquals(document.version, 2);
  assertEquals(document.offsetAt(Positions.create(1, 0)), 7);
  assertValidLineNumbers(document);

  // The middle of document -> after the document ends
  document = newDocument("foo\nbar");
  TextDocument.update(
    document,
    [{ text: "foobar", range: Ranges.create(1, 0, 1, 10) }],
    2,
  );
  assertEquals(document.getText(), "foo\nfoobar");
  assertEquals(document.version, 2);
  assertEquals(document.offsetAt(Positions.create(1, 1000)), 10);
  assertValidLineNumbers(document);

  // After the document ends -> after the document ends
  document = newDocument("foo\nbar");
  TextDocument.update(
    document,
    [{ text: "abc123", range: Ranges.create(3, 0, 6, 10) }],
    2,
  );
  assertEquals(document.getText(), "foo\nbarabc123");
  assertEquals(document.version, 2);
  assertValidLineNumbers(document);

  // Before the document starts -> after the document ends
  document = newDocument("foo\nbar");
  TextDocument.update(
    document,
    [{ text: "entirely new content", range: Ranges.create(-1, 1, 2, 10000) }],
    2,
  );
  assertEquals(document.getText(), "entirely new content");
  assertEquals(document.version, 2);
  assertEquals(document.lineCount, 1);
  assertValidLineNumbers(document);
});
