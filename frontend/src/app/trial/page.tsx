"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchStatisticalSummary } from "@/lib/api";
import StatisticalSummary from "@/components/ChartRenderer";
import CorrelationMatrix from "@/components/CorrelationMatrix";
import MissingDataOverview from "@/components/MissingDataOverview";
import OutlierTable from "@/components/OutlierDetection";
import { fetchCorrelationMatrix } from "@/lib/api";
import { fetchMissingDataOverview } from "@/lib/api";
import { fetchOutlierDetection } from "@/lib/api";
import { fetchBarChart, fetchLineGraph, fetchScatterPlot, fetchHeatmap } from "@/lib/api";
import BarChartComponent from "@/components/BarChart";
import LineGraphComponent from "@/components/LineGraph";
import ScatterPlotComponent from "@/components/ScatterPlot";
import HeatmapComponent from "@/components/Heatmap";

type StatisticalSummaryData = Record<string, Record<string, string | number>>;
type VisualizationData = { [key: string]: string | number }[];
type AnalysisResult = {
  type: 'table' | 'heatmap' | 'missing_data' | 'outlier_table' | 'bar_chart' | 'line_graph' | 'scatter_plot' | 'heatmap';
  data: StatisticalSummaryData | VisualizationData;
  xKey?: string;
  yKey?: string;
  valueKey?: string;
};

