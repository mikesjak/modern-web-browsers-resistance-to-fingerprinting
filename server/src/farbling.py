from farbling_cpu_count import test_cpu_count
from farbling_device_memory import test_device_memory
from farbling_resolution import test_resolution

"""
farbling.py

This module serves as an orchestrator for detecting "farbling" — a term referring to browser fingerprint
randomization or spoofing. It imports and combines results from multiple detection functions focused on 
various fingerprinting attributes such as screen resolution, CPU count, memory size, and user agent strings.

The main function `test_farbling` takes in user fingerprint attributes and returns a list containing:
- A boolean indicating if any farbling was detected,
- The result of the resolution test,
- The result of the CPU test,
- The result of the memory test.

Each individual test module (imported here) encapsulates logic for detecting anomalies in specific fingerprint features.
"""

def test_farbling(user_attributes):
    """
    Runs a series of farbling detection tests on given user fingerprint attributes.

    Parameters:
        user_attributes (dict): Dictionary containing fingerprint attributes from the browser.

    Returns:
        list: 
            [0] -> Boolean: True if any farbling detected,
            [1] -> List: Result from screen resolution test,
            [2] -> Boolean: CPU farbling detected,
            [3] -> Boolean: Memory farbling detected
    """
    
    # Detect screen resolution inconsistencies
    res_farbling = test_resolution(int(user_attributes["Screen Width"]), int(user_attributes["Screen Height"]))
    
    # Detect CPU count anomalies
    cpu_farbling = test_cpu_count(int(user_attributes["CPU"]))
    
    # Detect memory value inconsistencies
    mem_farbling = test_device_memory(user_attributes["Memory"]) ## TODO
    
    # Overall farbling is considered True if any sub-test detected anomalies
    result = res_farbling[0] or cpu_farbling or mem_farbling

    return [result, res_farbling, cpu_farbling, mem_farbling]
