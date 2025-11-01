import { useState } from "react";

type Props = {
    containerRef: React.RefObject<HTMLDivElement | null>;
    viewCanvasRef: React.RefObject<HTMLCanvasElement | null>;
    maskCanvasRef: React.RefObject<HTMLCanvasElement | null>;
    width: number; height: number;
    brushSize: number;
    onDown: (e: React.PointerEvent<HTMLCanvasElement>) => void;
    onMove: (e: React.PointerEvent<HTMLCanvasElement>) => void;
    onUp: (e: React.PointerEvent<HTMLCanvasElement>) => void;
    hasImage: boolean;
};

export default function CanvasStage({
    containerRef, viewCanvasRef, maskCanvasRef,
    width, height, brushSize,
    onDown, onMove, onUp, hasImage,
}: Props) {
    const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

    function handleCanvasMove(e: React.PointerEvent<HTMLCanvasElement>) {
        if (!viewCanvasRef.current) return;
        const rect = viewCanvasRef.current.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
        onMove(e);
    }

    function handleCanvasDown(e: React.PointerEvent<HTMLCanvasElement>) {
        onDown(e);
        handleCanvasMove(e);
    }

    function handleCanvasUp(e: React.PointerEvent<HTMLCanvasElement>) {
        onUp(e);
    }

    function handleMouseLeave() {
        setMousePos(null);
    }

    return (
        <div className="flex-1 p-4">
            <div ref={containerRef} className="w-full h-[70vh] border rounded grid place-items-center bg-neutral-50">
                {!hasImage ? (
                    <div className="text-sm opacity-70">Bir görsel yükleyin.</div>
                ) : (
                    <div className="relative" style={{ width, height }}>
                        <canvas
                            ref={viewCanvasRef}
                            className="absolute inset-0 touch-none"
                            style={{ cursor: "none" }}
                            onPointerDown={handleCanvasDown}
                            onPointerMove={handleCanvasMove}
                            onPointerUp={handleCanvasUp}
                            onPointerLeave={handleMouseLeave}
                        />
                        <canvas ref={maskCanvasRef} className="hidden" />
                        
                        {/* Brush Preview Circle */}
                        {mousePos && (
                            <div
                                className="absolute pointer-events-none rounded-full"
                                style={{
                                    left: mousePos.x - brushSize / 2,
                                    top: mousePos.y - brushSize / 2,
                                    width: brushSize,
                                    height: brushSize,
                                    border: "2px solid rgba(255, 255, 255, 0.9)",
                                    boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.3)",
                                    backgroundColor: "transparent",
                                }}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
