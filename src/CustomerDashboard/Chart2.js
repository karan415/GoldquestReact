import {React,useEffect} from 'react';
import CanvasJSReact from '@canvasjs/react-charts';
import { useDashboard } from './DashboardContext';

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const Chart2 = () => {

    const {fetchDashboard, tableData, setTableData ,loading,setLoading} = useDashboard();
    useEffect(()=>{
        fetchDashboard();
    },[fetchDashboard]);
    const options = {
        animationEnabled: true,
        title: {
            text: ""
        },
        
        data: [{
            type: "splineArea",
            xValueFormatString: "YYYY",
            yValueFormatString: "#,##0.## bn kW⋅h",
            showInLegend: true,
            legendText: "kWh = one kilowatt hour",
            dataPoints: [
                { x: new Date(2008, 0), y: 70.735 },
                { x: new Date(2009, 0), y: 74.102 },
                { x: new Date(2010, 0), y: 72.569 },
                { x: new Date(2011, 0), y: 72.743 },
                { x: new Date(2012, 0), y: 72.381 },
                { x: new Date(2013, 0), y: 71.406 },
                { x: new Date(2014, 0), y: 73.163 },
                { x: new Date(2015, 0), y: 74.270 },
                { x: new Date(2016, 0), y: 72.525 },
                { x: new Date(2017, 0), y: 73.121 }
            ]
        }]
    };

    return (
        <div className='chart-container flex items-center justify-center  h-full rounded-md'>
            <CanvasJSChart options={options}/>
        </div>
    );
};

export default Chart2;
