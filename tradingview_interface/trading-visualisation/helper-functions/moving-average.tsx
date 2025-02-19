import {
    CandlestickData,
    Time,
    LineData,
  } from "lightweight-charts";
import { GREEN } from "./constants";


interface RSIData {
  time: Time;
  close: number;


}

const GetMovingAverageFromData = (candleData: (Array<CandlestickData<Time>>|Array<RSIData>), maLength: number): LineData<Time>[] => {

    var maArray:LineData<Time>[] = [];
    maArray.push({time: candleData[maLength - 2].time , value: (candleData.slice(0,maLength).reduce((partialSum:number,nextVal:CandlestickData<Time>|RSIData):number => (partialSum + Number(nextVal["close"])) , 0 ))/maLength})

    let value:number = 0
    for(let i =maLength; i < candleData.length; i++){
      value = (maArray[i - maLength].value*maLength - candleData[i - maLength]["close"] + candleData[i]["close"])/maLength
      
      maArray[i - maLength + 1] = {time: candleData[i-1].time, value:value, color: maArray[i - maLength].value < value? '#26a69a' : '#ef5350'}

      
    }


    maArray[0].color = maArray[1].color
    maArray.push({time: candleData[candleData.length - 1].time, value: maArray[maArray.length - 1].value, color: maArray[maArray.length - 1].color})



    return maArray




    

  }

export default GetMovingAverageFromData
