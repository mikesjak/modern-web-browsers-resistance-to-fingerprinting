import csv
import os
import pandas as pd

# Standard fieldnames for the CSV structure
fieldnames = [
    "ID", "Log", 
    "Attributes", "AttributesHash", "Audio", 
    "Fonts", "Geom Canvas", "Media Capabilities",
    "MediaHash", "Name", "Plugins", "PluginsHash", 
    "TXT Canvas"
]

FILEPATH = "../fp_data.csv"

def user_from_string(line):
    """
    Parses a semicolon-separated key:value string into a dictionary.

    Example input: "ID: 1; Log: 0; Name: Jakub"
    """
    pairs = [pair.strip() for pair in line.split(';') if pair.strip()]
    user = {}
    for pair in pairs:
        if ':' in pair:
            key, value = pair.split(':', 1)
            user[key.strip()] = value.strip()
    return user

def prepare_user_data(user_data, id, log_count):
    """
    Adds ID and Log count to the user data dictionary.

    Parameters:
        user_data (dict): Raw user data.
        id (int): User ID.
        log_count (int): Log number.
    """
    new_user_data = {"ID": id, "Log": log_count}
    new_user_data.update({k: v for k, v in user_data.items() if k not in ['ID', 'Log']})
    return new_user_data

def check_file_existance(file_path):
    """
    Checks if a file exists and is not empty.
    """
    return os.path.isfile(file_path) and os.path.getsize(file_path) > 0

def write_user_to_file(user_data, file_path):
    """
    Writes a single user entry to a CSV file, creating headers if the file is new.
    """
    file_exists = check_file_existance(file_path)

    with open(file_path, mode='a', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        if not file_exists:
            writer.writeheader()
        writer.writerow(user_data)

def save_user_data(user_data, file_path):
    """
    Wrapper to save user data to a specified file.
    """
    write_user_to_file(user_data, file_path)

def save_new_user(user_data):
    """
    Saves user data to the default CSV file path.
    """
    file_path = FILEPATH
    write_user_to_file(user_data, file_path)

def load_users():
    """
    Loads all users from the CSV file, sorted by ID and Log.
    """
    file_path = FILEPATH
    if not check_file_existance(file_path):
        return []

    users = pd.read_csv(file_path)
    users = users.sort_values(by=["ID", "Log"])
    return users
