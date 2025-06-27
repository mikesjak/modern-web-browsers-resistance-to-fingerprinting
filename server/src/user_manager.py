from data_manager import prepare_user_data, save_new_user, save_user_data
from naive import count_similar_columns

"""
user_manager.py: This script is responsible for managing user data within the system. It handles user logs, saving new users, and updating existing users based on their fingerprints and attributes. 
The script uses naive and complex matching results to determine if a user is new or returning, and it handles log saving accordingly.

Functions:
- get_next_log: Determines the next available log number for a given user by checking their existing logs.
- handle_user_log_saving: Handles saving user data for a specific log entry.
- handle_saving_user: Decides whether the user is new or returning, and saves the user data accordingly.
"""

FILEPATH = "../fp_data.csv"

def get_next_log(users, user, id):
    """
    Determines the next log number and the index of the user in the users list.
    It checks how many logs a user has and returns the next log number and the index of the user.

    Parameters:
    - users (pd.DataFrame): A DataFrame containing all stored user records.
    - user (dict): The current user data to be processed.
    - id (int): The ID of the user to find the next log number for.

    Returns:
    - tuple: A tuple containing the log number (int) and the index of the user in the DataFrame (int).
    """
    log_counter = 0
    index_counter = 0
    flag = False
            
    # Loop through the users to find the user with the given ID and count their logs
    for index, user in users.iterrows():
        if flag and user["ID"] != id:
            break
        
        index_counter += 1
        if user["ID"] != id:
            continue
        if user["ID"] == id:
            log_counter += 1
            flag = True
    
    return log_counter, index_counter

def handle_user_log_saving(users, user_data, id):
    """
    Handles the saving of user data for a specific log entry. This involves preparing the data and calling the save function.
    
    Parameters:
    - users (pd.DataFrame): A DataFrame containing all stored user records.
    - user_data (dict): The current user data to be saved.
    - id (int): The ID of the user for whom the log is being created.
    """
    log_counter, index_counter = get_next_log(users, user_data, id)
    log = log_counter
    
    print(f"[RECEIVER] Creating Log:{log} for UID:{id}")
    user_data = prepare_user_data(user_data, id, log)
    save_user_data(user_data, FILEPATH)

def handle_saving_user(users, user_data, res_naive, res_complex):
    """
    Handles saving a new or returning user based on the results of naive and complex matching.
    If the user is new, their data is saved. If they are returning, their log is updated.
    
    Parameters:
    - users (pd.DataFrame): A DataFrame containing all stored user records.
    - user_data (dict): The current user data to be processed.
    - res_naive (list): The result of the naive matching process.
    - res_complex (list): The result of the complex matching process.
    """
    res = False
    if len(users) > 0:
        res = (res_naive[0] or res_complex[0])
    
    # New user case
    if not res:
        print("[RECEIVER] SAVE NEW USER")
        
        # Assign ID based on the last user ID in the database
        if len(users) > 0:
            id = int(users.iloc[len(users)-1]["ID"]) + 1
        else:
            id = 0
            
        user_data = prepare_user_data(user_data, id, 0)
        save_new_user(user_data)

    # Exact match found
    elif res_naive[0] and res_naive[1] == 8:
        print(f"[RECEIVER] Exact match with ID:{res_naive[2]}, Log:{res_naive[3]}")  

    # Returning user with a change in fingerprint (4 possible states)
    elif res_naive[0] and res_complex[0] and res_naive[2] == res_complex[1]:
        print(f"[RECEIVER] match with - {res_naive[2]}")
        handle_user_log_saving(users, user_data, res_naive[2])
        
    elif res_naive[0] and res_complex[0] and res_naive[2] != res_complex[1]:
        print(f"[RECEIVER] Naive and Complex mismatch - {res_naive[2]} {res_complex[1]}")
        
        # Handle discrepancy between naive and complex results
        naive_founds = users[users["ID"] == res_naive[2]]
        complex_founds = users[users["ID"] == res_complex[1]]
        
        naive_similarities = naive_founds.apply(count_similar_columns, axis=1, test_user=user_data)
        complex_similarities = complex_founds.apply(count_similar_columns, axis=1, test_user=user_data)
        
        # Compare similarities to decide which matching method is more accurate
        naive_sorted_similarities = naive_similarities.sort_values(ascending=False)
        complex_sorted_similarities = complex_similarities.sort_values(ascending=False)
        
        if naive_sorted_similarities.iloc[0] >= complex_sorted_similarities.iloc[0]:
            print("[RECEIVER] Naive was more accurate!")
            id = int(naive_sorted_similarities.index[0])
        else:
            print("[RECEIVER] Complex was more accurate!")
            id = int(complex_sorted_similarities.index[0, 1])
        
        handle_user_log_saving(users, user_data, id)
        
    # Naive found a match but complex didn't
    elif res_naive[0] and not res_complex[0]:
        print(f"[RECEIVER] Naive found match with - {res_naive[2]}")
        id = res_naive[2]
        handle_user_log_saving(users, user_data, id)        
        
    # Complex found a match but naive didn't
    elif res_complex[0] and not res_naive[0]:
        print(f"[RECEIVER] Complex found match with - {res_naive[2]}")
        id = res_complex[1]
        handle_user_log_saving(users, user_data, id)
