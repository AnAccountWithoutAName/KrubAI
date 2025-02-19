import {CandlestickData, IChartApi, LineData, Time} from "lightweight-charts"
import GetMovingAverageFromData from "./moving-average"

interface RSIData {
    time: Time;
    close: number


}

const PlotRSI = (chart: IChartApi , candleData: CandlestickData<Time>[], range:number) => {
    let U: RSIData[] = candleData.map((currentData: CandlestickData, index: number) => {

        if(index < candleData.length - 1){
        
        let diff = candleData[index + 1].close - currentData.close
        return diff > 0 ? {time: currentData.time, close:diff}: {time: currentData.time , close: 0}
        }
        else{
            return {time: currentData.time, close: 0}
        }
        
    })

    let D: RSIData[] = candleData.map((currentData: CandlestickData, index: number) => {
        if(index < candleData.length - 1){
        let diff = candleData[index + 1].close! - currentData.close!
        return diff < 0 ? {time: currentData.time, close:-diff}: {time: currentData.time , close: 0}
        }
        else{
            return {time: currentData.time, close: 0}
        }
    })

    U = U.slice(0,U.length - 1)
    D = D.slice(0, D.length - 1)

    let SMA_U: LineData<Time>[] = GetMovingAverageFromData(U, 14)
    let SMA_D: LineData<Time>[] = GetMovingAverageFromData(D , 14)

    console.log("U,D", SMA_U, SMA_D)
    

    const RSI: LineData<Time>[] = SMA_U.map((sma_u , index) => {
        let time = sma_u.time
        if(SMA_D[index].value === 0){
            return {time: time, value: 100}
        }
        else {
            let RSI_current = 100 - (100/(1 + (sma_u.value/SMA_D[index].value)))
            return {time: time, value: RSI_current}
        }
    }
    )

    console.log(RSI)

    
    const RSILine = chart.addLineSeries({lineWidth: 2, priceScaleId: 'left'})
    RSILine.setData(RSI)
    


    }

export default PlotRSI


 








   





