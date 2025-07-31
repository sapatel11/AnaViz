// components/visualizations/ScatterPlot.tsx
import React from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Scatter } from "react-chartjs-2";

ChartJS.register(LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ScatterPlotProps {
  data: { [key: string]: string | number }[];
  xKey: string;
  yKey: string;
}

const ScatterPlotComponent: React.FC<ScatterPlotProps> = ({ data, xKey, yKey }) => {
  const scatterData = data.map((item) => ({
    x: Number(item[xKey]),
    y: Number(item[yKey]),
  }));

  const chartData = {
    datasets: [
      {
        label: `${yKey} vs ${xKey}`,
        data: scatterData,
        backgroundColor: "rgba(16, 185, 129, 0.7)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 1,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: "Scatter Plot",
      },
    },
    scales: {
      x: {
        type: "linear" as const,
        position: "bottom" as const,
        title: {
          display: true,
          text: xKey,
        },
      },
      y: {
        type: "linear" as const,
        position: "left" as const,
        title: {
          display: true,
          text: yKey,
        },
      },
    },
  };

  return (
    <div className="w-full h-[400px] p-4 shadow rounded-lg border">
      <h2 className="text-lg font-semibold text-green-500 mb-2">Scatter Plot</h2>
      <Scatter data={chartData} options={options} />
    </div>
  );
};

export default ScatterPlotComponent;
