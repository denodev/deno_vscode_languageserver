import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std/testing/asserts.ts";
import { TextDocument, TextEdit, Position, Range } from "../mod.ts";

const applyEdits = TextDocument.applyEdits;

Deno.test(function editsInserts(): void {
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

Deno.test(function editsReplace(): void {
  let input = TextDocument.create(
    "foo://bar/f",
    "html",
    0,
    "012345678901234567890123456789",
  );
  assertEquals(
    applyEdits(
      input,
      [TextEdit.replace(
        Range.create(Position.create(0, 3), Position.create(0, 6)),
        "Hello",
      )],
    ),
    "012Hello678901234567890123456789",
  );
  assertEquals(
    applyEdits(
      input,
      [
        TextEdit.replace(
          Range.create(Position.create(0, 3), Position.create(0, 6)),
          "Hello",
        ),
        TextEdit.replace(
          Range.create(Position.create(0, 6), Position.create(0, 9)),
          "World",
        ),
      ],
    ),
    "012HelloWorld901234567890123456789",
  );
  assertEquals(
    applyEdits(
      input,
      [
        TextEdit.replace(
          Range.create(Position.create(0, 3), Position.create(0, 6)),
          "Hello",
        ),
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
        TextEdit.replace(
          Range.create(Position.create(0, 3), Position.create(0, 6)),
          "Hello",
        ),
      ],
    ),
    "012HelloWorld678901234567890123456789",
  );
  assertEquals(
    applyEdits(
      input,
      [
        TextEdit.insert(Position.create(0, 3), "World"),
        TextEdit.replace(
          Range.create(Position.create(0, 3), Position.create(0, 6)),
          "Hello",
        ),
      ],
    ),
    "012WorldHello678901234567890123456789",
  );
});

Deno.test(function editsOverlap(): void {
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
        TextEdit.replace(
          Range.create(Position.create(0, 3), Position.create(0, 6)),
          "Hello",
        ),
        TextEdit.insert(Position.create(0, 3), "World"),
      ],
    )
  );
  assertThrows(() =>
    applyEdits(
      input,
      [
        TextEdit.replace(
          Range.create(Position.create(0, 3), Position.create(0, 6)),
          "Hello",
        ),
        TextEdit.insert(Position.create(0, 4), "World"),
      ],
    )
  );
});

Deno.test(function editsMultiline(): void {
  let input = TextDocument.create("foo://bar/f", "html", 0, "0\n1\n2\n3\n4");
  assertEquals(
    applyEdits(
      input,
      [
        TextEdit.replace(
          Range.create(Position.create(2, 0), Position.create(3, 0)),
          "Hello",
        ),
        TextEdit.insert(Position.create(1, 1), "World"),
      ],
    ),
    "0\n1World\nHello3\n4",
  );
});
