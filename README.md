# Modern Web Browsers' Resistance to Fingerprinting

[![Thesis Grade](https://img.shields.io/badge/Thesis_Grade-A-success)](https://dspace.cvut.cz/handle/10467/123963)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

This repository contains the source code, experimental data, and analysis tools developed for the Bachelor's thesis **"Modern Web Browsers' Resistance to Fingerprinting"**.

The project implements a system for collecting, storing, and analyzing browser fingerprint data to evaluate the effectiveness of anti-fingerprinting mechanisms. It focuses on analyzing the consistency and uniqueness of fingerprints across different browser configurations and identifying the efficiency of randomization techniques. 

Live demo can be seen on my [web page](https://www.jakubmikes.cz).

**Thesis Link:** [CTU Digital Library (DSpace)](https://dspace.cvut.cz/entities/publication/fc3a45e6-0ebc-4c10-8bc6-8a2cea268318)

## Project Overview

The system consists of a client-side data collector, a server-side storage and processing unit, and a suite of analytical tools. The research utilizes a dataset collected from the following browsers:

* **Google Chrome**
* **Mozilla Firefox**
* **Apple Safari**
* **Brave Browser**
* **Tor Browser**

## Repository Structure

### Server Modules (`/server`)
The core backend logic handles data ingestion, user identification, and specific entropy tests.

| Module | Description |
| :--- | :--- |
| `receiver.py` | Main entry point handling HTTP communication. |
| `user_manager.py` | Manages user session persistence and retrieval. |
| `data_manager.py` | Handles database operations and data storage. |
| `naive.py` | Implements the **Naive** user detection algorithm. |
| `complex.py` | Implements the **Complex** fingerprinting detection algorithm. |
| `farbling.py` | Orchestrates randomization (farbling) tests. |
| `farbling_*.py` | Specific modules for CPU, Memory, and Resolution randomization analysis. |

### Analysis Notebooks (`/notebooks`)
Jupyter notebooks containing statistical analysis and visualizations of the collected dataset.

| Notebook | Description |
| :--- | :--- |
| `brave_profiles.ipynb` | Analysis of distinct Brave Browser profiles. |
| `brave.ipynb` | General analysis of Brave Browser fingerprinting protections. |
| `firefox.ipynb` | Analysis of Mozilla Firefox anti-fingerprinting measures. |
| `safari.ipynb` | Analysis of Apple Safari (ITP) effectiveness. |
| `tor.ipynb` | Evaluation of Tor Browser's uniformity. |
| `confusion_matrix.ipynb` | visualization of identification algorithm precision. |
| `decision_tree.ipynb` | Implementation of a Decision Tree classifier for user identification. |

> **Note:** Additional simulation scripts (`simulate_complex.py`, `simulate_naive.py`) are located in the `analysis` directory.

## Installation & Deployment

### Prerequisites
* Python 3.8+
* pip packet manager

### Setup Steps

1.  **Environment Setup**
    Create and activate a virtual environment to isolate dependencies.
    ```bash
    python3 -m venv env
    source env/bin/activate  # On Windows use: env\Scripts\activate
    ```

2.  **Dependencies**
    Install the required Python packages.
    ```bash
    pip install -r requirements.txt
    ```

3.  **Client Deployment**
    Navigate to the client directory and serve the static files.
    ```bash
    cd client
    python3 -m http.server 8000
    ```

4.  **Server Deployment**
    Navigate to the server directory and start the receiver script.
    ```bash
    cd server
    python3 receiver.py
    ```

## Configuration

To deploy the system in a network environment (non-localhost), the API endpoint addresses must be updated to match the server's host IP.

**Warning:** Always use the `http://` protocol.

Please update the `getIpAddress()` or relevant connection methods in the following files:

* `client/browser.js`
* `client/device.js`
* `client/headers.js` (specifically `getAcceptHeaders`)
* `client/manager.js` (specifically `manage`)

## Notes

* **Local Execution:** All fingerprinting tests are designed for a local setup. Cross-Origin Resource Sharing (CORS) policies may restrict functionality in production environments without additional header configuration.

## Citation

If you use this code or dataset in your research, please cite the thesis as follows:

```bibtex
@mastersthesis{FingerprintingThesis,
  author  = {Mikeš, Jakub},
  title   = {Modern Web Browsers' Resistance to Fingerprinting},
  school  = {Czech Technical University in Prague},
  year    = {2025},
  type    = {Bachelor's Thesis},
  url     = {https://dspace.cvut.cz/handle/10467/123963}
}
```
