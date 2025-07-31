export const fetchStatisticalSummary = async (sessionId: string) => {
  const res = await fetch(`http://localhost:8000/api/statistical-summary?sessionId=${sessionId}`);
  if (!res.ok) throw new Error("Failed to fetch statistical summary");
  const json = await res.json();
  return { type: "table", data: json.summary };
};

export const fetchCorrelationMatrix = async (sessionId: string) => {
  const res = await fetch(`http://localhost:8000/api/correlation-matrix?sessionId=${sessionId}`);
  if (!res.ok) throw new Error("Failed to fetch correlation matrix");
  const json = await res.json();
  return { type: "heatmap", data: json.matrix };
};

export const fetchMissingDataOverview = async (sessionId: string) => {
  const res = await fetch(`http://localhost:8000/api/missing-data-overview?sessionId=${sessionId}`);
  if (!res.ok) throw new Error("Failed to fetch missing data overview");
  const json = await res.json();
  return { type: "missing_data", data: json.overview };
};

export const fetchOutlierDetection = async (sessionId: string) => {
  const res = await fetch(`http://localhost:8000/api/outlier-detection?sessionId=${sessionId}`);
  if (!res.ok) throw new Error("Failed to fetch outlier detection");
  const json = await res.json();
  return { type: "outlier_table", data: json.outliers };
};

// Bar Chart analysis functions
export const fetchBarChartAnalysis = async (sessionId: string, xKey: string, yKey: string) => {
  const res = await fetch(`http://localhost:8000/api/bar-chart?sessionId=${sessionId}&xKey=${xKey}&yKey=${yKey}`);
  if (!res.ok) throw new Error("Failed to fetch bar chart data");
  const json = await res.json();
  return { type: "bar_chart", data: json.data, xKey: json.xKey, yKey: json.yKey };
};

export const createBarChartAnalysis = async (file: File, xKey: string, yKey: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('xKey', xKey);
  formData.append('yKey', yKey);

  const res = await fetch('http://localhost:8000/api/bar-chart', {
    method: 'POST',
    body: formData,
  });
  
  if (!res.ok) throw new Error("Failed to create bar chart");
  const json = await res.json();
  return { type: "bar_chart", data: json.data, xKey: json.xKey, yKey: json.yKey };
};

// Line Graph analysis functions
export const fetchLineGraphAnalysis = async (sessionId: string, xKey: string, yKey: string) => {
  const res = await fetch(`http://localhost:8000/api/line-graph?sessionId=${sessionId}&xKey=${xKey}&yKey=${yKey}`);
  if (!res.ok) throw new Error("Failed to fetch line graph data");
  const json = await res.json();
  return { type: "line_graph", data: json.data, xKey: json.xKey, yKey: json.yKey };
};

export const createLineGraphAnalysis = async (file: File, xKey: string, yKey: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('xKey', xKey);
  formData.append('yKey', yKey);

  const res = await fetch('http://localhost:8000/api/line-graph', {
    method: 'POST',
    body: formData,
  });
  
  if (!res.ok) throw new Error("Failed to create line graph");
  const json = await res.json();
  return { type: "line_graph", data: json.data, xKey: json.xKey, yKey: json.yKey };
};

// Scatter Plot analysis functions
export const fetchScatterPlotAnalysis = async (sessionId: string, xKey: string, yKey: string) => {
  const res = await fetch(`http://localhost:8000/api/scatter-plot?sessionId=${sessionId}&xKey=${xKey}&yKey=${yKey}`);
  if (!res.ok) throw new Error("Failed to fetch scatter plot data");
  const json = await res.json();
  return { type: "scatter_plot", data: json.data, xKey: json.xKey, yKey: json.yKey };
};

export const createScatterPlotAnalysis = async (file: File, xKey: string, yKey: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('xKey', xKey);
  formData.append('yKey', yKey);

  const res = await fetch('http://localhost:8000/api/scatter-plot', {
    method: 'POST',
    body: formData,
  });
  
  if (!res.ok) throw new Error("Failed to create scatter plot");
  const json = await res.json();
  return { type: "scatter_plot", data: json.data, xKey: json.xKey, yKey: json.yKey };
};

// Heatmap analysis functions
export const fetchHeatmapAnalysis = async (sessionId: string, xKey: string, yKey: string, valueKey: string) => {
  const res = await fetch(`http://localhost:8000/api/heatmap?sessionId=${sessionId}&xKey=${xKey}&yKey=${yKey}&valueKey=${valueKey}`);
  if (!res.ok) throw new Error("Failed to fetch heatmap data");
  const json = await res.json();
  return { type: "heatmap", data: json.data, xKey: json.xKey, yKey: json.yKey, valueKey: json.valueKey };
};

export const createHeatmapAnalysis = async (file: File, xKey: string, yKey: string, valueKey: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('xKey', xKey);
  formData.append('yKey', yKey);
  formData.append('valueKey', valueKey);

  const res = await fetch('http://localhost:8000/api/heatmap', {
    method: 'POST',
    body: formData,
  });
  
  if (!res.ok) throw new Error("Failed to create heatmap");
  const json = await res.json();
  return { type: "heatmap", data: json.data, xKey: json.xKey, yKey: json.yKey, valueKey: json.valueKey };
};
