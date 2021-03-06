import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std/testing/asserts.ts";

import { TextDocument } from "../mod.ts";
import {
  Positions as Position,
  Ranges as Range,
  TextEdits as TextEdit,
} from "./helper.ts";

const applyEdits = TextDocument.applyEdits;

Deno.test("Edits - inserts", function (): any {
  let input = TextDocument.create(
    "foo://bar/f",
    "html",
    0,
    "012345678901234567890123456789",
  );
  assertEquals(
    applyEdits(input, [TextEdit.insert(Position.create(0, 0), "Hello")]),
    "Hello012345678901234567890123456789",
  );
  assertEquals(
    applyEdits(input, [TextEdit.insert(Position.create(0, 1), "Hello")]),
    "0Hello12345678901234567890123456789",
  );
  assertEquals(
    applyEdits(
      input,
      [
        TextEdit.insert(Position.create(0, 1), "Hello"),
        TextEdit.insert(Position.create(0, 1), "World"),
      ],
    ),
    "0HelloWorld12345678901234567890123456789",
  );
  assertEquals(
    applyEdits(
      input,
      [
        TextEdit.insert(Position.create(0, 2), "One"),
        TextEdit.insert(Position.create(0, 1), "Hello"),
        TextEdit.insert(Position.create(0, 1), "World"),
        TextEdit.insert(Position.create(0, 2), "Two"),
        TextEdit.insert(Position.create(0, 2), "Three"),
      ],
    ),
    "0HelloWorld1OneTwoThree2345678901234567890123456789",
  );
});

Deno.test("Edits - replace", function (): any {
  let input = TextDocument.create(
    "foo://bar/f",
    "html",
    0,
    "012345678901234567890123456789",
  );
  assertEquals(
    applyEdits(input, [TextEdit.replace(Range.create(0, 3, 0, 6), "Hello")]),
    "012Hello678901234567890123456789",
  );
  assertEquals(
    applyEdits(
      input,
      [
        TextEdit.replace(Range.create(0, 3, 0, 6), "Hello"),
        TextEdit.replace(Range.create(0, 6, 0, 9), "World"),
      ],
    ),
    "012HelloWorld901234567890123456789",
  );
  assertEquals(
    applyEdits(
      input,
      [
        TextEdit.replace(Range.create(0, 3, 0, 6), "Hello"),
        TextEdit.insert(Position.create(0, 6), "World"),
      ],
    ),
    "012HelloWorld678901234567890123456789",
  );
  assertEquals(
    applyEdits(
      input,
      [
        TextEdit.insert(Position.create(0, 6), "World"),
        TextEdit.replace(Range.create(0, 3, 0, 6), "Hello"),
      ],
    ),
    "012HelloWorld678901234567890123456789",
  );
  assertEquals(
    applyEdits(
      input,
      [
        TextEdit.insert(Position.create(0, 3), "World"),
        TextEdit.replace(Range.create(0, 3, 0, 6), "Hello"),
      ],
    ),
    "012WorldHello678901234567890123456789",
  );
});

Deno.test("Edits - overlap", function (): any {
  let input = TextDocument.create(
    "foo://bar/f",
    "html",
    0,
    "012345678901234567890123456789",
  );
  assertThrows(() =>
    applyEdits(
      input,
      [
        TextEdit.replace(Range.create(0, 3, 0, 6), "Hello"),
        TextEdit.insert(Position.create(0, 3), "World"),
      ],
    )
  );
  assertThrows(() =>
    applyEdits(
      input,
      [
        TextEdit.replace(Range.create(0, 3, 0, 6), "Hello"),
        TextEdit.insert(Position.create(0, 4), "World"),
      ],
    )
  );
});

Deno.test("Edits - multiline", function (): any {
  let input = TextDocument.create("foo://bar/f", "html", 0, "0\n1\n2\n3\n4");
  assertEquals(
    applyEdits(
      input,
      [
        TextEdit.replace(Range.create(2, 0, 3, 0), "Hello"),
        TextEdit.insert(Position.create(1, 1), "World"),
      ],
    ),
    "0\n1World\nHello3\n4",
  );
});
