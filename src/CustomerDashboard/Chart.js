import {React,useEffect} from 'react';
import CanvasJSReact from '@canvasjs/react-charts';
import { useDashboard } from './DashboardContext';

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const Chart = () => {

    const {fetchDashboard, tableData, setTableData ,loading,setLoading} = useDashboard();
    useEffect(()=>{
        fetchDashboard();
    },[fetchDashboard]);

    const options = {
        theme: "light",
        animationEnabled: true,
        exportFileName: "New Year Resolutions",
        exportEnabled: true,
        title: {
            text: "New Year Resolutions",
            fontSize: 24,
            padding: {
                top: 10,
                bottom: 10
            }
        },
        data: [{
            type: "pie",
            showInLegend: true,
            legendText: "{label}",
            toolTipContent: "{label}: <strong>{y}%</strong>",
            indexLabel: "{y}%",
            indexLabelPlacement: "inside",
            indexLabelFontColor: "#fff",
            indexLabelFontSize: 16,
            dataPoints: [
                { y: 10, label: "Insufficiancy", color: "#FF6384" },
                { y: 12, label: "Completed", color: "#36A2EB" },
                { y: 18, label: "WIP", color: "#FFCE56" },
                { y: 10, label: "Completed Green", color: "#4BC0C0" },
                { y: 5, label: "Completed Red", color: "#FF6384" },
                { y: 7, label: "Completed Yellow", color: "#FFCE56" },
                { y: 7, label: "Completed Pink", color: "#FF9F40" },
                { y: 7, label: "Completed Orange", color: "#FFCD56" },
                { y: 7, label: "Reports In Tat", color: "#4BC0C0" },
                { y: 7, label: "Reports Out of Tat", color: "#9966FF" },
                { y: 12, label: "Case Received", color: "#FF6384" },
            ]
        }]
    };

    return (
        <div style={{ padding: '20px' }}>
            <CanvasJSChart options={options} />
        </div>
    );
};

export default Chart;
