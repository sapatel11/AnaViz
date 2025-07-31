// components/visualizations/Heatmap.tsx
import React, { useRef, useEffect } from "react";

interface HeatmapProps {
  data: { [key: string]: string | number }[];
  xKey: string;
  yKey: string;
  valueKey: string;
}

const HeatmapComponent: React.FC<HeatmapProps> = ({ data, xKey, yKey, valueKey }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get unique x and y values
    const xValues = [...new Set(data.map(item => item[xKey]?.toString()))];
    const yValues = [...new Set(data.map(item => item[yKey]?.toString()))];
    
    // Create a matrix for the heatmap
    const matrix: number[][] = [];
    for (let i = 0; i < yValues.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < xValues.length; j++) {
        const matchingData = data.find(
          item => item[xKey]?.toString() === xValues[j] && 
                  item[yKey]?.toString() === yValues[i]
        );
        matrix[i][j] = matchingData ? Number(matchingData[valueKey]) : 0;
      }
    }

    // Find min and max values for color scaling
    const allValues = matrix.flat();
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const cellWidth = canvasWidth / xValues.length;
    const cellHeight = canvasHeight / yValues.length;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw heatmap cells
    for (let i = 0; i < yValues.length; i++) {
      for (let j = 0; j < xValues.length; j++) {
        const value = matrix[i][j];
        const normalizedValue = (value - minValue) / (maxValue - minValue);
        
        // Create color gradient from blue (low) to red (high)
        const red = Math.round(255 * normalizedValue);
        const blue = Math.round(255 * (1 - normalizedValue));
        const green = 0;
        
        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
        
        // Add border
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.strokeRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
        
        // Add value text
        if (value > 0) {
          ctx.fillStyle = "#ffffff";
          ctx.font = "12px Arial";
          ctx.textAlign = "center";
          ctx.fillText(
            value.toString(),
            j * cellWidth + cellWidth / 2,
            i * cellHeight + cellHeight / 2 + 4
          );
        }
      }
    }

    // Draw axis labels
    ctx.fillStyle = "#000000";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    
    // X-axis labels
    for (let j = 0; j < xValues.length; j++) {
      ctx.fillText(
        xValues[j],
        j * cellWidth + cellWidth / 2,
        canvasHeight - 5
      );
    }
    
    // Y-axis labels
    ctx.textAlign = "right";
    for (let i = 0; i < yValues.length; i++) {
      ctx.fillText(
        yValues[i],
        5,
        i * cellHeight + cellHeight / 2 + 4
      );
    }

  }, [data, xKey, yKey, valueKey]);

  return (
    <div className="w-full h-[400px] p-4 shadow rounded-lg border">
      <h2 className="text-lg font-semibold text-purple-500 mb-2">Heatmap</h2>
      <div className="flex justify-center items-center h-full">
        <canvas
          ref={canvasRef}
          width={400}
          height={300}
          className="border border-gray-300"
        />
      </div>
      <div className="mt-2 text-sm text-gray-600 text-center">
        <span className="inline-block w-4 h-4 bg-blue-500 mr-1"></span>
        Low
        <span className="inline-block w-4 h-4 bg-red-500 ml-4 mr-1"></span>
        High
      </div>
    </div>
  );
};

export default HeatmapComponent;
