from datetime import datetime

"""
get_curr_time: This function retrieves the current time formatted as HH:MM:SS.
It is useful for logging or timestamping events in your system.

Returns:
- A string representing the current time in HH:MM:SS format.
"""

def get_curr_time():
    """
    Retrieves the current time in HH:MM:SS format.
    
    Returns:
    - string: Current time formatted as HH:MM:SS.
    """
    now = datetime.now()  # Get the current date and time
    current_time = now.strftime("%H:%M:%S")  # Format the current time as HH:MM:SS
    return current_time  # Return the formatted time
