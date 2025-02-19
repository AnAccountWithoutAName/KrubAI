import { Coordinate, CustomData, Time } from 'lightweight-charts';

/**
 * RiskRewardIndicator Data
 */
export interface RiskRewardIndicatorData extends CustomData {
	//* Define the structure of the data required for the series.
	//* You could also 'extend' an existing Lightweight Charts Data type like LineData or CandlestickData
	high: number;
	low: number;
	isBlackCandle: boolean;
}
