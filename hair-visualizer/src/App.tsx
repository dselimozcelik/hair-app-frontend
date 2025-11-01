import Toolbar from "./components/Toolbar";
import CanvasStage from "./components/CanvasStage";
import { useCanvasDrawing } from "./hooks/useCanvasDrawing";

export default function App() {
  const d = useCanvasDrawing();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 text-center text-xl font-semibold">Hair Visualizer</header>

      <Toolbar
        brushSize={d.brushSize}
        mode={d.mode}
        onFile={(f) => d.setFile(f)}
        onBrushSize={(v) => d.setBrushSize(v)}
        onMode={(m) => d.setMode(m)}
        onClear={d.clearAll}
        onExport={d.exportMask}
      />

      <CanvasStage
        containerRef={d.containerRef}
        viewCanvasRef={d.viewCanvasRef}
        maskCanvasRef={d.maskCanvasRef}
        width={d.viewport.width}
        height={d.viewport.height}
        onDown={d.handlePointerDown}
        onMove={d.handlePointerMove}
        onUp={d.handlePointerUp}
        hasImage={!!d.img}
      />
    </div>
  );
}
