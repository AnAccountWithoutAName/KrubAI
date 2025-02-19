import { createChart } from 'lightweight-charts';
import { RiskRewardIndicator } from '../risk-reward-indicator';
import { RiskRewardIndicatorData } from '../data';
import { generateSampleData } from '../sample-data';

const chart = ((window as unknown as any).chart = createChart('chart', {
	autoSize: true,
}));

const series = chart.addCustomSeries(new RiskRewardIndicator(), {
	/* Options */
});

const data: RiskRewardIndicatorData[] = generateSampleData(500, 50);
series.setData(data);
