"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import StatisticalSummary from "@/components/ChartRenderer";
import CorrelationMatrix from "@/components/CorrelationMatrix";
import MissingDataOverview from "@/components/MissingDataOverview";
import OutlierTable from "@/components/OutlierDetection";
import BarChartComponent from "@/components/BarChart";
import LineGraphComponent from "@/components/LineGraph";
import ScatterPlotComponent from "@/components/ScatterPlot";
import HeatmapComponent from "@/components/Heatmap";
import Link from "next/link";

type StatisticalSummaryData = Record<string, Record<string, string | number>>;
type VisualizationData = { [key: string]: string | number }[];
type AnalysisResult = {
  type: 'table' | 'correlation_heatmap' | 'missing_data' | 'outlier_table' | 'bar_chart' | 'line_graph' | 'scatter_plot' | 'custom_heatmap';
  data: StatisticalSummaryData | VisualizationData;
  xKey?: string;
  yKey?: string;
  valueKey?: string;
  title: string;
};

// Analysis and visualization options with titles (moved outside component to prevent re-creation)
const analysisOptions = [
  { label: "Statistical Summary", value: "summary", title: "Statistical Summary" },
  { label: "Correlation Matrix", value: "correlation", title: "Correlation Matrix" },
  { label: "Missing Data Overview", value: "missing", title: "Missing Data Overview" },
  { label: "Outlier Detection", value: "outliers", title: "Outlier Detection" },
];

const visualizationOptions = [
  { label: "Bar Chart", value: "bar-chart", title: "Bar Chart" },
  { label: "Line Graph", value: "line-graph", title: "Line Graph" },
  { label: "Scatter Plot", value: "scatter-plot", title: "Scatter Plot" },
  { label: "Heatmap", value: "heatmap", title: "Heatmap" },
];

// Helper functions to process full data locally
const processStatisticalSummary = (data: string[][]): StatisticalSummaryData => {
  const headers = data[0];
  const rows = data.slice(1);
  
  const result: StatisticalSummaryData = {};
  
  headers.forEach((header, colIndex) => {
    const columnData = rows.map(row => row[colIndex]).filter(val => val !== null && val !== undefined && val !== '');
    const numericData = columnData.map(val => parseFloat(val as string)).filter(val => !isNaN(val));
    
    result[header] = {
      count: columnData.length,
      unique: new Set(columnData).size,
      ...(numericData.length > 0 && {
        mean: numericData.reduce((a, b) => a + b, 0) / numericData.length,
        std: Math.sqrt(numericData.reduce((a, b) => a + Math.pow(b - (numericData.reduce((x, y) => x + y, 0) / numericData.length), 2), 0) / numericData.length),
        min: Math.min(...numericData),
        max: Math.max(...numericData),
      })
    };
  });
  
  return result;
};

const processCorrelationMatrix = (data: string[][]): StatisticalSummaryData => {
  const headers = data[0];
  const rows = data.slice(1);
  
  // Get only numeric columns
  const numericColumns: number[] = [];
  const numericHeaders: string[] = [];
  
  headers.forEach((header, colIndex) => {
    const columnData = rows.map(row => parseFloat(row[colIndex])).filter(val => !isNaN(val));
    if (columnData.length > rows.length * 0.5) { // At least 50% numeric values
      numericColumns.push(colIndex);
      numericHeaders.push(header);
    }
  });
  
  const result: StatisticalSummaryData = {};
  
  numericHeaders.forEach((header1, i) => {
    result[header1] = {};
    numericHeaders.forEach((header2, j) => {
      const col1Data = rows.map(row => parseFloat(row[numericColumns[i]])).filter(val => !isNaN(val));
      const col2Data = rows.map(row => parseFloat(row[numericColumns[j]])).filter(val => !isNaN(val));
      
      // Calculate correlation coefficient
      const n = Math.min(col1Data.length, col2Data.length);
      if (n < 2) {
        result[header1][header2] = 0;
        return;
      }
      
      const mean1 = col1Data.reduce((a, b) => a + b, 0) / col1Data.length;
      const mean2 = col2Data.reduce((a, b) => a + b, 0) / col2Data.length;
      
      const numerator = col1Data.reduce((sum, val, idx) => sum + (val - mean1) * (col2Data[idx] - mean2), 0);
      const denominator = Math.sqrt(
        col1Data.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) *
        col2Data.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0)
      );
      
      result[header1][header2] = denominator === 0 ? 0 : Math.round((numerator / denominator) * 100) / 100;
    });
  });
  
  return result;
};

