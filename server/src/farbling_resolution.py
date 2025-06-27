"""
farbling_resolution.py

This module attempts to detect resolution spoofing or fingerprinting protection (farbling) 
by comparing the user's reported screen resolution against a list of common resolutions. 
It allows for small tolerances, accounting for device pixel ratios (DPR), fractional scaling, 
and other variations caused by system rendering.

Because device screens may report virtual resolution (in CSS pixels) rather than physical pixels, 
the code also checks against common resolutions divided by 2, to account for devices with high DPR.

Common resolutions were chosen based on real-world usage data.

Returns:
    - A boolean indicating if the resolution appears spoofed or unusual.
    - The closest matching resolution (if applicable).
"""

common_resolutions = [
    [640, 480], [800, 600], [1024, 768], [1152, 864], [1176, 664],
    [1280, 720], [1280, 800], [1280, 960], [1360, 768], [1366, 768],
    [1440, 900], [1600, 900], [1600, 1024], [1600, 1200], [1680, 1050],
    [1920, 1080], [1920, 1200], [1920, 1440], [2048, 1080], [2160, 1440],
    [2400, 1600], [2560, 1080], [2560, 1440], [2560, 1600], [3000, 2000],
    [3024, 1964], [3240, 2160], [3440, 1440], [3840, 1600], [3840, 2160],
    [5120, 2160], [5120, 2880], [7680, 4320]
]

# Tolerance threshold for similarity (85%)
# The tolerance is set to 0.85, meaning that the width and height ratios must be within 15% of the original resolution.
# This allows for some flexibility in matching, accounting for high-DPR devices and other variations.
diff = 0.85

def test_resolution(user_width, user_height):
    """
    Determines whether a screen resolution is common or possibly spoofed.

    Parameters:
        user_width (int or str): Screen width as reported by the user.
        user_height (int or str): Screen height as reported by the user.

    Returns:
        tuple: (bool, list) - Farbling detected, and the best matched resolution.
    """
    try:
        # Handle undefined or invalid inputs
        if user_width == 'undefined' or user_height == 'undefined':
            return [False, [user_width, user_height]]

        user_width = int(user_width)
        user_height = int(user_height)

        if user_width <= 0 or user_height <= 0:
            raise ValueError("Width and height must be positive integers.")

        original_res = [user_width, user_height]
        best_match = None
        min_distance = float('inf')

        for resolution in common_resolutions:
            for scale in [1, 0.5]:  # Account for high-DPR devices
                ref_width = resolution[0] * scale
                ref_height = resolution[1] * scale

                width_ratio = user_width / ref_width
                height_ratio = user_height / ref_height

                # Check if the resolution is within the tolerance range
                if diff < width_ratio < 1 + (1 - diff) and diff < height_ratio < 1 + (1 - diff):
                    # Check for exact match to avoid false positives
                    if abs(width_ratio - 1) < 1e-5 and abs(height_ratio - 1) < 1e-5:
                        print("[FARBLING] Resolution - not detected")
                        return [False, [int(ref_width), int(ref_height)]]

                    # Calculate distance and update the best match
                    distance = abs(1 - width_ratio * height_ratio)
                    if distance < min_distance:
                        min_distance = distance
                        best_match = [int(ref_width), int(ref_height)]

        if best_match and best_match != original_res:
            # print(f"[FARBLING] Possible resolutions -> {best_match}")
            print("[FARBLING] Resolution - detected")
            return [True, best_match]

        print("[FARBLING] Resolution - not detected")
        return [False, original_res]

    except ValueError as e:
        print(f"[ERROR] Invalid input: {e}")
        return [False, [user_width, user_height]]
