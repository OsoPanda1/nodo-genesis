// @ts-nocheck — build-only image optimizer, sharp types conflict with TS strict
export function imageOptimizer() {
  return {
    name: "image-optimizer",
    enforce: "post",
    async generateBundle(_, bundle) {
      let sharpModule;
      try {
        sharpModule = (await import("sharp")).default;
      } catch {
        return;
      }
      if (!sharpModule) return;
      for (const [, asset] of Object.entries(bundle)) {
        if (asset.type === "asset" && /\.(png|jpe?g)$/i.test(asset.fileName)) {
          try {
            const oldName = asset.fileName;
            asset.fileName = asset.fileName.replace(/\.(png|jpe?g)$/i, ".webp");
            const img = sharpModule(asset.source);
            const meta = await img.metadata();
            asset.source = await (meta.format === "png"
              ? img.webp({ quality: 80, lossless: false })
              : img.webp({ quality: 80 })).toBuffer();
            for (const [, other] of Object.entries(bundle)) {
              if (other === asset) continue;
              const refs = [oldName, encodeURI(oldName)];
              const replacement = asset.fileName;
              if (other.type === "chunk" && typeof other.code === "string") {
                for (const ref of refs) other.code = other.code.replaceAll(ref, replacement);
              } else if (other.type === "asset" && typeof other.source === "string") {
                for (const ref of refs) other.source = other.source.replaceAll(ref, replacement);
              }
            }
          } catch {}
        }
      }
    },
  };
}
