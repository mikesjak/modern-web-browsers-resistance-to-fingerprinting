import sys
import os
import pandas as pd
import glob
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../server/src')))
from complex import complex
from farbling import test_farbling
import ast
import re

data_dir = "../data/browser_data/"
files = glob.glob(f"{data_dir}/*.csv")

# Filter out files that contain "Brave", "Tor", "Chrome", "Firefox", or "Safari"
# files = [f for f in files if "Brave" not in f]
# files = [f for f in files if "Tor" not in f]
# files = [f for f in files if "Chrome" not in f]
# files = [f for f in files if "Firefox" not in f]
# files = [f for f in files if "Safari" not in f]

stats = []

for file_path in files:
    print(f"Processing file: {file_path}")
    data = pd.read_csv(file_path)
    data = data.drop(columns=[col for col in ['ID', 'Log'] if col in data.columns])

    tp = 1  # First user is always true positive
    fp = 0
    fn = 0

    first_user = data.iloc[0].copy()
    first_user['ID'] = 0
    first_user['Log'] = 0
    
    if "Attributes" in first_user and isinstance(first_user["Attributes"], str):
        attr_str = first_user["Attributes"]
        attr_str = re.sub(r"\bnull\b", "None", attr_str)
        try:
            first_user["Attributes"] = repr(ast.literal_eval(attr_str))
        except Exception as e:
            print(f"Error parsing Attributes for first user: {e}")
            first_user["Attributes"] = repr({})
    
    known_users = pd.DataFrame([first_user])
    data = data.iloc[1:]

    for i in range(len(data)):
        test_user = data.iloc[i].to_dict()

        # Robustly parse Attributes
        if "Attributes" in test_user and isinstance(test_user["Attributes"], str):
            attr_str = test_user["Attributes"]
            # Replace 'null' with 'None' and single quotes with double quotes for ast.literal_eval
            attr_str = re.sub(r"\bnull\b", "None", attr_str)
            try:
                test_user["Attributes"] = ast.literal_eval(attr_str)
            except Exception as e:
                print(f"Error parsing Attributes for entry {i}: {e}")
                continue  # Skip this entry

        # Now check for required keys
        if not all(k in test_user["Attributes"] for k in ["Screen Width", "Screen Height", "CPU"]):
            print(f"Skipping entry {i}: missing required keys in Attributes")
            continue

        test_user["Attributes"]["Screen Width"] = int(test_user["Attributes"].get("Screen Width", 0))
        test_user["Attributes"]["Screen Height"] = int(test_user["Attributes"].get("Screen Height", 0))

        farbling_result = test_farbling(test_user["Attributes"])
        result = complex(known_users, test_user, farbling_result)

        test_user['ID'] = result[1]
        test_user['Log'] = 0

        # Convert Attributes back to string before storing
        test_user["Attributes"] = repr(test_user["Attributes"])
        known_users = pd.concat([known_users, pd.DataFrame([test_user])], ignore_index=True)

        if result[0]:  # Predicted as known
            if result[1] == 0:
                tp += 1
            else:
                fp += 1
        else:
            fn += 1

    stats.append({
        "file": file_path,
        "TP": tp,
        "FP": fp,
        "TN": 0,
        "FN": fn
    })

print("\nSummary for all files (counts):")
print(f"{'File':<40} {'TP':<6} {'FP':<6} {'TN':<6} {'FN':<6}")
print("-" * 60)

total_tp = total_fp = total_tn = total_fn = 0
total_samples = 0

# For percentage summary
percentages = []

for stat in stats:
    tp = stat['TP']
    fp = stat['FP']
    tn = stat.get('TN', 0)
    fn = stat['FN']
    total = tp + fp + tn + fn
    total_tp += tp
    total_fp += fp
    total_tn += tn
    total_fn += fn
    total_samples += total

    # Calculate percentages for this file
    if total > 0:
        tp_pct = tp / total * 100
        fp_pct = fp / total * 100
        tn_pct = tn / total * 100
        fn_pct = fn / total * 100
    else:
        tp_pct = fp_pct = tn_pct = fn_pct = 0.0

    percentages.append({
        "file": stat['file'],
        "TP%": tp_pct,
        "FP%": fp_pct,
        "TN%": tn_pct,
        "FN%": fn_pct,
        "count": total
    })

    print(f"{stat['file']:<40} {tp:<6} {fp:<6} {tn:<6} {fn:<6}")

print("\nSummary for all files (percentages):")
print(f"{'File':<40} {'TP%':<7} {'FP%':<7} {'TN%':<7} {'FN%':<7}")
print("-" * 60)

weighted_tp_pct = weighted_fp_pct = weighted_tn_pct = weighted_fn_pct = 0.0

for pct in percentages:
    print(f"{pct['file']:<40} {pct['TP%']:<7.2f} {pct['FP%']:<7.2f} {pct['TN%']:<7.2f} {pct['FN%']:<7.2f}")
    weighted_tp_pct += pct['TP%'] * pct['count']
    weighted_fp_pct += pct['FP%'] * pct['count']
    weighted_tn_pct += pct['TN%'] * pct['count']
    weighted_fn_pct += pct['FN%'] * pct['count']

if total_samples > 0:
    weighted_tp_pct /= total_samples
    weighted_fp_pct /= total_samples
    weighted_tn_pct /= total_samples
    weighted_fn_pct /= total_samples
    print("-" * 60)
    print(f"{'WEIGHTED AVG':<40} {weighted_tp_pct:<7.2f} {weighted_fp_pct:<7.2f} {weighted_tn_pct:<7.2f} {weighted_fn_pct:<7.2f}")

# Weighted averages for counts
if total_samples > 0:
    avg_tp = total_tp / total_samples
    avg_fp = total_fp / total_samples
    avg_tn = total_tn / total_samples
    avg_fn = total_fn / total_samples
    print("-" * 60)
    print(f"{'WEIGHTED AVG (counts)':<40} {avg_tp:<6.4f} {avg_fp:<6.4f} {avg_tn:<6.4f} {avg_fn:<6.4f}")

# Calculate per-file averages
num_files = len(stats)
avg_tp_val = total_tp / num_files if num_files else 0
avg_fp_val = total_fp / num_files if num_files else 0
avg_tn_val = total_tn / num_files if num_files else 0
avg_fn_val = total_fn / num_files if num_files else 0

avg_tp_pct = sum(p['TP%'] for p in percentages) / num_files if num_files else 0
avg_fp_pct = sum(p['FP%'] for p in percentages) / num_files if num_files else 0
avg_tn_pct = sum(p['TN%'] for p in percentages) / num_files if num_files else 0
avg_fn_pct = sum(p['FN%'] for p in percentages) / num_files if num_files else 0

# Table header
print("\nSummary Table (Averages):")
print(f"{'Metric':<10} {'Avg Value':<12} {'Avg %':<12} {'Weighted Avg %':<18}")
print("-" * 52)
print(f"{'TP':<10} {avg_tp_val:<12.2f} {avg_tp_pct:<12.2f} {weighted_tp_pct:<18.2f}")
print(f"{'FP':<10} {avg_fp_val:<12.2f} {avg_fp_pct:<12.2f} {weighted_fp_pct:<18.2f}")
print(f"{'TN':<10} {avg_tn_val:<12.2f} {avg_tn_pct:<12.2f} {weighted_tn_pct:<18.2f}")
print(f"{'FN':<10} {avg_fn_val:<12.2f} {avg_fn_pct:<12.2f} {weighted_fn_pct:<18.2f}")