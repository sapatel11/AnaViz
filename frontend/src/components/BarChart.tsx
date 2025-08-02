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

  // Determine appropriate label based on data type
  const getLabel = () => {
    // If yKey is numeric, it's likely aggregated (mean/sum), otherwise it's a count
    const firstValue = data[0]?.[yKey];
    if (typeof firstValue === 'number') {
      return `Average ${yKey}`;
    }
    return `Count of ${yKey}`;
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: getLabel(),
        data: values,
        backgroundColor: "rgba(245, 158, 11, 0.7)",
        borderColor: "rgba(245, 158, 11, 1)",
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
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
        text: `${yKey} by ${xKey}`,
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
        ticks: {
          color: "#92400e",
          font: {
            size: 12
          }
        },
        grid: {
          color: "rgba(245, 158, 11, 0.1)"
        }
      }
    }
  };

  return (
    <div className="w-full h-[400px] p-6 bg-white rounded-xl shadow-lg border border-amber-200">
      <h2 className="text-xl font-bold text-amber-600 mb-4">Bar Chart</h2>
      <div className="h-[320px]">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default BarChartComponent;
