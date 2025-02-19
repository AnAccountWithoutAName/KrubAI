import {
    createChart,
    ColorType,
    CandlestickData,
    Time,
    LineData,
    CrosshairMode,
    SeriesMarker,
    WhitespaceData
  } from "lightweight-charts";
  import React, { useEffect, useState } from "react";
  import GetMovingAverageFromData from "../helper-functions/moving-average"
  import PlotRiskReward from "../helper-functions/risk-reward-band"
  import { GREEN, RED } from "../helper-functions/constants";
  import PlotRSI from "../helper-functions/rsi-indicator"
import { RiskRewardIndicator } from "../lwc-plugin-risk-reward-indicator/src/risk-reward-indicator";
import { RiskRewardIndicatorData } from "../lwc-plugin-risk-reward-indicator/src/data";



interface csvDataInterface {
  data: CandlestickData[], 
  avg_data: LineData[], 
  risk: RiskRewardIndicatorDataNew[], 
  reward: RiskRewardIndicatorDataNew[]
}

interface RiskRewardIndicatorDataNew {
  start: Time,
  end: Time|null,
  high: Number,
  low: Number
}
  
  export const ChartComponent = () => {
    const [chart, setChart] = useState<any>(null); // Store the chart instance
    const [csvData, setCsvData] = useState<csvDataInterface>({data: [], avg_data: [], risk: [], reward: []})
    const [markers, setMarkers] = useState<SeriesMarker<Time>[]|[]>([])

  
    useEffect(() => {
      // Step 1: Initialize the chart

      const chartInstance = createChart(document.getElementById('chart')!, {
        layout: {
          background: { type: ColorType.Solid, color: "white" },
          textColor: "black",
          attributionLogo: false
        },
        width: window.innerWidth - 100,
        height: 600,

        timeScale:{
          timeVisible: true
        },
        crosshair:{
          mode: CrosshairMode.Normal
        },
        rightPriceScale:{
          visible: true
        }
      });

     
  
      const candlestickSeries = chartInstance.addCandlestickSeries({
        upColor: "#26a69a",
        downColor: "#ef5350",
        borderVisible: false,
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350"

      });

      const maSeries = chartInstance.addLineSeries({lineWidth: 3 })

      // Get the current users primary locale
      const currentLocale = window.navigator.languages[0];
        // Create a number format using Intl.NumberFormat


      chartInstance.timeScale().fitContent()


      //   chartInstance.timeScale().applyOptions({
      //     borderColor: '#71649C',
      //     barSpacing: 30,
      // });
    
      setChart(chartInstance); // Save the chart instance
  
      // Fetch actual data
      const fetchData = async () => {
        try {
          //const response = await fetch("http://127.0.0.1:5000/acquire");
          //const response = await fetch("http://127.0.0.1:5000/spreadsheet")
          const response = await fetch("http://127.0.0.1:5000/polygon")
          const data_ = await response.json();

          console.log(data_)
  
          // Convert and sort data
          const convertedData = ConvertToCandlestickData(data_);
      


          // console.log("Fetched data:", convertedData); // Debugging output
          candlestickSeries.setData(convertedData); // Set the data on the candlestick series
          const maArray = GetMovingAverageFromData(convertedData,50)
          if(Array.isArray(markers) && markers.length !== 0){
            
            candlestickSeries.setMarkers(markers)
          }


          maSeries.setData(maArray)
          const {risk, reward} = PlotRiskReward(chartInstance,convertedData,maArray)
          const risk_new = modifyRiskRewardData(risk)
          const reward_new = modifyRiskRewardData(reward)


          

          setCsvData({data: convertedData, avg_data: maArray , risk: risk_new, reward: reward_new})

          

          

         


          
          

          



          //PlotRSI(chartInstance,convertedData,14)
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
  
      fetchData(); // Call the fetch function
  
      // Handle window resize
      const handleResize = () => {
        chartInstance.resize(window.innerWidth, 500);
      };
      window.addEventListener("resize", handleResize);
  
      return () => {
        window.removeEventListener("resize", handleResize);
        chartInstance.remove(); // Clean up the chart instance on unmount
      };
    }, []);

    useEffect(() => {
      if(csvData.data.length !== 0){
        postDataAsJson(csvData,setMarkers)
      }

   

      
    },[csvData])

    
  
    // Function to convert raw data to CandlestickData format
    const ConvertToCandlestickData = (oldData: any): Array<CandlestickData<Time>> => {
      const newData = oldData.map((item: any) => (

        {
        //time: Math.floor(Date.parse(item["timestamp"]) / 1000),
      
        time: Math.floor(item["time"]),
        open: Number(item["open"]),
        high: Number(item["high"]),
        low: Number(item["low"]),
        close: Number(item["close"]),
        color: Math.abs(Number(item["close"]) - Number(item["open"])) <= 0.5*(Math.abs(Number(item["high"]) - Number(item["low"]))) ? "#450C69" : undefined
      }));

      
  
      // Sort by time
      newData.sort((a: any, b: any) => a.time - b.time);
      return newData;
    };

   


    return <div id="chart"  />;
  };

  function modifyRiskRewardData(array: RiskRewardIndicatorData[]){
    const new_array:RiskRewardIndicatorDataNew[]  = []
    if(array.length === 0){
      return new_array
    }
    for(let i = 0; i < array.length - 1; i+=2){
      
      new_array.push({start: array[i].time , end: array[i+1].time, high: array[i].high, low:array[i].low})

      

    }
    if(array.length%2 !== 0 ){
      new_array.push({start: array[array.length - 1].time, end: null, high: array[array.length - 1].high, low: array[array.length - 1].low})
    }

    return new_array
  }

  function saveObjectAsJson(object: any, filename: string) {
    // Convert the object to a JSON string
    const jsonString = JSON.stringify(object, null, 2); // Pretty print with 2 spaces
  
    // Create a Blob with the JSON string
    const blob = new Blob([jsonString], { type: "application/json" });
  
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);
  
    // Create a link element
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.json`;
  
    // Programmatically click the link to trigger download
    link.click();
  
    // Cleanup: Revoke the Blob URL
    URL.revokeObjectURL(url);
  }

  function postDataAsJson(object: any, setMarkers: any){
    fetch('http://127.0.0.1:5000/send_data', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",


      },
      body: JSON.stringify(object)

    }).then(response => response.json())
    .then(data => {

      if(data.length !== 0){
        data = JSON.parse(data)
        const _marker:SeriesMarker<Time>[] = data.map((item:any) => {
          const init_time = new Date(item.time*1000).toISOString()
          const text_to_display = `${item.id}_${init_time}_${item.direction}_1m`
          return{
            time: Number(item.hit), 
            position: 'aboveBar',
            color: '#000000',
            shape: 'arrowDown',
            text: text_to_display,
            size: 1


          }
        
        })


        _marker.sort((a:SeriesMarker<Time>, b:SeriesMarker<Time>) => Number(a.time) - Number(b.time));
        setMarkers(_marker)

        
        
      }

    })
    .catch(error => console.error("Error:", error));



  }


  export function App() {
    return (

    <div>
    <ChartComponent />
    </div>

    )
  }
  
  export default App;
  