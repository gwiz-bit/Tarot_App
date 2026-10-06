/** Keep browsing circular, including after cards have been removed from the deck. */
export function wrapCarouselIndex(index: number, count: number) {
  return ((index % count) + count) % count;
}

export function remainingDeckIndices(count: number, selected: number[]) {
  const picked = new Set(selected);
  return Array.from({ length: count }, (_, index) => index).filter(
    (index) => !picked.has(index),
  );
}

export function carouselSnapTarget(offset: number, velocity: number) {
  // Velocity is measured in cards/second. A short throw keeps the landing legible.
  return Math.round(offset + Math.max(-3, Math.min(3, velocity * 0.14)));
}
