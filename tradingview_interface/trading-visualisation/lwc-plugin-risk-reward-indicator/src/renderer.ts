import {
	BitmapCoordinatesRenderingScope,
	CanvasRenderingTarget2D,
} from 'fancy-canvas';
import {
	ICustomSeriesPaneRenderer,
	PaneRendererCustomData,
	PriceToCoordinateConverter,
	Time,
} from 'lightweight-charts';
import { RiskRewardIndicatorData } from './data';
import { RiskRewardIndicatorOptions } from './options';

interface RiskRewardIndicatorItem {
	x: number;
	high: number;
	low: number;
	isBlackCandle: boolean;
}

export class RiskRewardIndicatorRenderer<TData extends RiskRewardIndicatorData>
	implements ICustomSeriesPaneRenderer
{
	_data: PaneRendererCustomData<Time, TData> | null = null;
	_options: RiskRewardIndicatorOptions | null = null;

	draw(
		target: CanvasRenderingTarget2D,
		priceConverter: PriceToCoordinateConverter
	): void {
		target.useBitmapCoordinateSpace(scope =>
			this._drawImpl(scope, priceConverter)
		);
	}

	update(
		data: PaneRendererCustomData<Time, TData>,
		options: RiskRewardIndicatorOptions
	): void {
		this._data = data;
		this._options = options;
	}

	_drawImpl(
		renderingScope: BitmapCoordinatesRenderingScope,
		priceToCoordinate: PriceToCoordinateConverter
	): void {
		if (
			this._data === null ||
			this._data.bars.length === 0 ||
			this._data.visibleRange === null ||
			this._options === null
		) {
			return;
		}
		const options = this._options;
		const bars : RiskRewardIndicatorItem[] = this._data.bars.map(bar => {
			return {
				x: bar.x * renderingScope.horizontalPixelRatio,
				high: priceToCoordinate(bar.originalData.high)! * renderingScope.verticalPixelRatio,
				low: priceToCoordinate(bar.originalData.low)! * renderingScope.verticalPixelRatio,
				isBlackCandle: bar.originalData.isBlackCandle
			};
		});

		

		const ctx = renderingScope.context;
		ctx.beginPath();

		const risk = new Path2D()
		const highLine = new Path2D();
		const firstBar = bars[this._data.visibleRange.from - 1];
		let start_point = this._data.visibleRange.from
		

		if(firstBar.isBlackCandle){
			highLine.moveTo(0,firstBar.high)


			risk.rect(0,firstBar.low,bars[start_point].x, firstBar.high - firstBar.low)
			highLine.lineTo(bars[start_point].x,firstBar.high)
			start_point = this._data.visibleRange.from + 1
			

		}

	


		for (
			let i = start_point;
			i < this._data.visibleRange.to - 1;
			i = i + 2
		) {

			const bar = bars[i];
			const bar_to = bars[i+1]
	
			
			highLine.moveTo(bar.x,bar.high)


			risk.rect(bar.x,bar.low,bar_to.x - bar.x, bar.high - bar.low)
			highLine.lineTo(bar_to.x,bar.high)

			
			
			
		}

		const lastBar = bars[this._data.visibleRange.to - 1]
		if(lastBar.isBlackCandle){

			highLine.moveTo(lastBar.x,lastBar.high)
			
			risk.rect(lastBar.x,lastBar.low,renderingScope.bitmapSize.width*renderingScope.horizontalPixelRatio- lastBar.x, lastBar.high - lastBar.low)
			highLine.lineTo(renderingScope.bitmapSize.width*renderingScope.horizontalPixelRatio,lastBar.high)
		}



		ctx.fillStyle = options.areaColor
		ctx.strokeStyle = options.baseLineColor
		
		ctx.fill(risk)
		ctx.stroke(highLine)

		
	



		

	}
}
