import json
from pprint import pprint
import os
import pandas as pd
import random, string

def generate_alphanum(x):
     return ''.join(random.choices(string.ascii_letters + string.digits, k=6))
    
     

def _fill_pending(df_data, df_rr):
    
    pending = pd.DataFrame({'time':[],'target':[],'hit':[]})
    pending.set_index('time', inplace = True)
    pending['target'] = df_rr.apply(lambda x: x['high_reward'] if(x['direction'] == 'Long') else x['low_reward'], axis = 'columns')
    pending.sort_index()
    df_data.sort_index()
    for time,target in pending['target'].items():
        later_data = df_data.loc[time:]

        
        hit = later_data[(later_data['low'] <= target ) & (later_data['high'] >= target)]
        if not hit.empty:
            pending.loc[time,'hit'] = hit.index[0]
        





    return pending

def convert_data_to_csv(_data):

        candlestick = pd.DataFrame(_data['data'])
        movingAverage = pd.DataFrame(_data['avg_data'])
        risk = pd.DataFrame(_data['risk'])
        reward = pd.DataFrame(_data['reward'])
        

        
        candlestick.set_index('time' , inplace= True)
        movingAverage.set_index('time', inplace = True)
        risk.set_index('start', inplace = True)
        reward.set_index('start', inplace = True)

        data = candlestick.join(movingAverage, rsuffix= '_moving_average').rename({'value': 'moving_average'}, axis='columns').dropna(subset=['moving_average'])
        risk_reward = risk.join(reward, lsuffix= '_risk', rsuffix= '_reward').drop(['end_reward'], axis = 'columns').rename({'end_risk':'end'}, axis = 'columns')
        risk_reward['direction'] = risk_reward[['high_risk','low_reward']].apply(lambda x: 'Long' if(x['high_risk'] == x['low_reward']) else 'Short', axis= 'columns')

        pending = _fill_pending(data,risk_reward)
        
        total_data = data.join([risk_reward,pending])
    
        total_data.to_csv('./data/total_data.csv', sep= ',')
        data.to_csv('./data/ohlc_data.csv')
        risk_reward.to_csv('./data/risk_reward.csv')
        pending.to_csv('./data/pending_targets.csv')
        annotated_pending = pending.join(risk_reward['direction'])
        annotated_pending['id'] = annotated_pending.apply(generate_alphanum, axis= 'columns')

        return annotated_pending.dropna()




if(__name__ == '__main__'):
    os.chdir(R'.\tradingview_interface\data-fetcher\data_processing')
    with open("./data/data.json", 'r') as f:

        _data = json.load(f)
        pprint(convert_data_to_csv(_data))
    


    
    
    


    

    







    

