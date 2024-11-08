import { React, useEffect, useState } from 'react';
import CanvasJSReact from '@canvasjs/react-charts';
import { useDashboard } from './DashboardContext';

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const Chart2 = () => {
  const { fetchDashboard, tableData } = useDashboard();
  const [chartData, setChartData] = useState([]); // To store the dynamic data for the chart

  // Fetch the dashboard data on component mount
  useEffect(() => {
    console.log("Fetching dashboard data...");
    fetchDashboard();
  }, [fetchDashboard]);

  // Process the data whenever `tableData` changes
  useEffect(() => {
    if (tableData && tableData.clientApplications) {
      console.log("Found clientApplications data:", tableData.clientApplications);

      // Combine all applications into a single wave
      const dataPoints = Object.values(tableData.clientApplications).flatMap((statusData) =>
        statusData.applications.map((app) => ({
          x: new Date(app.created_at), // Date on X-axis
          y: app.applicationCount, // Application count for Y-axis
        }))
      );

      console.log("Transformed Data Points for Chart:", dataPoints);
      setChartData([
        {
          type: "splineArea", // Wave style
          showInLegend: true,
          legendText: "Applications",
          dataPoints,
          color: "#2196F3", // Color for the wave
          name: "Applications",
        },
      ]);
    } else {
      console.log("No clientApplications found in tableData");
    }
  }, [tableData]); // Only rerun this effect if `tableData` changes

  // Chart options with enhanced visuals
  const options = {
    animationEnabled: true,
    title: {
      text: "Client Applications Over Time", // Chart title
      fontSize: 20,
      fontColor: "#333",
    },
    axisX: {
      title: "Date", // X-axis title
      valueFormatString: "DD MMM YYYY", // Date format for X-axis
      labelAngle: -45, // Tilt labels for better readability
    },
    axisY: {
      title: "Application Count", // Y-axis title
      includeZero: true, // Start Y-axis from 0
      gridThickness: 1, // Make grid lines visible
      labelFormatter: function (e) {
        return e.value.toLocaleString(); // Format Y-axis values with commas
      },
    },
    toolTip: {
      shared: true, // Show shared tooltip when hovering over multiple series
      content: "Applications: {y} on {x}", // Custom tooltip format
    },
    data: chartData, // Use the single wave data here
    legend: {
      verticalAlign: "top",
      horizontalAlign: "center",
    },
    backgroundColor: "#f4f4f9", // Light background color for the chart
    subTitle: {
      text: "Total applications created over time",
      fontSize: 14,
      fontColor: "#666",
    },
  };

  return (
    <div className="chart-container flex items-center justify-center h-full rounded-md p-5">
      <CanvasJSChart options={options} />
    </div>
  );
};

export default Chart2;

