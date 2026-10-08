import { formatCardNumber, type TarotCard } from "@/data/cards";
import type { CardOrientation } from "@/data/cards";
export type ShareImage = { url: string; filename: string; file: File };

export function canShareImage(image: ShareImage) {
  try {
    return (
      typeof navigator.share === "function" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [image.file] })
    );
  } catch {
    return false;
  }
}
export async function shareImage(
  image: ShareImage,
): Promise<"shared" | "cancelled" | "unsupported"> {
  if (!canShareImage(image)) return "unsupported";
  try {
    await navigator.share({ files: [image.file], title: "Tarot Biện Chứng" });
    return "shared";
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError")
      return "cancelled";
    throw error;
  }
}

// Share copy comes only from the fixed card data, never from a private question or AI response.
export function shareMessage(card: TarotCard, orientation: CardOrientation) {
  return (
    orientation === "upright" ? card.uprightFramework : card.reversedFramework
  ).split(/(?<=[.!?])\s/)[0];
}
function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  lineHeight: number,
) {
  let line = "";
  for (const word of text.split(" ")) {
    const trial = line ? `${line} ${word}` : word;
    if (ctx.measureText(trial).width > width && line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      line = word;
    } else line = trial;
  }
  ctx.fillText(line, x, y);
  return y + lineHeight;
}

async function blobAsDataUrl(blob: Blob) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Artwork export failed"));
    reader.readAsDataURL(blob);
  });
}

async function cloneInlineArtwork(svg: SVGSVGElement) {
  const artwork = svg.cloneNode(true) as SVGSVGElement;
  const images = Array.from(artwork.querySelectorAll("image"));
  await Promise.all(
    images.map(async (image) => {
      const href =
        image.getAttribute("href") ||
        image.getAttributeNS("http://www.w3.org/1999/xlink", "href");
      if (!href || href.startsWith("data:")) return;
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) {
        image.remove();
        return;
      }
      const response = await fetch(url, {
        credentials: "same-origin",
        cache: "force-cache",
      });
      if (!response.ok) throw new Error("Artwork export failed");
      image.setAttribute("href", await blobAsDataUrl(await response.blob()));
      image.removeAttributeNS("http://www.w3.org/1999/xlink", "href");
    }),
  );
  return artwork;
}

export async function createShareImage(
  card: TarotCard,
  orientation: CardOrientation,
  svg: SVGSVGElement,
) {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  const fonts = getComputedStyle(document.documentElement);
  const displayFont =
    fonts.getPropertyValue("--font-display").trim() || "serif";
  const bodyFont = fonts.getPropertyValue("--font-body").trim() || "sans-serif";
  ctx.fillStyle = "#0c1124";
  ctx.fillRect(0, 0, 1080, 1350);
  ctx.strokeStyle = "#b9c4f2";
  ctx.lineWidth = 1;
  ctx.strokeRect(48, 48, 984, 1254);
  ctx.strokeStyle = "#b9c4f240";
  ctx.strokeRect(63, 63, 954, 1224);
  ctx.textAlign = "center";
  ctx.fillStyle = "#b9c4f2";
  ctx.font = `20px ${bodyFont}`;
  ctx.fillText("T A R O T   B I Ệ N   C H Ứ N G", 540, 120);
  ctx.font = `26px ${bodyFont}`;
  ctx.fillText(formatCardNumber(card.number), 540, 200);
  const artwork = await cloneInlineArtwork(svg);
  artwork.setAttribute("width", "240");
  artwork.setAttribute("height", "250");
  const source = new XMLSerializer().serializeToString(artwork);
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
  await img.decode();
  ctx.save();
  if (orientation === "reversed") {
    ctx.translate(540, 505);
    ctx.rotate(Math.PI);
    ctx.drawImage(img, -250, -260, 500, 520);
  } else ctx.drawImage(img, 290, 245, 500, 520);
  ctx.restore();
  ctx.fillStyle = "#e9ecf7";
  ctx.font = `300 36px ${displayFont}`;
  wrap(ctx, card.name.toUpperCase(), 540, 838, 830, 52);
  ctx.fillStyle = "#b9c4f2";
  ctx.font = `28px ${bodyFont}`;
  wrap(ctx, card.concept, 540, 907, 830, 40);
  ctx.fillStyle = "#d5dcfa";
  ctx.font = `italic 300 32px ${displayFont}`;
  wrap(ctx, `“${shareMessage(card, orientation)}”`, 540, 1020, 820, 51);
  ctx.fillStyle = "#949cbd";
  ctx.font = `17px ${bodyFont}`;
  ctx.fillText("HIỂU HIỆN TẠI ĐỂ TẠO RA TƯƠNG LAI", 540, 1230);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Export failed"))),
      "image/png",
    ),
  );
  // A self-contained URL also downloads in embedded browsers that cannot resolve blob links.
  const url = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Export failed"));
    reader.readAsDataURL(blob);
  });
  const filename = `tarot-bien-chung-${card.id}.png`;
  return {
    url,
    filename,
    file: new File([blob], filename, { type: "image/png" }),
  };
}
