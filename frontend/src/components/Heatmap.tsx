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

    // Set canvas size with padding for labels
    const padding = 60;
    const chartWidth = 500;
    const chartHeight = 400;
    canvas.width = chartWidth + padding * 2;
    canvas.height = chartHeight + padding * 2;

    const cellWidth = chartWidth / xValues.length;
    const cellHeight = chartHeight / yValues.length;

    // Clear canvas with background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw heatmap cells
    for (let i = 0; i < yValues.length; i++) {
      for (let j = 0; j < xValues.length; j++) {
        const value = matrix[i][j];
        const normalizedValue = (value - minValue) / (maxValue - minValue);
        
        // Create color gradient from light amber to dark orange
        const r = Math.round(255 * (0.2 + 0.8 * normalizedValue));
        const g = Math.round(255 * (0.8 - 0.6 * normalizedValue));
        const b = Math.round(255 * (0.2 - 0.2 * normalizedValue));
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(
          padding + j * cellWidth, 
          padding + i * cellHeight, 
          cellWidth, 
          cellHeight
        );
        
        // Add subtle border
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.strokeRect(
          padding + j * cellWidth, 
          padding + i * cellHeight, 
          cellWidth, 
          cellHeight
        );
        
        // Add value text with better contrast
        if (value > 0) {
          const textColor = normalizedValue > 0.5 ? "#ffffff" : "#000000";
          ctx.fillStyle = textColor;
          ctx.font = "bold 14px Arial";
          ctx.textAlign = "center";
          ctx.fillText(
            value.toLocaleString(),
            padding + j * cellWidth + cellWidth / 2,
            padding + i * cellHeight + cellHeight / 2 + 5
          );
        }
      }
    }

    // Draw axis labels with better styling
    ctx.fillStyle = "#92400e";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    
    // X-axis labels
    for (let j = 0; j < xValues.length; j++) {
      ctx.fillText(
        xValues[j],
        padding + j * cellWidth + cellWidth / 2,
        canvas.height - 20
      );
    }
    
    // Y-axis labels
    ctx.textAlign = "right";
    for (let i = 0; i < yValues.length; i++) {
      ctx.fillText(
        yValues[i],
        padding - 10,
        padding + i * cellHeight + cellHeight / 2 + 5
      );
    }

    // Draw title
    ctx.fillStyle = "#92400e";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      `${valueKey} by ${xKey} and ${yKey}`,
      canvas.width / 2,
      25
    );

  }, [data, xKey, yKey, valueKey]);

  return (
    <div className="w-full p-6 bg-white rounded-xl shadow-lg border border-amber-200">
      <h2 className="text-xl font-bold text-amber-600 mb-4">Heatmap</h2>
      <div className="flex flex-col items-center">
        <canvas
          ref={canvasRef}
          className="border border-amber-300 rounded-lg shadow-md mb-4"
        />
        <div className="text-sm text-amber-700 text-center">
          <span className="inline-block w-4 h-4 bg-amber-300 mr-1 rounded"></span>
          Low
          <span className="inline-block w-4 h-4 bg-orange-600 ml-4 mr-1 rounded"></span>
          High
        </div>
      </div>
    </div>
  );
};

export default HeatmapComponent;
