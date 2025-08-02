export const fetchStatisticalSummary = async (sessionId: string) => {
  const res = await fetch(`http://localhost:8000/api/statistical-summary?sessionId=${sessionId}`, {
    method: 'GET',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch statistical summary');
  }

  return await res.json();
};

export const fetchCorrelationMatrix = async (sessionId: string) => {
  const res = await fetch(`http://localhost:8000/api/correlation-matrix?sessionId=${sessionId}`, {
    method: 'GET',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch correlation matrix');
  }

  return await res.json();
};

export const fetchMissingDataOverview = async (sessionId: string) => {
  const res = await fetch(`http://localhost:8000/api/missing-data-overview?sessionId=${sessionId}`, {
    method: 'GET',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch missing data overview');
  }

  return await res.json();
};

export const fetchOutlierDetection = async (sessionId: string) => {
  const res = await fetch(`http://localhost:8000/api/outlier-detection?sessionId=${sessionId}`, {
    method: 'GET',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch outlier detection');
  }

  return await res.json();
};

// Bar Chart API functions
export const fetchBarChart = async (sessionId: string, xKey: string, yKey: string) => {
  const res = await fetch(`http://localhost:8000/api/bar-chart?sessionId=${sessionId}&xKey=${xKey}&yKey=${yKey}`, {
    method: 'GET',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch bar chart data');
  }

  return await res.json();
};

export const createBarChart = async (file: File, xKey: string, yKey: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('xKey', xKey);
  formData.append('yKey', yKey);

  const res = await fetch('http://localhost:8000/api/bar-chart', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Failed to create bar chart');
  }

  return await res.json();
};

export const fetchLineGraph = async (sessionId: string, xKey: string, yKey: string) => {
  const res = await fetch(`http://localhost:8000/api/line-graph?sessionId=${sessionId}&xKey=${xKey}&yKey=${yKey}`, {
    method: 'GET',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch line graph data');
  }

  return await res.json();
};

export const createLineGraph = async (file: File, xKey: string, yKey: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('xKey', xKey);
  formData.append('yKey', yKey);

  const res = await fetch('http://localhost:8000/api/line-graph', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Failed to create line graph');
  }

  return await res.json();
};

export const fetchScatterPlot = async (sessionId: string, xKey: string, yKey: string) => {
  const res = await fetch(`http://localhost:8000/api/scatter-plot?sessionId=${sessionId}&xKey=${xKey}&yKey=${yKey}`, {
    method: 'GET',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch scatter plot data');
  }

  return await res.json();
};

export const createScatterPlot = async (file: File, xKey: string, yKey: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('xKey', xKey);
  formData.append('yKey', yKey);

  const res = await fetch('http://localhost:8000/api/scatter-plot', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Failed to create scatter plot');
  }

  return await res.json();
};

export const fetchHeatmap = async (sessionId: string, xKey: string, yKey: string, valueKey: string) => {
  const res = await fetch(`http://localhost:8000/api/heatmap?sessionId=${sessionId}&xKey=${xKey}&yKey=${yKey}&valueKey=${valueKey}`, {
    method: 'GET',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch heatmap data');
  }

  return await res.json();
};

export const createHeatmap = async (file: File, xKey: string, yKey: string, valueKey: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('xKey', xKey);
  formData.append('yKey', yKey);
  formData.append('valueKey', valueKey);

  const res = await fetch('http://localhost:8000/api/heatmap', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Failed to create heatmap');
  }

  return await res.json();
};
