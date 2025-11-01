import type { BrushMode } from "../types";

type Props = {
    brushSize: number;
    mode: BrushMode;
    onFile: (f: File | null) => void;
    onBrushSize: (v: number) => void;
    onMode: (m: BrushMode) => void;
    onClear: () => void;
    onExport: () => void;
    onUndo: () => void;
    onRedo: () => void;
};

export default function Toolbar({
    brushSize, mode, onFile, onBrushSize, onMode, onClear, onExport, onUndo, onRedo,
}: Props) {
    return (
        <div className="p-4 flex flex-wrap items-center gap-3 border-b">
            <label className="inline-flex items-center gap-2">
                <span className="text-sm">Fotoğraf Seç</span>
                <input type="file" accept="image/png,image/jpeg" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
            </label>

            <div className="inline-flex items-center gap-2">
                <span className="text-sm">Fırça</span>
                <input type="range" min={4} max={48} value={brushSize} onChange={(e) => onBrushSize(Number(e.target.value))} />
                <span className="text-sm w-8 text-center">{brushSize}</span>
            </div>

            <div className="inline-flex items-center gap-2">
                <button className={`px-3 py-1 border rounded ${mode === "draw" ? "bg-black text-white" : ""}`} onClick={() => onMode("draw")}>Draw</button>
                <button className={`px-3 py-1 border rounded ${mode === "erase" ? "bg-black text-white" : ""}`} onClick={() => onMode("erase")}>Erase</button>
            </div>

            <button className="px-3 py-1 border rounded" onClick={onClear}>Clear</button>
            <button className="px-3 py-1 border rounded" onClick={onUndo}>Undo</button>
            <button className="px-3 py-1 border rounded" onClick={onRedo}>Redo</button>
            <button className="px-3 py-1 border rounded" onClick={onExport}>Maskeyi İndir</button>
        </div>
    );
}
