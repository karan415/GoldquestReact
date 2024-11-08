import { React, useEffect, useState } from 'react';
import CanvasJSReact from '@canvasjs/react-charts';
import { useDashboard } from './DashboardContext';

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const Chart2 = () => {
  const { fetchDashboard, tableData } = useDashboard();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    console.log("Fetching dashboard data...");
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (tableData && tableData.clientApplications) {
      console.log("Found clientApplications data:", tableData.clientApplications);

      const dateMap = {};

      // Aggregate by day
      Object.values(tableData.clientApplications).forEach((statusData) => {
        statusData.applications.forEach((app) => {
          // Parse date, check for validity
          const date = new Date(app.created_at);
          if (isNaN(date.getTime())) {
            console.error("Invalid date encountered:", app.created_at);
            return; // Skip invalid dates
          }

          // Extract just the date part to group by day
          const day = date.toISOString().split('T')[0];

          if (!dateMap[day]) {
            dateMap[day] = 0;
          }
          dateMap[day] += 1; // Increment count for each application on that day
        });
      });

      // Transform dateMap into dataPoints array
      const dataPoints = Object.entries(dateMap).map(([day, count]) => {
        const parsedDate = new Date(day);
        console.log("Parsed Date:", parsedDate, "Count:", count);
        return {
          x: parsedDate,
          y: count,
        };
      });

      console.log("Transformed Data Points for Chart:", dataPoints);
      setChartData([
        {
          type: "splineArea",
          showInLegend: true,
          legendText: "Applications",
          dataPoints,
          color: "#2196F3",
          name: "Applications",
        },
      ]);
    } else {
      console.log("No clientApplications found in tableData");
    }
  }, [tableData]);

  const options = {
    animationEnabled: true,
    title: {
      text: "Client Applications Over Time",
      fontSize: 20,
      fontColor: "#333",
    },
    axisX: {
      title: "Date",
      valueFormatString: "DD MMM YYYY",
      labelAngle: -45,
    },
    axisY: {
      title: "Application Count",
      includeZero: true,
      gridThickness: 1,
      labelFormatter: function (e) {
        return e.value.toLocaleString();
      },
    },
    toolTip: {
      shared: true,
      content: "Applications: {y} on {x}",
    },
    data: chartData,
    legend: {
      verticalAlign: "top",
      horizontalAlign: "center",
    },
    backgroundColor: "#f4f4f9",
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
