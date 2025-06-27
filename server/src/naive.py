import pandas as pd
import ast
import json

"""
naive.py: This script implements a naive approach for identifying users based on attribute matching. 
It compares the current user's attributes against a stored set of known users in a DataFrame, looking for the most similar match. 

The primary comparison is based on the number of matching attributes, with a predefined threshold (MAX_MATCH) that indicates when a user is considered known.
If no full match is found, the algorithm also checks if specific key attributes (such as "Audio", "Geom Canvas", and "TXT Canvas") match to return a similar user.
If no match is found at all, the user is considered new.

Functions:
- count_similar_columns: Compares a user's attributes with the current user and counts the number of matching columns.
- naive_search: Compares the current user against stored users, and returns the most similar user or indicates a new user.
- naive: The main entry point that performs the naive search.
"""

# Constants
# MAX_MATCH: Defines the maximum number of matching columns required for a user to be considered the same.
MAX_MATCH = 36

# MAX_MATCH: Defines the maximum number of matching columns required for a user to be considered the same.
# If the number of matching fields between the current user and a stored user equals THRESHOLD, the user is considered known.
THRESHOLD = 33

def count_similar_columns(row, test_user):
    """
    Compares a stored user row with the test user and counts how many columns have the same value.
    Special handling for the 'Attributes' column: compares key-value pairs inside the dict.
    """
    count = 0

    for col in row.index:
        if col == "Attributes":
            try:
                # Convert string to dict
                row_attrs = ast.literal_eval(row[col]) if pd.notna(row[col]) else {}
                test_attrs = test_user.get("Attributes", {})

                if isinstance(test_attrs, str):
                    test_attrs = ast.literal_eval(test_attrs)

                for k in row_attrs:
                    if k in test_attrs and row_attrs[k] == test_attrs[k]:
                        count += 1
            except (ValueError, SyntaxError) as e:
                print(f"[Naive] Error parsing Attributes column for user {row.get('ID', 'Unknown')}: {e}")
        else:
            if pd.notna(row[col]) and row[col] == test_user.get(col):
                count += 1

    return count

def naive_search(users, user_to_test):
    """
    Compares a given user against a list of known users using a naive approach based on column matching.
    Returns the most similar known user if it meets the matching criteria.

    Parameters:
    - users (pd.DataFrame): A DataFrame containing all stored user records.
    - user_to_test (dict): The current user data as a dictionary.

    Returns:
    - list: A list containing:
        - bool: True if the user is considered known, False otherwise.
        - int: The number of matched columns.
        - int: The ID of the matched user (0 if new).
        - int: The log index of the matched user (0 if new).
    """

    max_match_couter = 0

    # Convert the test user to a Series for comparison
    user_to_test = pd.Series(user_to_test, index=users.columns)

    # Calculate number of matching columns for each stored user
    similarities = users.apply(count_similar_columns, axis=1, test_user=user_to_test)

    # Sort users by similarity (descending order)
    sorted_similarities = similarities.sort_values(ascending=False)
    sorted_users = users.loc[sorted_similarities.index]

    # Keys considered important for identifying the user even if full match is not achieved
    important_keys = ["Audio", "Geom Canvas", "TXT Canvas"]

    for index, user in sorted_users.iterrows():
        match_count = sorted_similarities[index]
        user_id = int(user["ID"])
        log_id = int(user["Log"])

        if match_count > max_match_couter:
            max_match_couter = match_count

        # Case 1: Full match found
        if match_count == MAX_MATCH:
            print(f"[NAIVE] Returning user {user_id} with {match_count} matches")
            return [True, int(match_count), user_id, log_id]

        # Case 2: Match based on at least one key attribute
        for key in important_keys:
            if key in user and user[key] == user_to_test.get(key):
                print(f"[NAIVE] Returning user {user_id} with {match_count} matches (matched on {key})")
                return [True, int(match_count), user_id, log_id]
        
        # Case 3: User does not match any important keys but has some other matches
        if match_count > THRESHOLD:
            print(f"[NAIVE] Returning user {user_id} with {match_count} matches (no important keys matched)")
            return [True, int(match_count), user_id, log_id]


    # Case 4: No matches found
    print(f"[NAIVE] New user - maximum {max_match_couter} matches")
    return [False, 0, 0, 0]

def naive(users, curr_user):
    """
    Entry point function for naive matching strategy.

    Parameters:
    - users (pd.DataFrame): All stored users.
    - curr_user (dict): The current user being checked.

    Returns:
    - list: Result of the naive search.
    """
    return naive_search(users, curr_user)
