# Cheltenham Council Land and Asset data

The data from Cheltenham Council's [Local authority land and assets open data](https://www.cheltenham.gov.uk/info/16/open_data/1190/local_authority_land_and_assets) in GeoJSON format, for use in mapping applications.

## Exploring the data

### Map

Since this is a dataset about places a map seemed like an obvious option for exploring the data.

Check out the [map showing all land and assets](https://www.chrismytton.com/cheltenham-council-land-and-assets/).

### Datasette

You can also [explore the data using Datasette Lite](https://lite.datasette.io/?url=https://github.com/chrismytton/cheltenham-council-land-and-assets/blob/bdf8976e4ba25a6a35174e0597ab3723c47682eb/cheltenham_council_land_and_assets_2021.sqlite#/cheltenham_council_land_and_assets_2021/land_and_assets), which allows you to query the data using SQL.

## Repository structure

The repository contains data for multiple years. For each year (YYYY), you'll find:

- `local_authority_land_and_assets_YYYY.csv` - The original CSV file from Cheltenham Council
- `cheltenham_council_land_and_assets_YYYY.geojson` - The GeoJSON file generated from the CSV file
- `cheltenham_council_land_and_assets_YYYY.sqlite` - The SQLite database generated from the CSV file
- `extract_csv_to_ogr_YYYY.sql` - Year-specific SQL file for processing the CSV data

Supporting files:
- `bin/build` - A script to run ogr2ogr to generate the GeoJSON and SQLite files

## Usage

To process data for a specific year:

```bash
# Example: Process 2021 data
./bin/build 2021

# Example: Process 2023 data
./bin/build 2023
```

Make sure you have the corresponding CSV file (e.g., `local_authority_land_and_assets_2023.csv`) in the repository root before running the build script.

### CSV Format Changes

The structure of the CSV files varies between years, so each year has its own SQL file:

- `extract_csv_to_ogr_2021.sql`: Handles the 2021 format with separate fields for address components
- `extract_csv_to_ogr_2023.sql`: Handles the 2023 format with combined address field and different column names
