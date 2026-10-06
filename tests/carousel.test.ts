import test from "node:test";
import assert from "node:assert/strict";
import {
  carouselSnapTarget,
  remainingDeckIndices,
  wrapCarouselIndex,
} from "../src/lib/carousel";

test("circular browsing crosses both ends without an empty center", () => {
  const indices = remainingDeckIndices(22, []);
  assert.equal(indices[wrapCarouselIndex(-1, indices.length)], 21);
  assert.equal(indices[wrapCarouselIndex(22, indices.length)], 0);
});

test("after drawing, every remaining card stays reachable and selected cards cannot recur", () => {
  const selected = [0, 21, 7];
  const indices = remainingDeckIndices(22, selected);
  const visited = new Set(
    Array.from(
      { length: indices.length },
      (_, step) => indices[wrapCarouselIndex(-12 + step, indices.length)],
    ),
  );
  assert.equal(visited.size, 19);
  for (const index of selected) assert.equal(visited.has(index), false);
  assert.equal(indices[wrapCarouselIndex(0, indices.length)], 1);
});

test("a drag snaps to a whole card and excessive velocity cannot skip beyond three cards", () => {
  assert.equal(carouselSnapTarget(2.3, 0), 2);
  assert.equal(carouselSnapTarget(2.3, 100), 5);
  assert.equal(carouselSnapTarget(-2.3, -100), -5);
});
