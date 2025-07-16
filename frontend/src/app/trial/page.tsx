"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const TrialPage = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [previewData, setPreviewData] = useState<string[][] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found.");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:8000/trial/${sessionId}`);
        if (!res.ok) throw new Error("Session expired or invalid.");

        const result = await res.json();
        setPreviewData(result.preview);
      } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unknown error occurred.");
        }
        }
    };

    fetchData();
  }, [sessionId]);

  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto py-20 px-4">
      <h1 className="text-3xl font-bold text-center mb-6">Trial Space</h1>

      {previewData ? (
        <div className="overflow-auto border rounded-lg shadow">
          <table className="min-w-full bg-white text-sm text-left">
            <thead className="bg-amber-100">
              <tr>
                {previewData[0].map((col, i) => (
                  <th key={i} className="py-2 px-4 font-semibold">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.slice(1).map((row, i) => (
                <tr key={i} className="border-t">
                  {row.map((cell, j) => (
                    <td key={j} className="py-2 px-4">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500">Loading preview...</p>
      )}
    </div>
  );
};

export default TrialPage;
