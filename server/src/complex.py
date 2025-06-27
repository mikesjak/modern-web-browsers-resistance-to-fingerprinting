import numpy as np
import ast
from data_manager import *


# Hash weights: These weights are used to score how similar the user's hash attributes are with the data.
# Attr, Audio, Fonts, Geom, MediaHash, Name, PluginsHash, TXT
hash_weights = [
    0, 10, 2, 10, 4, 0, 4, 10
]

# Attribute weights: These weights are used to score how similar the user's attributes are with the data.
# IP, CPU, Memory, Screen Width, Screen Height
# Usable Screen Width, Usable Screen Height, Color Depth, Touch Screen, Browser name
# Browser core, Navigator properties, Browser permissions, IndexedDB, Open database, 
# Local storage, Session storage, Global Storage, PDF Viewer, Cookies Enabled, 
# Do not track, AdBlock, Encryption methods, Navigator Vendor, Vendor, 
# Unmasked Vendor, Renderer, Unmasked Renderer, Shading Langueage Versions
attribute_weights = [
    2, 2, 3, 2, 2,
    2, 2, 2, 2, 5, 
    5, 3, 3, 2, 2,
    1, 1, 1, 1, 1, 
    1, 2, 1, 2, 2, 
    2, 2, 2, 2, 2
]

def compare_attribute(curr_attr_value, user_attr_value, weight):
    """
    Compares the attribute value from the dataset with the user's attribute value and 
    returns the weight if they match.
    
    Parameters:
    curr_attr_value (str): The current attribute value from the dataset.
    user_attr_value (str): The user's attribute value to compare against.
    weight (int): The weight for this attribute match.

    Returns:
    int: The weight if values match, 0 otherwise.
    """
    if curr_attr_value == user_attr_value:
        return weight
    return 0

def find_similar_value(users, user_data, key):
    """
    Finds users that have the same value for the specified key.
    This is a more efficient approach than iterating manually.
    
    Parameters:
    users (DataFrame): The DataFrame containing all the users.
    user_data (dict): The data of the user to compare against.
    key (str): The key (attribute) to search for in the dataset.

    Returns:
    DataFrame: A filtered DataFrame containing users with the same value for the specified key.
    """
    return users[users[key] == user_data[key]]

def find_similar_hashes(users, user_data):
    """
    Finds users who have matching values for specific attributes (audio, geom, txt canvas, etc.)
    This returns a list of DataFrames containing matches for each key.
    
    Parameters:
    users (DataFrame): The DataFrame containing all the users.
    user_data (dict): The data of the user to compare against.

    Returns:
    list: A list of DataFrames containing users who have matching hash values for various keys.
    """
    
    # List of keys for the attributes to check
    keys = ["Audio", "Geom Canvas", "TXT Canvas", "Fonts", "MediaHash", "PluginsHash"]
    matches = []

    # For each key, find matching users and append them to the matches list
    for key in keys:
        matches.append(find_similar_value(users, user_data, key))

    return matches

def find_audio_and_canvas_match(users, user_data):
    """
    Checks for matches based on audio, geometry canvas, and text canvas. Returns the first match found.

    Parameters:
    users (DataFrame): The DataFrame containing all the users.
    user_data (dict): The data of the user to compare against.

    Returns:
    list: A list containing a boolean indicating if a match was found and the matching user data if found.
    """
    audio_matches = users[users["Audio"] == user_data["Audio"]]
    geom_matches = users[users["Geom Canvas"] == user_data["Geom Canvas"]]
    txt_matches = users[users["TXT Canvas"] == user_data["TXT Canvas"]]

    total_matches = len(audio_matches) + len(geom_matches) + len(txt_matches)
    
    if total_matches > 0:
        if len(audio_matches) > 0:
            return [True, audio_matches.iloc[0]]
        if len(geom_matches) > 0:
            return [True, geom_matches.iloc[0]]
        return [True, txt_matches.iloc[0]]
    
    return [False, None]

def check_hashes(users, user_data):
    """
    Checks how similar the user data is to others based on various hash attributes (audio, fonts, plugins, etc.).

    Parameters:
    users (DataFrame): The DataFrame containing all the users.
    user_data (dict): The data of the user to compare against.

    Returns:
    np.array: An array of similarity scores for each user based on hash attributes.
    """
    similarities = np.zeros(len(users))
    dfs = find_similar_hashes(users, user_data)

    # Skipping attribute 5 (Name of device - for debugging purposes only)
    for df, curr_df in enumerate(dfs):
        if df == 5:
            continue
        if len(curr_df) > 0:
            matched_users = curr_df[curr_df['ID'].isin(users['ID'])]
            for u, user in matched_users.iterrows():
                similarities[u] += hash_weights[df]

    return similarities

