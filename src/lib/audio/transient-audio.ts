/** Best-effort cleanup of our owned bytes; browser/provider copies are not erasable here. */
export async function encodeActiveAudio(blob: Blob, isActive: () => boolean): Promise<string | null> {
  if (!isActive()) return null;
  const bytes = new Uint8Array(await blob.arrayBuffer());
  try {
    if (!isActive()) return null;
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    return btoa(binary);
  } finally {
    bytes.fill(0);
  }
}