import React from "react";

export type StatisticalSummaryData = Record<string, Record<string, string | number>>;

interface MissingDataProps {
  data: StatisticalSummaryData;
}

const MissingDataOverview: React.FC<MissingDataProps> = ({ data }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-300 p-4 shadow-md bg-white max-w-4xl mx-auto">
      <h2 className="text-lg font-bold text-amber-500 mb-4">Missing Data Overview</h2>
      <table className="table-auto w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2 bg-amber-200 text-amber-500">Column</th>
            <th className="border border-gray-300 p-2 bg-amber-200 text-amber-500">Missing Count</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([columnName, stats]) => (
            <tr key={columnName}>
              <td className="border border-gray-300 bg-gray-100 text-amber-400 p-2">{columnName}</td>
              <td className="border border-gray-300 bg-gray-100 text-amber-400 p-2">
                {stats["missing"] !== undefined ? stats["missing"] : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MissingDataOverview;
