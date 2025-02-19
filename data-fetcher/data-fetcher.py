
from flask import Flask, jsonify, request
import csv
from polygon import RESTClient
import logging
from pprint import pformat
import time
import requests
from data_processing.data_processor import convert_data_to_csv
from flask_cors import CORS,cross_origin
import os




os.chdir(R'.\data-fetcher')
app = Flask(__name__)
CORS(app= app, resources={r"*":{"origins":"*"}})
api_key = os.environ["POLYGON_API_KEY"]


client = RESTClient(api_key)

last_request_time = 0
cache = None

def get_list_of_agg(ticker):
    global last_request_time, cache

    # Ensure at least 12 seconds between API calls


    # Update request time and fetch fresh data

    list_of_agg = []
    for aggs in client.list_aggs(ticker=ticker, multiplier=1, timespan="minute", from_="2023-01-01", to="2025-01-01", limit=50000):
        list_of_agg.append({
            "time": aggs.timestamp // 1000,
            "open": aggs.open,
            "high": aggs.high,
            "low": aggs.low,
            "close": aggs.close
        })
    
      # Cache the data
    return list_of_agg
def get_list_of_aggs_using_req(ticker):
    list_of_aggs = []
    response = requests.get('https://api.polygon.io/v2/aggs/ticker/AAPL/range/1/minute/2023-01-01/2024-01-01?adjusted=true&sort=asc&limit=50000&apiKey=XSf7bj5uiKc6Y9RlrqGe1uU1vUXWqn1J').json()
    for agg in response['results']:
            list_of_aggs.append({
            "time": agg['t'] // 1000,
            "open": agg['o'],
            "high": agg['h'],
            "low": agg['l'],
            "close": agg['c']
        })
    return list_of_aggs

        

        


# @app.get('/acquire')
# def send_data():
#     response = table.scan()['Items']
#     response_json = jsonify(response)
#     response_json.headers.add('Access-Control-Allow-Origin', '*')
#     return response_json

@app.get('/spreadsheet')
def send_data_from_spreadsheet():
    
    data = list(csv.DictReader(open(R"tradingview_interface\data-fetcher\OANDA_XAUUSD_1m.csv")))
    response = jsonify(data[len(data):len(data) - 2000: -1])
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.get('/polygon')
def send_data_from_polygon():
    data = get_list_of_agg("C:XAUUSD")
    response = jsonify(data)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/send_data', methods=['POST','OPTIONS'])
@cross_origin(origin='*')
def handle_data():

 
     _data = request.get_json()
     pending = convert_data_to_csv(_data).reset_index().to_json(orient = "records")
     app.logger.setLevel(logging.INFO)
     #app.logger.info(pending)


     return jsonify(pending), 200




     



if __name__ == "__main__":
    app.run(debug = False)
    





























#session = boto3.Session(profile_name = "Kosu")
#dynamodb = session.resource("dynamodb" , region_name = "ap-south-1")
#table = dynamodb.Table("ohlc-data")






