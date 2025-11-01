type Props = {
    containerRef: React.RefObject<HTMLDivElement | null>;
    viewCanvasRef: React.RefObject<HTMLCanvasElement | null>;
    maskCanvasRef: React.RefObject<HTMLCanvasElement | null>;
    width: number; height: number;
    onDown: (e: React.PointerEvent<HTMLCanvasElement>) => void;
    onMove: (e: React.PointerEvent<HTMLCanvasElement>) => void;
    onUp: (e: React.PointerEvent<HTMLCanvasElement>) => void;
    hasImage: boolean;
};

export default function CanvasStage({
    containerRef, viewCanvasRef, maskCanvasRef,
    width, height, onDown, onMove, onUp, hasImage,
}: Props) {
    return (
        <div className="flex-1 p-4">
            <div ref={containerRef} className="w-full h-[70vh] border rounded grid place-items-center bg-neutral-50">
                {!hasImage ? (
                    <div className="text-sm opacity-70">Bir görsel yükleyin.</div>
                ) : (
                    <div className="relative" style={{ width, height }}>
                        <canvas
                            ref={viewCanvasRef}
                            className="absolute inset-0 touch-none cursor-crosshair"
                            onPointerDown={onDown}
                            onPointerMove={onMove}
                            onPointerUp={onUp}
                        />
                        <canvas ref={maskCanvasRef} className="hidden" />
                    </div>
                )}
            </div>
        </div>
    );
}
