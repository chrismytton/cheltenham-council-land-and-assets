import csv
from collections import Counter

def analyze_file(filename):
    with open(filename, "r", encoding="latin-1") as f:
        reader = csv.DictReader(f)
        holdings = Counter()
        tenures = Counter()
        tenure_details = Counter()
        total = 0
        for row in reader:
            holding_type = row.get("HoldingType") or row.get("Holding Type")
            tenure_type = row.get("TenureType") or row.get("TenureType")
            tenure_detail = row.get("TenureDetail") or row.get("Tenure Detail")
            if holding_type:
                holdings[holding_type.strip()] += 1
            if tenure_type:
                tenures[tenure_type.strip()] += 1
            if tenure_detail:
                tenure_details[tenure_detail.strip()] += 1
            total += 1
        return holdings, tenures, tenure_details, total

# Get 2023 data
h23, t23, td23, total23 = analyze_file("local_authority_land_and_assets_2023.csv")

print("2023 Holdings Analysis")
print("=" * 50)
print(f"Total properties: {total23}\n")

# Group similar categories
groups = {
    "Open Spaces": ["Open Space Land and Allottments", "Parks, Gardens and open space"],
    "Commercial & Industrial": ["Commercial", "Industrial", "Depot Industrial"],
    "Transport & Infrastructure": ["Car Parks", "Roads", "Bridges", "Street Furniture"],
    "Community & Cultural": ["Cultural Buildings Operational", "Cultural Buildings Non Operational", "Community Buildings", "Public Conveinences"],
    "Sports & Recreation": ["Recreational Land and Buildings", "Sports Facilities"],
    "Miscellaneous": ["Miscellaneous Non Operational", "Miscellaneous Operational"],
    "Other": ["Farmland and Farms", "Cemetery and Cremartoria", "Art", "Civic Regalia", "Other Land", "Offices", "Buildings Declared Surplus", "Land Declared Surplus"]
}

print("Holdings by Category:")
print("-" * 30)
for h, c in h23.most_common():
    percentage = (c / total23) * 100
    print(f"{h}: {c} ({percentage:.1f}%)")

print("\nHoldings by Group:")
print("-" * 30)
group_totals = Counter()

for group_name, categories in groups.items():
    group_total = sum(h23[cat] for cat in categories)
    group_totals[group_name] = group_total

for group_name, total in group_totals.most_common():
    percentage = (total / total23) * 100
    print(f"\n{group_name}: {total} ({percentage:.1f}%)")
    for category in groups[group_name]:
        if h23[category] > 0:
            cat_percentage = (h23[category] / total23) * 100
            print(f"  - {category}: {h23[category]} ({cat_percentage:.1f}%)")
