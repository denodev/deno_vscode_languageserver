import {
  assertEquals,
  assertStrictEq,
  assertThrows,
} from "https://deno.land/std/testing/asserts.ts";
import { TextDocument, Range, Position } from "../mod.ts";

function newDocument(str: string): TextDocument {
  return TextDocument.create("file://foo/bar", "text", 0, str);
}

Deno.test("TextDocument - Single line", () => {
  var str = "Hello World";
  var lm = newDocument(str);
  assertEquals(lm.lineCount, 1);

  for (var i = 0; i < str.length; i++) {
    assertEquals(lm.offsetAt(Position.create(0, i)), i);
    assertEquals(lm.positionAt(i), Position.create(0, i));
  }
});

Deno.test("TextDocument - Multiple lines", () => {
  var str = "ABCDE\nFGHIJ\nKLMNO\n";
  var lm = newDocument(str);
  assertEquals(lm.lineCount, 4);

  for (var i = 0; i < str.length; i++) {
    var line = Math.floor(i / 6);
    var column = i % 6;

    assertEquals(lm.offsetAt(Position.create(line, column)), i);
    assertEquals(lm.positionAt(i), Position.create(line, column));
  }

  assertEquals(lm.offsetAt(Position.create(3, 0)), 18);
  assertEquals(lm.offsetAt(Position.create(3, 1)), 18);
  assertEquals(lm.positionAt(18), Position.create(3, 0));
  assertEquals(lm.positionAt(19), Position.create(3, 0));
});

Deno.test("TextDocument - New line characters", () => {
  var str = "ABCDE\rFGHIJ";
  assertEquals(newDocument(str).lineCount, 2);

  var str = "ABCDE\nFGHIJ";
  assertEquals(newDocument(str).lineCount, 2);

  var str = "ABCDE\r\nFGHIJ";
  assertEquals(newDocument(str).lineCount, 2);

  str = "ABCDE\n\nFGHIJ";
  assertEquals(newDocument(str).lineCount, 3);

  str = "ABCDE\r\rFGHIJ";
  assertEquals(newDocument(str).lineCount, 3);

  str = "ABCDE\n\rFGHIJ";
  assertEquals(newDocument(str).lineCount, 3);
});

Deno.test("TextDocument - getText(Range)", () => {
  var str = "12345\n12345\n12345";
  var lm = newDocument(str);
  assertEquals(lm.getText(), str);
  assertEquals(lm.getText(Range.create(-1, 0, 0, 5)), "12345");
  assertEquals(lm.getText(Range.create(0, 0, 0, 5)), "12345");
  assertEquals(lm.getText(Range.create(0, 4, 1, 1)), "5\n1");
  assertEquals(lm.getText(Range.create(0, 4, 2, 1)), "5\n12345\n1");
  assertEquals(lm.getText(Range.create(0, 4, 3, 1)), "5\n12345\n12345");
  assertEquals(lm.getText(Range.create(0, 0, 3, 5)), str);
});

Deno.test("TextDocument - Invalid inputs", () => {
  var str = "Hello World";
  var lm = newDocument(str);

  // invalid position
  assertEquals(lm.offsetAt(Position.create(0, str.length)), str.length);
  assertEquals(lm.offsetAt(Position.create(0, str.length + 3)), str.length);
  assertEquals(lm.offsetAt(Position.create(2, 3)), str.length);
  assertEquals(lm.offsetAt(Position.create(-1, 3)), 0);
  assertEquals(lm.offsetAt(Position.create(0, -3)), 0);
  assertEquals(lm.offsetAt(Position.create(1, -3)), str.length);

  // invalid offsets
  assertEquals(lm.positionAt(-1), Position.create(0, 0));
  assertEquals(lm.positionAt(str.length), Position.create(0, str.length));
  assertEquals(lm.positionAt(str.length + 3), Position.create(0, str.length));
});
