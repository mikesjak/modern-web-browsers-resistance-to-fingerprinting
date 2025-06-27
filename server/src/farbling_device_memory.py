"""
farbling_device_memory.py

This module checks whether a user's reported device memory value (from `navigator.deviceMemory`)
matches a set of predefined valid values. It is used to detect spoofed or non-standard values,
which may indicate browser fingerprint randomization (farbling).

Due to how `navigator.deviceMemory` works, testing this reliably is virtually impossible in practice.
Browsers only return specific, predefined values (e.g., 0.25, 0.5, 1, 2, 4, 8 GB), and they round or limit the
actual physical memory to these constants. This means that even if a device has 6GB or 12GB of RAM, the
browser might still return just `4` or `8`. As a result, detecting farbling based on this attribute is limited
to flagging clearly incorrect values or undefined/malformed responses.
"""

# Based on documentation from Mozilla and known behavior of navigator.deviceMemory
# Only these values are returned by supported browsers, in gigabytes.
return_values = [0.25, 0.5, 1, 2, 4, 8]

def test_device_memory(user_memory):
    """
    Detects spoofing or irregular values in reported device memory.

    Parameters:
        user_memory (str): String representation of device memory (e.g., '4 GB', 'undefined').

    Returns:
        bool: True if memory is uncommon (potential farbling), False otherwise.
    """
    try:
        # Clean and extract numeric part (e.g., "4 GB" → "4")
        memory_str = user_memory.strip().split(' ')[0]

        if memory_str.lower() == 'undefined':
            print(f"[FARBLING] MEMORY - not detected")
            return False

        # Convert to float and validate against known acceptable values
        memory_value = float(memory_str)

        if memory_value not in return_values:
            print(f"[FARBLING] MEMORY - detected")
            return True

        print(f"[FARBLING] MEMORY - not detected")
        return False

    except (ValueError, TypeError, AttributeError):
        # Catch cases where input is malformed
        print(f"[FARBLING] MEMORY - invalid input ({user_memory})")
        return False
