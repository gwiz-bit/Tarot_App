import test from "node:test";
import assert from "node:assert/strict";
import { canShareImage, shareImage } from "../src/lib/share";

test("file sharing handles supported, unavailable and cancelled platform share sheets", async () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  const image = {
    url: "data:image/png;base64,test",
    filename: "tarot.png",
    file: new File(["PNG"], "tarot.png", { type: "image/png" }),
  };
  try {
    let shared: ShareData | null = null;
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: {
        canShare: ({ files }: ShareData) => files?.[0].type === "image/png",
        share: async (data: ShareData) => {
          shared = data;
        },
      },
    });
    assert.equal(canShareImage(image), true);
    assert.equal(await shareImage(image), "shared");
    assert.deepEqual(shared, {
      files: [image.file],
      title: "Tarot Biện Chứng",
    });
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: {},
    });
    assert.equal(await shareImage(image), "unsupported");
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: {
        canShare: () => true,
        share: async () => {
          throw new DOMException("Cancelled", "AbortError");
        },
      },
    });
    assert.equal(await shareImage(image), "cancelled");
  } finally {
    if (previous) Object.defineProperty(globalThis, "navigator", previous);
    else Reflect.deleteProperty(globalThis, "navigator");
  }
});
