import { useEffect, useRef, useState } from "react";

interface ImageEffectCanvasProps {
  imageData: ImageData | null;
  zoom: number;
  isProcessing: boolean;
  hasImage: boolean;
  error: string;
  effectName: string;
}

export function ImageEffectCanvas({
  imageData,
  zoom,
  isProcessing,
  hasImage,
  error,
  effectName,
}: ImageEffectCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderError, setRenderError] = useState("");
  const scale = zoom / 100;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageData) return;

    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const context = canvas.getContext("2d");
    if (!context) {
      setRenderError("Canvas is not supported by this browser.");
      return;
    }
    context.putImageData(imageData, 0, 0);
    setRenderError("");
  }, [imageData]);

  return (
    <>
      {error && <div className="ascii-error" role="alert">{error}</div>}
      {renderError && <div className="ascii-error" role="alert">{renderError}</div>}

      <div className={`ascii-canvas ${hasImage ? "has-image" : "is-empty"}`}>
        {isProcessing ? (
          <span className="canvas-message">Applying {effectName} effect...</span>
        ) : !hasImage ? (
          <div className="empty-canvas">
            <strong>Your canvas is waiting</strong>
            <span>Choose an image above to preview this effect.</span>
          </div>
        ) : imageData ? (
          <div className="studio-image-fit">
            <canvas
              ref={canvasRef}
              aria-label={`${effectName} effect applied to the original image`}
              style={{
                display: "block",
                width: "auto",
                height: "auto",
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                transform: `scale(${scale})`,
                transformOrigin: "center",
              }}
            />
          </div>
        ) : error ? null : (
          <span className="canvas-message">Preparing image effect...</span>
        )}
      </div>
    </>
  );
}