def check_attributes(users, user_data):
    """
    Checks how similar the user's attributes are to the attributes of other users and scores them.

    Parameters:
    users (DataFrame): The DataFrame containing all the users.
    user_data (dict): The data of the user to compare against.

    Returns:
    np.array: An array of similarity scores for each user based on their attributes.
    """
    similarities = np.zeros(len(users))

    for u, user in users.iterrows():
        attr_counter = 0
        curr_attrs = ast.literal_eval(user["Attributes"])

        # Compare attributes using the helper function
        for attr, value in curr_attrs.items():
            if attr_counter >= len(attribute_weights):
                print(f"[WARNING] attribute_weights index {attr_counter} out of range for attribute '{attr}'")
                continue
            similarities[u] += compare_attribute(value, user_data["Attributes"].get(attr), attribute_weights[attr_counter])
            attr_counter += 1

    return similarities

def dynamic_threshold(similarity_scores):
    """
    Dynamically calculates the threshold for determining a valid match based on the average similarity score.

    Parameters:
    similarity_scores (np.array): The array of similarity scores.

    Returns:
    int: The dynamically calculated threshold value for determining a match.
    """
    mean_similarity = np.mean(similarity_scores)
    return max(mean_similarity + 5, 70)

def adjust_for_farbling(user_attributes, farbling):
    """
    Adjusts user attributes if farbling is detected.

    Parameters:
    user_attributes (dict): The user's attributes.
    farbling (list): Contains farbling status and modified values.

    Returns:
    dict: Adjusted user attributes.
    """
    if farbling[0]:  # If farbling is detected
        print("[COMPLEX] User is modifying its values")
        user_attributes["Screen Width"], user_attributes["Screen Height"] = farbling[1][1]
    else:
        print("[COMPLEX] User is not modifying its values")
    return user_attributes

def calculate_similarities(users, user_data):
    """
    Calculates combined similarity scores based on hashes and attributes.

    Parameters:
    users (DataFrame): The DataFrame containing all the users.
    user_data (dict): The data of the user to compare against.

    Returns:
    np.array: Combined similarity scores.
    """
    hash_similarities = check_hashes(users, user_data)
    attr_similarities = check_attributes(users, user_data)
    return hash_similarities + attr_similarities

def find_best_match(similarities, users):
    """
    Finds the best match based on similarity scores and a dynamic threshold.

    Parameters:
    similarities (np.array): Array of similarity scores.
    users (DataFrame): The DataFrame containing all the users.

    Returns:
    list: A list containing a boolean indicating if a match was found and the matching user ID.
    """
    res = np.argmax(similarities)
    threshold = dynamic_threshold(similarities)

    if similarities[res] >= threshold:
        print(f"[COMPLEX] Match with {int(users.iloc[res]['ID'])} with {similarities[res]} points")
        return [True, int(users.iloc[res]['ID'])]
    
    print(f"[COMPLEX] No match, max score was {similarities[res]}, threshold was {threshold}")
    return [False, -1]


def complex(users, user_data, farbling):
    """
    Main function of the complex algorithm that checks for similar users either by hash or attributes, 
    with adjustments for farbling (modifying values).

    Parameters:
    users (DataFrame): The DataFrame containing all the users.
    user_data (dict): The data of the user to compare against.
    farbling (list): Contains information if the user is modifying its data (farbling) and the modified values.

    Returns:
    list: A list containing a boolean indicating if a match was found and the matching user ID if found.
    """
    user_attributes = adjust_for_farbling(user_data["Attributes"], farbling)

    if farbling[0]:  # If farbling is detected
        similarities = calculate_similarities(users, user_data)
        return find_best_match(similarities, users)
    else:
        # Search for audio, geom/txt canvas match
        match = find_audio_and_canvas_match(users, user_data)
        if match[0]:
            return [True, int(match[1]['ID'])]

    return [False, -1]

# Function to get the index of the max similarity
def find_max(similarities):
    return np.argmax(similarities)
