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
        backgroundColor: "rgba(245, 158, 11, 0.7)",
        borderColor: "rgba(245, 158, 11, 1)",
        borderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: "top" as const,
        labels: {
          color: "#92400e",
          font: {
            size: 14,
            weight: "bold" as const
          }
        }
      },
      title: {
        display: true,
        text: `${yKey} vs ${xKey}`,
        color: "#92400e",
        font: {
          size: 18,
          weight: "bold" as const
        }
      },
    },
    scales: {
      x: {
        type: "linear" as const,
        position: "bottom" as const,
        title: {
          display: true,
          text: xKey,
          color: "#92400e",
          font: {
            size: 14,
            weight: "bold" as const
          }
        },
        ticks: {
          color: "#92400e",
          font: {
            size: 12
          }
        },
        grid: {
          color: "rgba(245, 158, 11, 0.1)"
        }
      },
      y: {
        type: "linear" as const,
        position: "left" as const,
        title: {
          display: true,
          text: yKey,
          color: "#92400e",
          font: {
            size: 14,
            weight: "bold" as const
          }
        },
        ticks: {
          color: "#92400e",
          font: {
            size: 12
          }
        },
        grid: {
          color: "rgba(245, 158, 11, 0.1)"
        }
      },
    },
  };

  return (
    <div className="w-full h-[400px] p-6 bg-white rounded-xl shadow-lg border border-amber-200">
      <h2 className="text-xl font-bold text-amber-600 mb-4">Scatter Plot</h2>
      <div className="h-[320px]">
        <Scatter data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ScatterPlotComponent;
