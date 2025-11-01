// src/core/exporter.ts
export function downloadMask(mask: HTMLCanvasElement, name = "mask.png") {
    const url = mask.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
}
