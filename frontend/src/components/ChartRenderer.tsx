interface SummaryProps {
  data: Record<string, Record<string, string | number>>;
}

const StatisticalSummary: React.FC<SummaryProps> = ({ data }) => {
  const features = Object.keys(data);
  const statKeys = Object.keys(data[features[0]] || {}); // e.g. count, mean, std

  return (
    <div className="overflow-auto rounded-lg border border-gray-300 p-4 shadow-md bg-white max-w-6xl mx-auto">
      <h2 className="text-lg font-bold text-amber-500 mb-4">Statistical Summary</h2>
      <div className="overflow-auto border rounded-lg shadow">
        <table className="min-w-full text-sm text-left">
          <thead className="border border-gray-300 bg-amber-200">
            <tr>
              <th className="py-2 px-4 border border-gray-300 text-amber-500 font-semibold">Statistic</th>
              {features.map((feature) => (
                <th key={feature} className="py-2 px-4 border border-gray-300 text-amber-500 font-semibold">{feature}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {statKeys.map((stat) => (
              <tr key={stat} className="">
                <td className="py-2 px-4 text-amber-500 border border-gray-300 bg-amber-200 font-medium">{stat}</td>
                {features.map((feature) => (
                  <td key={feature + stat} className="py-2 px-4 border border-gray-300 text-amber-400 bg-gray-100">
                    {data[feature][stat] !== "" ? data[feature][stat] : "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatisticalSummary;
