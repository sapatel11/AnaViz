"use client";
import { useState } from "react";
import Link from "next/link";

const UploadSection = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<string[][] | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    // TODO: Replace with real API call later
    setPreviewData([
      ["Name", "Age", "Country"],
      ["Alice", "30", "USA"],
      ["Bob", "25", "Canada"],
      ["Charlie", "35", "UK"],
    ]);
  };

  return (
    <div className="max-w-3xl mx-auto text-center">
      <label className="block mb-4">
        <input
          type="file"
          accept=".csv, .xlsx"
          onChange={handleFileChange}
          className="block w-full border border-dashed border-amber-400 p-6 text-center text-amber-300 rounded-md cursor-pointer bg-white hover:bg-amber-50"
        />
      </label>

      {fileName && (
        <>
          <p className="text-sm text-amber-600 mb-4">File: {fileName}</p>
          <div className="overflow-auto border rounded-lg shadow-sm">
            <table className="min-w-full bg-white text-sm text-left">
              <thead className="bg-amber-200">
                <tr>
                  {previewData?.[0].map((col, i) => (
                    <th key={i} className="py-2 px-4 text-amber-500 font-semibold ">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData?.slice(1).map((row, i) => (
                  <tr key={i} className="border-t">
                    {row.map((cell, j) => (
                      <td key={j} className="py-2 px-4 text-amber-300">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {previewData && (
        <div className="mt-6">
            <Link
            href="/trial"
            className="inline-block bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-full font-semibold transition"
            >
            Try in Trial Space
            </Link>
        </div>
        )}
    </div>
  );
};

export default UploadSection;