const TrialPage = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const selectedAnalysis = searchParams.get("selectedAnalysis");
  const xKeyFromUrl = searchParams.get("xKey");
  const yKeyFromUrl = searchParams.get("yKey");
  const valueKeyFromUrl = searchParams.get("valueKey");
  
  const [previewData, setPreviewData] = useState<string[][] | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedXKey, setSelectedXKey] = useState<string>("");
  const [selectedYKey, setSelectedYKey] = useState<string>("");
  const [selectedValueKey, setSelectedValueKey] = useState<string>("");


  // Fetch preview data
  useEffect(() => {
    if (!sessionId) return;

    const fetchData = async () => {
      const res = await fetch(`http://localhost:8000/trial?sessionId=${sessionId}`);
      const result = await res.json();
      setPreviewData(result.preview);
      
             // Set column selections from URL or defaults
       if (result.preview && result.preview[0]) {
         const columns = result.preview[0];
         if (xKeyFromUrl && columns.includes(xKeyFromUrl)) {
           setSelectedXKey(xKeyFromUrl);
         } else if (columns.length >= 1) {
           setSelectedXKey(columns[0]);
         }
         
         if (yKeyFromUrl && columns.includes(yKeyFromUrl)) {
           setSelectedYKey(yKeyFromUrl);
         } else if (columns.length >= 2) {
           setSelectedYKey(columns[1]);
         }
         
         if (valueKeyFromUrl && columns.includes(valueKeyFromUrl)) {
           setSelectedValueKey(valueKeyFromUrl);
         } else if (columns.length >= 3) {
           setSelectedValueKey(columns[2]);
         }
       }
    };

    fetchData();
  }, [sessionId]);

  // Fetch analysis result
  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!sessionId || !selectedAnalysis) return;

      if (selectedAnalysis === "summary") {
        const result = await fetchStatisticalSummary(sessionId);
        setAnalysisResult({
          type: "table",
          data: result.summary,
        });
      } else if (selectedAnalysis === "correlation") {
        const result = await fetchCorrelationMatrix(sessionId);
        setAnalysisResult({
          type: "heatmap",
          data: result.data,
        });
      } else if (selectedAnalysis === "missing") {
        const result = await fetchMissingDataOverview(sessionId);
        setAnalysisResult({
          type: "missing_data",
          data: result.data,
        });
      } else if (selectedAnalysis === "outliers") {
        const result = await fetchOutlierDetection(sessionId);
        setAnalysisResult({
          type: "outlier_table",
          data: result.data,
        });
      } else if (selectedAnalysis === "bar-chart" && selectedXKey && selectedYKey) {
        const result = await fetchBarChart(sessionId, selectedXKey, selectedYKey);
        setAnalysisResult({
          type: "bar_chart",
          data: result.data,
          xKey: result.xKey,
          yKey: result.yKey,
        });
      } else if (selectedAnalysis === "line-graph" && selectedXKey && selectedYKey) {
        const result = await fetchLineGraph(sessionId, selectedXKey, selectedYKey);
        setAnalysisResult({
          type: "line_graph",
          data: result.data,
          xKey: result.xKey,
          yKey: result.yKey,
        });
      } else if (selectedAnalysis === "scatter-plot" && selectedXKey && selectedYKey) {
        const result = await fetchScatterPlot(sessionId, selectedXKey, selectedYKey);
        setAnalysisResult({
          type: "scatter_plot",
          data: result.data,
          xKey: result.xKey,
          yKey: result.yKey,
        });
      } else if (selectedAnalysis === "heatmap" && selectedXKey && selectedYKey && selectedValueKey) {
        const result = await fetchHeatmap(sessionId, selectedXKey, selectedYKey, selectedValueKey);
        setAnalysisResult({
          type: "heatmap",
          data: result.data,
          xKey: result.xKey,
          yKey: result.yKey,
          valueKey: result.valueKey,
        });
      }
    };

    fetchAnalysis();
  }, [selectedAnalysis, sessionId, selectedXKey, selectedYKey, selectedValueKey]);

  const isVisualization = selectedAnalysis && ['bar-chart', 'line-graph', 'scatter-plot', 'heatmap'].includes(selectedAnalysis);
  const isHeatmap = selectedAnalysis === 'heatmap';

  return (
    <div className="min-h-screen pt-20">

      {/* Column Selector */}
      {isVisualization && previewData && (
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Select Columns for {selectedAnalysis?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  X-Axis Column
                </label>
                <select
                  value={selectedXKey}
                  onChange={(e) => setSelectedXKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Select X column</option>
                  {previewData[0].map((col, i) => (
                    <option key={i} value={col}>{col}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Y-Axis Column
                </label>
                <select
                  value={selectedYKey}
                  onChange={(e) => setSelectedYKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Select Y column</option>
                  {previewData[0].map((col, i) => (
                    <option key={i} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              {isHeatmap && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Value Column
                  </label>
                  <select
                    value={selectedValueKey}
                    onChange={(e) => setSelectedValueKey(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select value column</option>
                    {previewData[0].map((col, i) => (
                      <option key={i} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {isVisualization && !selectedXKey && !selectedYKey && (
                  <p className="text-amber-600">Please select X and Y columns to generate the visualization.</p>
                )}
                {isHeatmap && !selectedValueKey && (
                  <p className="text-amber-600">Please select a value column for the heatmap.</p>
                )}
              </div>
              
              <button
                onClick={() => {
                  // Trigger the analysis fetch by updating the URL with the selected columns
                  const url = new URL(window.location.href);
                  url.searchParams.set('xKey', selectedXKey);
                  url.searchParams.set('yKey', selectedYKey);
                  if (isHeatmap) {
                    url.searchParams.set('valueKey', selectedValueKey);
                  }
                  window.location.href = url.toString();
                }}
                disabled={!selectedXKey || !selectedYKey || (isHeatmap && !selectedValueKey)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  (!selectedXKey || !selectedYKey || (isHeatmap && !selectedValueKey))
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-amber-500 text-white hover:bg-amber-600'
                }`}
              >
                Generate Chart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Table */}
      <div className="max-w-5xl mx-auto py-10 px-4">
        {previewData ? (
          <div className="overflow-auto border rounded-lg shadow-sm">
            <table className="min-w-full bg-white text-sm text-left">
              <thead className="border border-gray-300 bg-amber-200">
                <tr>
                  {previewData[0].map((col, i) => (
                    <th key={i} className="py-2 px-4 border border-gray-300 text-amber-500 font-semibold">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.slice(1).map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} className="py-2 px-4 border border-gray-300 bg-gray-100 text-amber-400">{cell}</td>
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

      {analysisResult && (
        <div className="max-w-5xl mx-auto py-10 px-4">
          {analysisResult.type === "table" && (
            <StatisticalSummary data={analysisResult.data as StatisticalSummaryData} />
          )}

          {analysisResult.type === "heatmap" && (
            <CorrelationMatrix data={analysisResult.data as StatisticalSummaryData} />
          )}

          {analysisResult.type === "missing_data" && (
            <MissingDataOverview data={analysisResult.data as StatisticalSummaryData} />
          )}

          {analysisResult.type === "outlier_table" && (
            <OutlierTable data={analysisResult.data as StatisticalSummaryData} />
          )}

          {analysisResult.type === "bar_chart" && analysisResult.xKey && analysisResult.yKey && (
            <BarChartComponent 
              data={analysisResult.data as VisualizationData} 
              xKey={analysisResult.xKey} 
              yKey={analysisResult.yKey} 
            />
          )}

          {analysisResult.type === "line_graph" && analysisResult.xKey && analysisResult.yKey && (
            <LineGraphComponent 
              data={analysisResult.data as VisualizationData} 
              xKey={analysisResult.xKey} 
              yKey={analysisResult.yKey} 
            />
          )}

          {analysisResult.type === "scatter_plot" && analysisResult.xKey && analysisResult.yKey && (
            <ScatterPlotComponent 
              data={analysisResult.data as VisualizationData} 
              xKey={analysisResult.xKey} 
              yKey={analysisResult.yKey} 
            />
          )}

          {analysisResult.type === "heatmap" && analysisResult.xKey && analysisResult.yKey && analysisResult.valueKey && (
            <HeatmapComponent 
              data={analysisResult.data as VisualizationData} 
              xKey={analysisResult.xKey} 
              yKey={analysisResult.yKey} 
              valueKey={analysisResult.valueKey} 
            />
          )}
        </div>
      )}
    </div>
  );
};

export default TrialPage;
