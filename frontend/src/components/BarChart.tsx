// components/visualizations/BarChart.tsx
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartProps {
  data: { [key: string]: string | number }[];
  xKey: string;
  yKey: string;
}

const BarChartComponent: React.FC<BarChartProps> = ({ data, xKey, yKey }) => {
  const labels = data.map((item) => item[xKey]?.toString());
  const values = data.map((item) => Number(item[yKey]));

  const chartData = {
    labels,
    datasets: [
      {
        label: yKey,
        data: values,
        backgroundColor: "rgba(251, 191, 36, 0.7)",
        borderColor: "rgba(251, 191, 36, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: "Bar Chart",
      },
    },
  };

  return (
    <div className="w-full h-[400px] p-4 shadow rounded-lg border">
      <h2 className="text-lg font-semibold text-amber-500 mb-2">Bar Chart</h2>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChartComponent;
