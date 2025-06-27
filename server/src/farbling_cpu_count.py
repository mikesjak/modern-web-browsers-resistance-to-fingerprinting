"""
farbling_cpu_count.py

This module provides a function to detect CPU spoofing or randomness (farbling) based on 
the reported number of logical processors. It compares the reported value to a list of 
commonly observed CPU core counts from real-world devices. If the count is not in the list,
it may indicate browser spoofing or farbling.
"""

# List of common CPU core counts observed in real devices
common_cpu_count = [2, 4, 6, 8, 10, 11, 12, 14, 16, 20, 24, 32, 64, 96]

def test_cpu_count(user_cpu_count):
    """
    Detects whether the reported CPU count is potentially spoofed or randomized.

    Parameters:
        user_cpu_count (int or str): The reported number of logical processors.

    Returns:
        bool: True if CPU count appears spoofed (i.e., uncommon), False otherwise.
    """
    try:
        # If value is 'undefined' or non-numeric, cannot validate
        if user_cpu_count == 'undefined':
            return False

        # Convert to integer if it was received as string
        user_cpu_count = int(user_cpu_count)

        # Return True if value is uncommon, suggesting possible farbling
        if user_cpu_count not in common_cpu_count:
            print(f"[FARBLING] CPU - detected")
            return True

        print(f"[FARBLING] CPU - not detected")
        return False

    except (ValueError, TypeError):
        # Handle unexpected types or conversion errors gracefully
        print(f"[FARBLING] CPU - invalid input ({user_cpu_count})")
        return False
