# Browser-Fingerprinting-Security-Measures

This project is a result of my bachelors thesis.
It contains a system for collecting, storing, and analysing browser fingerprint data in order to evaluate the effectiveness of anti-fingerprinting mechanisms.

Project also consists of analysis of collected data from 5 browsers.
- Google Chrome
- Mozilla Firefox
- Apple Safari
- Brave Browser
- Tor Browser

My bachelors thesis is listed <a href="https://dspace.cvut.cz/handle/10467/123963">here</a>.
The thesis was graded A, A.

## Setup Instructions

1. Create virtual environment and activate it
``` python
python3 -m venv env
source env/bin/activate
```

2. Install all dependencies
``` python
pip install -r requirements.txt
```

3. Enter the client directory and run python server to host the website
``` python
cd client
python3 -m http.server 8000
```

4. Enter the server directory and run Server-side script
``` python
cd server
python3 receiver.py
```

5. Change the IP address if necessary

### Where to change IP address
`ALWAYS USE HTTP://`

browser.js
- getIpAddress()

device.js 
- getIpAddress()

headers.js
- getAcceptHeaders()

manager.js
- manage()

## Analysis Notebooks

This thesis includes analysis of fingerprint data collected from five browsers.

| Module name   | Description        |
|--------|---------------|
| brave_profiles.ipynb | Analysis of Brave profiles data |
| brave.ipynb | Analysis of Brave data  |
| confusion_matrix.ipynb | Illustration of precision of identification algorithms |
| decision_tree.ipynb | Decision tree classifier |
| firefox.ipynb | Analysis of Mozilla Firefox data|
| safari.ipynb | Analysis of Apple Safari data |
| tor.ipynb | Analysis of Tor Browser |

Additional simulation scripts can be found in the [analysis](analysis) directory:
- simulate_complex.py – Simulates the Complex algorithm
- simulate_naive.py – Simulates the Naive algorithm

## Server Modules

The server consists of 10 Python modules responsible for processing, storing, and analysing fingerprint data.


| Module name   | Description        |
|--------|---------------|
| complex.py | Complex fingerprinting detection algorithm |
| data_manager.py | Data managing |
| farbling_cpu_count.py | CPU randomisation test |
| farbling_device_memory.py | Device memory randomisation test |
| farbling_resolution.py | Screen resolution randomisation test |
| farbling.py | Farbling test managing |
| naive.py | Naive user detection algorithm |
| receiver.py | Communication handling |
| timestamp.py | Formating current time |
| user_manager.py | Storing and loading users |

## Notes
All fingerprinting tests assume a local setup, cross-origin restrictions may apply in production environments.