const processMissingData = (data: string[][]): StatisticalSummaryData => {
  const headers = data[0];
  const rows = data.slice(1);
  const totalRows = rows.length;
  
  const result: StatisticalSummaryData = {};
  
  headers.forEach((header, colIndex) => {
    const missingCount = rows.filter(row => !row[colIndex] || row[colIndex] === '' || row[colIndex] === null || row[colIndex] === undefined).length;
    const percentage = totalRows > 0 ? Math.round((missingCount / totalRows) * 100 * 100) / 100 : 0;
    
    result[header] = {
      "Missing Values": missingCount,
      "Percentage": percentage
    };
  });
  
  return result;
};

const processOutlierDetection = (data: string[][]): StatisticalSummaryData => {
  const headers = data[0];
  const rows = data.slice(1);
  
  const result: StatisticalSummaryData = {};
  
  headers.forEach((header, colIndex) => {
    const numericData = rows.map(row => parseFloat(row[colIndex])).filter(val => !isNaN(val));
    
    if (numericData.length < 4) {
      result[header] = { "Outlier Count": 0 };
      return;
    }
    
    numericData.sort((a, b) => a - b);
    const q1 = numericData[Math.floor(numericData.length * 0.25)];
    const q3 = numericData[Math.floor(numericData.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    const outlierCount = numericData.filter(val => val < lowerBound || val > upperBound).length;
    result[header] = { "Outlier Count": outlierCount };
  });
  
  return result;
};

const processVisualizationData = (data: string[][], xKey: string, yKey: string, valueKey?: string): VisualizationData => {
  const headers = data[0];
  const rows = data.slice(1);
  
  const xIndex = headers.indexOf(xKey);
  const yIndex = headers.indexOf(yKey);
  const valueIndex = valueKey ? headers.indexOf(valueKey) : -1;
  
  if (xIndex === -1 || yIndex === -1) return [];
  
  return rows.map(row => {
    const result: { [key: string]: string | number } = {
      [xKey]: row[xIndex],
      [yKey]: isNaN(parseFloat(row[yIndex])) ? row[yIndex] : parseFloat(row[yIndex])
    };
    
    if (valueKey && valueIndex !== -1) {
      result[valueKey] = isNaN(parseFloat(row[valueIndex])) ? row[valueIndex] : parseFloat(row[valueIndex]);
    }
    
    return result;
  }).filter(item => item[xKey] && item[yKey]); // Filter out rows with missing data
};

const FullAnalysisPage = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const selectedAnalysis = useMemo(() => searchParams.get("analysis")?.split(',') || [], [searchParams]);
  const selectedVisualizations = useMemo(() => searchParams.get("visualizations")?.split(',') || [], [searchParams]);
  
  const [fullData, setFullData] = useState<string[][] | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Column selection state for each visualization type
  const [columnSelections, setColumnSelections] = useState<{
    [key: string]: {
      xKey: string;
      yKey: string;
      valueKey?: string;
    };
  }>({});

  // Fetch full dataset
  useEffect(() => {
    if (!sessionId) return;

    const fetchFullData = async () => {
      try {
        const res = await fetch(`http://localhost:8000/full-data?sessionId=${sessionId}`);
        const result = await res.json();
        setFullData(result.data);
      } catch (err) {
        console.error("Error fetching full data:", err);
        setError("Failed to load full dataset");
      }
    };

    fetchFullData();
  }, [sessionId]);

  // Process selected analysis and visualizations locally
  useEffect(() => {
    if (!sessionId || (!selectedAnalysis.length && !selectedVisualizations.length) || !fullData) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const processAllAnalysis = async () => {
      if (!isMounted) return;
      
      setLoading(true);
      const results: AnalysisResult[] = [];

      try {
        // Process analysis results locally
        for (const analysisType of selectedAnalysis) {
          if (!isMounted) break;
          
          const option = analysisOptions.find(opt => opt.value === analysisType);
          if (!option) continue;

          if (analysisType === "summary") {
            const data = processStatisticalSummary(fullData);
            if (isMounted) {
              results.push({
                type: "table",
                data: data,
                title: option.title,
              });
            }
          } else if (analysisType === "correlation") {
            const data = processCorrelationMatrix(fullData);
            if (isMounted) {
              results.push({
                type: "correlation_heatmap",
                data: data,
                title: option.title,
              });
            }
          } else if (analysisType === "missing") {
            const data = processMissingData(fullData);
            if (isMounted) {
              results.push({
                type: "missing_data",
                data: data,
                title: option.title,
              });
            }
          } else if (analysisType === "outliers") {
            const data = processOutlierDetection(fullData);
            if (isMounted) {
              results.push({
                type: "outlier_table",
                data: data,
                title: option.title,
              });
            }
          }
        }

        // Process visualization results locally
        if (fullData && fullData[0] && isMounted) {
          const columns = fullData[0];
          const defaultXKey = columns[0] || "";
          const defaultYKey = columns[1] || "";
          const defaultValueKey = columns[2] || "";

          for (const visualizationType of selectedVisualizations) {
            if (!isMounted) break;
            
            const option = visualizationOptions.find(opt => opt.value === visualizationType);
            if (!option) continue;

            // Initialize default column selections if not already set
            if (!columnSelections[visualizationType]) {
              const defaultSelection = {
                xKey: defaultXKey,
                yKey: defaultYKey,
                ...(visualizationType === "heatmap" && { valueKey: defaultValueKey })
              };
              setColumnSelections(prev => ({
                ...prev,
                [visualizationType]: defaultSelection
              }));
            }

            const currentSelection = columnSelections[visualizationType] || {
              xKey: defaultXKey,
              yKey: defaultYKey,
              ...(visualizationType === "heatmap" && { valueKey: defaultValueKey })
            };

            if (visualizationType === "bar-chart") {
              const data = processVisualizationData(fullData, currentSelection.xKey, currentSelection.yKey);
              if (isMounted) {
                results.push({
                  type: "bar_chart",
                  data: data,
                  xKey: currentSelection.xKey,
                  yKey: currentSelection.yKey,
                  title: option.title,
                });
              }
            } else if (visualizationType === "line-graph") {
              const data = processVisualizationData(fullData, currentSelection.xKey, currentSelection.yKey);
              if (isMounted) {
                results.push({
                  type: "line_graph",
                  data: data,
                  xKey: currentSelection.xKey,
                  yKey: currentSelection.yKey,
                  title: option.title,
                });
              }
            } else if (visualizationType === "scatter-plot") {
              const data = processVisualizationData(fullData, currentSelection.xKey, currentSelection.yKey);
              if (isMounted) {
                results.push({
                  type: "scatter_plot",
                  data: data,
                  xKey: currentSelection.xKey,
                  yKey: currentSelection.yKey,
                  title: option.title,
                });
              }
            } else if (visualizationType === "heatmap") {
              const data = processVisualizationData(fullData, currentSelection.xKey, currentSelection.yKey, currentSelection.valueKey);
              if (isMounted) {
                results.push({
                  type: "custom_heatmap",
                  data: data,
                  xKey: currentSelection.xKey,
                  yKey: currentSelection.yKey,
                  valueKey: currentSelection.valueKey,
                  title: option.title,
                });
              }
            }
          }
        }

        if (isMounted) {
          setAnalysisResults(results);
        }
      } catch (err) {
        console.error("Error processing analysis results:", err);
        if (isMounted) {
          setError("Failed to process analysis results");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    processAllAnalysis();

    return () => {
      isMounted = false;
    };
  }, [sessionId, selectedAnalysis, selectedVisualizations, fullData]);

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-red-500 mb-6">{error}</p>
          <Link
            href={`/trial?sessionId=${sessionId}`}
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Back to Trial Space
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-amber-700 mb-2">
                Full Dataset Analysis
              </h1>
              <p className="text-amber-600">
                Complete analysis and visualizations for your entire dataset
              </p>
            </div>
            <Link
              href={`/trial?sessionId=${sessionId}`}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Back to Trial Space
            </Link>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedAnalysis.map(analysis => {
              const option = analysisOptions.find(opt => opt.value === analysis);
              return option ? (
                <span key={analysis} className="bg-amber-200 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                  {option.label}
                </span>
              ) : null;
            })}
            {selectedVisualizations.map(viz => {
              const option = visualizationOptions.find(opt => opt.value === viz);
              return option ? (
                <span key={viz} className="bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  {option.label}
                </span>
              ) : null;
            })}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="max-w-6xl mx-auto py-20 px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-amber-600">Processing your full dataset analysis...</p>
        </div>
      )}

      {/* Analysis Results */}
      {!loading && analysisResults.length > 0 && (
        <div className="max-w-6xl mx-auto py-10 px-4 space-y-12">
          {analysisResults.map((result, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg border border-amber-200 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-100 to-orange-100 px-6 py-4 border-b border-amber-200">
                <h2 className="text-xl font-bold text-amber-700">{result.title}</h2>
              </div>
              
              <div className="p-6">
                {result.type === "table" && (
                  <StatisticalSummary data={result.data as StatisticalSummaryData} />
                )}

                {result.type === "correlation_heatmap" && (
                  <CorrelationMatrix data={result.data as StatisticalSummaryData} />
                )}

                {result.type === "missing_data" && (
                  <MissingDataOverview data={result.data as StatisticalSummaryData} />
                )}

                {result.type === "outlier_table" && (
                  <OutlierTable data={result.data as StatisticalSummaryData} />
                )}

                {(result.type === "bar_chart" || result.type === "line_graph" || result.type === "scatter_plot" || result.type === "custom_heatmap") && fullData && (
                  <div className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-amber-700 mb-3">
                          X-Axis Column
                        </label>
                        <select
                          value={columnSelections[result.type]?.xKey || result.xKey || ""}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setColumnSelections(prev => ({
                              ...prev,
                              [result.type]: {
                                ...prev[result.type],
                                xKey: newValue
                              }
                            }));
                          }}
                          className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-amber-800 font-medium transition-colors hover:border-amber-300"
                        >
                          <option value="" className="text-amber-600">Select X column</option>
                          {fullData[0].map((col, i) => (
                            <option key={i} value={col} className="text-amber-800">{col}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-amber-700 mb-3">
                          Y-Axis Column
                        </label>
                        <select
                          value={columnSelections[result.type]?.yKey || result.yKey || ""}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setColumnSelections(prev => ({
                              ...prev,
                              [result.type]: {
                                ...prev[result.type],
                                yKey: newValue
                              }
                            }));
                          }}
                          className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-amber-800 font-medium transition-colors hover:border-amber-300"
                        >
                          <option value="" className="text-amber-600">Select Y column</option>
                          {fullData[0].map((col, i) => (
                            <option key={i} value={col} className="text-amber-800">{col}</option>
                          ))}
                        </select>
                      </div>

                      {result.type === "custom_heatmap" && (
                        <div>
                          <label className="block text-sm font-semibold text-amber-700 mb-3">
                            Value Column
                          </label>
                          <select
                            value={columnSelections[result.type]?.valueKey || result.valueKey || ""}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              setColumnSelections(prev => ({
                                ...prev,
                                [result.type]: {
                                  ...prev[result.type],
                                  valueKey: newValue
                                }
                              }));
                            }}
                            className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-amber-800 font-medium transition-colors hover:border-amber-300"
                          >
                            <option value="" className="text-amber-600">Select value column</option>
                            {fullData[0].map((col, i) => (
                              <option key={i} value={col} className="text-amber-800">{col}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => {
                          // Re-process the visualization with new column selections
                          const updatedResults = analysisResults.map(r => {
                            if (r.type === result.type) {
                              const selection = columnSelections[result.type];
                              const data = processVisualizationData(
                                fullData!,
                                selection?.xKey || r.xKey!,
                                selection?.yKey || r.yKey!,
                                result.type === "custom_heatmap" ? (selection?.valueKey || r.valueKey!) : undefined
                              );
                              return {
                                ...r,
                                data,
                                xKey: selection?.xKey || r.xKey!,
                                yKey: selection?.yKey || r.yKey!,
                                ...(result.type === "custom_heatmap" && { valueKey: selection?.valueKey || r.valueKey! })
                              };
                            }
                            return r;
                          });
                          setAnalysisResults(updatedResults);
                        }}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold transition hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Update Visualization
                      </button>
                    </div>
                  </div>
                )}

                {result.type === "bar_chart" && (columnSelections[result.type]?.xKey || result.xKey) && (columnSelections[result.type]?.yKey || result.yKey) && (
                  <BarChartComponent 
                    data={result.data as VisualizationData} 
                    xKey={columnSelections[result.type]?.xKey || result.xKey!} 
                    yKey={columnSelections[result.type]?.yKey || result.yKey!} 
                  />
                )}

                {result.type === "line_graph" && (columnSelections[result.type]?.xKey || result.xKey) && (columnSelections[result.type]?.yKey || result.yKey) && (
                  <LineGraphComponent 
                    data={result.data as VisualizationData} 
                    xKey={columnSelections[result.type]?.xKey || result.xKey!} 
                    yKey={columnSelections[result.type]?.yKey || result.yKey!} 
                  />
                )}

                {result.type === "scatter_plot" && (columnSelections[result.type]?.xKey || result.xKey) && (columnSelections[result.type]?.yKey || result.yKey) && (
                  <ScatterPlotComponent 
                    data={result.data as VisualizationData} 
                    xKey={columnSelections[result.type]?.xKey || result.xKey!} 
                    yKey={columnSelections[result.type]?.yKey || result.yKey!} 
                  />
                )}

                {result.type === "custom_heatmap" && (columnSelections[result.type]?.xKey || result.xKey) && (columnSelections[result.type]?.yKey || result.yKey) && (columnSelections[result.type]?.valueKey || result.valueKey) && (
                  <HeatmapComponent 
                    data={result.data as VisualizationData} 
                    xKey={columnSelections[result.type]?.xKey || result.xKey!} 
                    yKey={columnSelections[result.type]?.yKey || result.yKey!} 
                    valueKey={columnSelections[result.type]?.valueKey || result.valueKey!} 
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && analysisResults.length === 0 && (
        <div className="max-w-6xl mx-auto py-20 px-4 text-center">
          <h2 className="text-xl font-semibold text-amber-700 mb-4">No Analysis Selected</h2>
          <p className="text-amber-600 mb-6">Please go back to the trial space and select some analysis options.</p>
          <Link
            href={`/trial?sessionId=${sessionId}`}
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Back to Trial Space
          </Link>
        </div>
      )}
    </div>
  );
};

export default FullAnalysisPage;