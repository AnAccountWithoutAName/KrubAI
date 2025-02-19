import {
  CandlestickData,
  IChartApi,
  ISeriesApi,
  LineData,
  Time,
  WhitespaceData,
  UTCTimestamp
} from "lightweight-charts";
import { GREEN, RED, BLACK, AREA_R, AREA_G } from "./constants";
import {RiskRewardIndicator} from "../lwc-plugin-risk-reward-indicator/src/risk-reward-indicator"
import { RiskRewardIndicatorData } from "../lwc-plugin-risk-reward-indicator/src/data";
import { ChartComponent } from "../src/App";







const PlotRiskReward = (
  chart: IChartApi,
  candleStick: CandlestickData<Time>[],
  maData: LineData<Time>[]
): {risk: RiskRewardIndicatorData[], reward: RiskRewardIndicatorData[]} => {
  const risk: RiskRewardIndicatorData[] = [];
  const reward: RiskRewardIndicatorData[] = [];
  const timestamp_tracker = new Set()
  let LAST_BLACK_CANDLE_TIME: Time = '0'

  
  maData.forEach((point: LineData, index: number) => {

    if (index != 0) {

      
      if (point.color !== maData[index - 1].color) {
        if(risk.length > 0 && risk[risk.length - 1].isBlackCandle === true){

          risk.push({time: Number(point.time) as UTCTimestamp + (30*Number(point.time === risk[risk.length - 1].time)) as UTCTimestamp, high: risk[risk.length - 1].high, low: risk[risk.length - 1].low, isBlackCandle: false})
          reward.push({time: Number(point.time) as UTCTimestamp + (30*Number(point.time === reward[reward.length - 1].time)) as UTCTimestamp, high: reward[reward.length - 1].high, low: reward[reward.length - 1].low, isBlackCandle: false})
  
        }

        // if(risk.length > 0 && risk[risk.length - 1].isBlackCandle === true){
        //   risk.push({time: point.time, high: risk[risk.length - 1].high, low: risk[risk.length - 1].low, isBlackCandle: false})
        //   reward.push({time: point.time, high: risk[risk.length - 1].high, low: risk[risk.length - 1].low, isBlackCandle: false})

        // }






          

          const direction =
            Number(point.color === GREEN) - Number(point.color === RED);
          let i: number = index - 1 + 49;
          let High: number | null = -Infinity;
          let Low: number | null = Infinity;
          let Found: Boolean = false
          if(Number(maData[index - 1].time) === Number(LAST_BLACK_CANDLE_TIME)){

            i+=1
          }
    
          while (i < candleStick.length - 1) {
            if (candleStick[i].color === BLACK) {
              High = Math.max(candleStick[i].high, High);
              Low = Math.min(candleStick[i].low, Low);

              try{

              if(maData[i - 48].color != point.color && (i - 48) >= index){
                Found = false
                
                break
              }
            }
            catch(e){
              console.log(i)

            }
              //console.log(`${i} + ${point.color} + ${maData[index - 1].color} + ${new Date(Number(candleStick[i].time)*1000).toLocaleString("en-GB",{timeZone: 'UTC' })} + ${candleStick[i].color} `)
              i++;
              Found = true
            } else {

              if(maData[i - 48].color !== point.color && (i-48) >= index){
                  break}
              else if(Found === true){
                  break
                }
              else{
                  i++
                }
                  
              }

            

            
            }
          

        
        if (Found) {


          let set_time: UTCTimestamp =Number(maData[i - 48].time) as UTCTimestamp as UTCTimestamp
          LAST_BLACK_CANDLE_TIME = Number(maData[i - 49].time) as UTCTimestamp as UTCTimestamp
           


          risk.push({ time: set_time , high: High, low: Low , isBlackCandle: true});

          reward.push({
            time: set_time,
            high:
              direction === 1
                ? High + 3 * (High - Low)
                : Low,
            low: 
              direction === 1
              ? High
              : Low - 3* (High - Low),
            isBlackCandle: true
          });

        }
      }
    }
 });

 


  // console.log(risk.map((value)=> {return {...value, time: new Date(Number(value.time)*1000).toLocaleString("en-GB",{timeZone: 'UTC' })}}))
  // console.log(reward)

  const risk_band  = chart.addCustomSeries(new RiskRewardIndicator(), {areaColor: AREA_R, baseLineColor: RED})
  const reward_band  = chart.addCustomSeries(new RiskRewardIndicator(), {areaColor: AREA_G, baseLineColor: GREEN})
  // risk_band.priceScale().applyOptions({
    
  // })
  // reward_band.priceScale().applyOptions({
    
  // })

  risk_band.setData(risk)
  reward_band.setData(reward)
  

  return {risk: risk, reward: reward}

  



};

export default PlotRiskReward







