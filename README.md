# Cheltenham Council Land and Asset data 2021

The data from Cheltenham Council's [Local authority land and assets open data](https://www.cheltenham.gov.uk/info/16/open_data/1190/local_authority_land_and_assets) in GeoJSON format, for use in mapping applications.

## Exploring the data

### Map

Since this is a dataset about places a map seemed like an obvious option for exploring the data.

Check out the [map showing all land and assets](https://www.chrismytton.com/cheltenham-council-land-and-assets/).

### Datasette

You can also [explore the data using Datasette Lite](https://lite.datasette.io/?url=https://github.com/chrismytton/cheltenham-council-land-and-assets/blob/main/cheltenham_council_land_and_assets_2021.sqlite#/cheltenham_council_land_and_assets_2021/land_and_assets), which allows you to query the data using SQL.

## Repository structure

The repository is structured as follows:

- [`local_authority_land_and_assets_2021.csv`](local_authority_land_and_assets_2021.csv) - The original CSV file from Cheltenham Council
- [`cheltenham_council_land_and_assets_2021.geojson`](cheltenham_council_land_and_assets_2021.geojson) - The GeoJSON file generated from the CSV file
- [`cheltenham_council_land_and_assets_2021.sqlite`](cheltenham_council_land_and_assets_2021.sqlite) - The SQLite database generated from the CSV file
- [`extract_csv_to_ogr.sql`](extract_csv_to_ogr.sql) - The SQL file ogr2ogr uses to generate the GeoJSON file
- [`bin/build`](bin/build) - A script to run ogr2ogr to generate the GeoJSON file
