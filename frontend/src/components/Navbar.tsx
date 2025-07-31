"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

const Navbar = () => {
  const pathname = usePathname();

  const session_id = useSearchParams().get("sessionId");

  const isTrialPage = pathname === "/trial";

  const [drawerOpen, setDrawerOpen] = useState(false);

  const analysisOptions = [
  { label: "Statistical Summary", value: "summary" },
  { label: "Correlation Matrix", value: "correlation" },
  { label: "Missing Data Overview", value: "missing" },
  { label: "Outlier Detection", value: "outliers" },
];

const visualizationOptions = [
  { label: "Bar Chart", value: "bar-chart" },
  { label: "Line Graph", value: "line-graph" },
  { label: "Scatter Plot", value: "scatter-plot" },
  { label: "Heatmap", value: "heatmap" },
];

const getUrlWithParams = (analysisType: string) => {
  const params = new URLSearchParams();
  if (session_id) params.append("sessionId", session_id);
  params.append("selectedAnalysis", analysisType);
  return `/trial?${params.toString()}`;
};

  return (
    <>
      <header className="bg-amber-50 shadow-sm fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {isTrialPage ? (
          <button
              onClick={() => setDrawerOpen(true)}
              className="text-2xl font-bold text-gray-700"
              aria-label="Open menu"
            >
              &#9776;
            </button>
          ) : (
          <Link href="/" className="text-xl font-bold text-amber-600">AnaViz</Link>
          )}
          <nav className="hidden md:flex space-x-6 text-gray-700 font-medium">
            <Link href="/" className="hover:text-amber-600">Home</Link>
            <Link href="/upload" className="hover:text-amber-600">Upload</Link>
            <Link href="#" className="hover:text-amber-600">Trial Space</Link>
            <Link href="#" className="hover:text-amber-600">Contact</Link>
          </nav>
          <a
            href="#"
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-full font-semibold text-sm"
          >
            Sign Up
          </a>
        </div>
      </header>
      {drawerOpen && isTrialPage && (
        <>
          <div
            className="fixed inset-0 backdrop-blur-sm z-40"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Sidebar */}
          <aside className="fixed top-0 left-0 h-full w-72 bg-amber-50 z-50 shadow-lg transition-transform">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300">
              <span className="text-lg font-semibold text-gray-800">Choose Option</span>
              <button onClick={() => setDrawerOpen(false)}>
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            <div className="px-4 py-4 space-y-6 text-gray-800 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Analysis</h3>
                <ul className="space-y-1">
                  {analysisOptions.map((item) => (
                    <li key={item.value}>
                      <Link
                        href={getUrlWithParams(item.value)}
                        onClick={() => setDrawerOpen(false)}
                        className="hover:text-amber-600 block"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Visualizations</h3>
                <ul className="space-y-1">
                  {visualizationOptions.map((item) => (
                    <li key={item.value}>
                      <Link
                        href={getUrlWithParams(item.value)}
                        onClick={() => setDrawerOpen(false)}
                        className="hover:text-amber-600 block"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
};

export default Navbar;
