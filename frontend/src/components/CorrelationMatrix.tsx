import React from "react";

interface CorrelationMatrixProps {
  data: Record<string, Record<string, string | number>>;
}

const CorrelationMatrix: React.FC<CorrelationMatrixProps> = ({ data }) => {
  const variables = Object.keys(data);

  return (
    <div className="overflow-auto rounded-lg border border-gray-300 p-4 shadow-md bg-white max-w-6xl mx-auto">
        <h2 className="text-lg font-bold text-amber-500 mb-4">Correlation Matrix</h2>
      <table className="table-auto border-collapse w-full text-sm text-center">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2 bg-gray-200"></th>
            {variables.map((col) => (
              <th key={col} className="border border-gray-300 p-2 bg-amber-200 text-amber-500">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {variables.map((rowVar) => (
            <tr key={rowVar}>
              <th className="border border-gray-300 p-2 bg-amber-200 font-medium text-amber-500">{rowVar}</th>
              {variables.map((colVar) => {
                const value = data[rowVar]?.[colVar];

                const display = typeof value === "number"
                  ? value.toFixed(2)
                  : value?.toString() || "—";

                return (
                  <td
                    key={colVar}
                    className="border border-gray-300 p-2 bg-gray-100 text-amber-400"
                  >
                    {display}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CorrelationMatrix;
