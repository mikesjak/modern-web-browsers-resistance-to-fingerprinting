from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

from naive import naive                      # Basic fingerprint similarity detection
from complex import complex                  # Advanced fingerprint analysis
from data_manager import *                   # Utilities for loading and saving data
from farbling import test_farbling           # Tests for fingerprint noise injection (e.g., Canvas spoofing)
from timestamp import get_curr_time          # Provides current timestamp for logging
from user_manager import handle_saving_user  # Logic for saving new or updated user fingerprint data

"""
receiver.py

This script sets up a Flask-based server that acts as the backend receiver for browser fingerprinting data
in the context of a fingerprinting detection test suite. It provides endpoints to:
- Retrieve HTTP request headers.
- Retrieve client IP addresses.
- Receive and process fingerprint data, using naive and complex detection methods along with a farbling test.
- Store user fingerprint data.
- Serve as a logging and response system to evaluate potential browser randomization or spoofing techniques.

Imported modules handle fingerprint analysis, farbling detection, data saving/loading, and user management.
"""

# Initialize the Flask app and enable CORS
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Endpoint for retrieving Accept headers sent by the browser
@app.route('/get-accept-headers', methods=['GET'])
def get_accept_headers():
    headers = {
        "Accept": request.headers.get('Accept'),
        "Accept-Charset": request.headers.get('Accept-Charset'),
        "Accept-Encoding": request.headers.get('Accept-Encoding'),
        "Accept-Language": request.headers.get('Accept-Language')
    }
    return jsonify(headers)

# Endpoint for retrieving the IP address of the client
@app.route('/get-ip', methods=['GET'])
def get_ip():
    ip = request.headers.get('X-Forwarded-For', request.remote_addr)
    return jsonify({"ip": ip})

# Main endpoint that processes and evaluates submitted fingerprint data
@app.route('/check', methods=['POST'])
def get_data():

    users = load_users() # Load existing user fingerprints stored in fp_data.csv

    user_data = request.json
    user_attributes = user_data["Attributes"]
    
    # Save data to CSV if user is identified
    if user_data['Name'] != "Not available":
        file_path = "../data/" + user_data['Name'] + ".csv"
        del user_data["Name"]
        save_user_data(user_data, file_path)
    
    # Run farbling detection on fingerprint attributes
    farbling = test_farbling(user_attributes)
    res_farbling = farbling[1][0]
    cpu_farbling = farbling[2]
    mem_farbling = farbling[3]

    # Run naive and complex detection algorithms if user database is available
    if len(users) > 0:
        res_naive = naive(users, user_data)
        res_complex = complex(users, user_data, farbling)
        found_naive = res_naive[0]
        found_complex = res_complex[0]
    else:
        res_naive = [False]
        res_complex = [False]
        found_naive = False
        found_complex = False

    handle_saving_user(users, user_data, res_naive, res_complex)

    # Prepare results summary
    results = [
        {"Success": found_naive or found_complex}, 
        {"Naive": found_naive}, 
        {"Complex": found_complex}, 
        {"Resolution modified": res_farbling},
        {"CPU modified": cpu_farbling},
        {"Memory modified": mem_farbling}
    ]

    # Log results with timestamp
    print(f"[RECEIVER][{get_curr_time()}] {results}")
    
    return jsonify(results)

# Endpoint to manually upload specific user fingerprint data
@app.route('/save-user', methods=['POST'])
def get_specific_data():
    user_data = request.json
    print(f"[RECEIVER] Adding data from {user_data['Name']}")
    
    file_path = "../" + user_data['Name'] + ".csv"
    del user_data["Name"]

    save_user_data(user_data, file_path)
    
    return jsonify(True)
    
# Run the app
if __name__ == '__main__':
    app.run(debug=True, port=5000)