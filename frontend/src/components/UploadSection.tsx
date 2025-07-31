"use client";
import { useState } from "react";
import Link from "next/link";

const UploadSection = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<string[][] | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

  const file = e.target.files?.[0];
  if (!file) return;

  setFileName(file.name);

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("http://localhost:8000/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const result = await response.json();
    setPreviewData(result.preview);
    setFileName(result.filename); // server returns: { filename, preview }
    setSessionId(result.session_id);
  } catch (err) {
    console.error("Error uploading file:", err);
  }
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
      {previewData && sessionId && (
        <div className="mt-6">
            <Link
            href={`/trial?sessionId=${sessionId}`}
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
