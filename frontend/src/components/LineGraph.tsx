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
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(59, 130, 246, 1)",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: "Line Graph",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="w-full h-[400px] p-4 shadow rounded-lg border">
      <h2 className="text-lg font-semibold text-blue-500 mb-2">Line Graph</h2>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineGraphComponent;
