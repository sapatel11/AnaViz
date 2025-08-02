// components/visualizations/LineGraph.tsx
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

interface LineGraphProps {
  data: { [key: string]: string | number }[];
  xKey: string;
  yKey: string;
}

const LineGraphComponent: React.FC<LineGraphProps> = ({ data, xKey, yKey }) => {
  const labels = data.map((item) => item[xKey]?.toString());
  const values = data.map((item) => Number(item[yKey]));

  const chartData = {
    labels,
    datasets: [
      {
        label: yKey,
        data: values,
        borderColor: "rgba(245, 158, 11, 1)",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        borderWidth: 3,
        pointBackgroundColor: "rgba(245, 158, 11, 1)",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 5,
        tension: 0.2,
        fill: true,
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
        text: `${yKey} over ${xKey}`,
        color: "#92400e",
        font: {
          size: 18,
          weight: "bold" as const
        }
      },
    },
    scales: {
      x: {
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
        beginAtZero: true,
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
      <h2 className="text-xl font-bold text-amber-600 mb-4">Line Graph</h2>
      <div className="h-[320px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LineGraphComponent;
