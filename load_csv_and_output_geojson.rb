require 'pg'
require 'csv'

# Connect to the database
conn = PG.connect(dbname: "cheltenham_data")

# Create a new table
conn.exec("CREATE TABLE IF NOT EXISTS land_and_assets (
  id serial PRIMARY KEY,
  Organisation text,
  OrganisationLabel text,
  UPRN text,
  AssetCode text UNIQUE,
  PropertyName text,
  StreetName text,
  PostTown text,
  PostCode text,
  GeoX float,
  GeoY float,
  TenureType text,
  TenureDetail text,
  HoldingType text,
  coordinates geography(POINT, 4326)
)")

# Expand the path to the CSV file
csv_file = File.expand_path(ARGV[0])

warn "Loading CSV file #{csv_file}"

def tidy(str) = str.to_s.gsub(/(\r|\n)/, " ").strip

# Copy the CSV file into the table
csv = CSV.read(csv_file, encoding: "iso-8859-1:UTF-8", headers: true)
csv.each do |row|
  # Prepare the row for insertion
  row = row.map { |k, v| [k, tidy(v)] }.to_h

  # Skip this row if GeoX or GeoY is empty
  if row["GeoX"].to_s.empty? || row["GeoY"].to_s.empty?
    warn "GeoX or GeoY is empty for row #{row}"
    next
  end

  sql = "INSERT INTO land_and_assets (Organisation, OrganisationLabel, UPRN, AssetCode, PropertyName, StreetName, PostTown, PostCode, GeoX, GeoY, TenureType, TenureDetail, HoldingType) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)"

  begin
    # Insert the row into the table
    conn.exec(sql, row.values_at("Organisation", "OrganisationLabel", "UPRN", "AssetCode", "PropertyName", "StreetName", "PostTown", "PostCode", "GeoX", "GeoY", "TenureType", "TenureDetail", "HoldingType"))
    warn "Row #{row["AssetCode"]} inserted"
  rescue PG::UniqueViolation
    # If the row already exists, skip it
    warn "Row #{row["AssetCode"]} already exists"
  end
end

# Update the coordinates column
conn.exec("UPDATE land_and_assets SET coordinates = ST_Transform(ST_SetSRID(ST_MakePoint(GeoX, GeoY), 27700), 4326)")

sql = "SELECT json_build_object(
  'type',     'FeatureCollection',
  'features', json_agg(feature)
) AS geojson
FROM (
SELECT json_build_object(
  'type',       'Feature',
  'id',         AssetCode,
  'geometry',   ST_AsGeoJSON(coordinates)::json,
  'properties', json_build_object(
    'organisation', organisation,
    'organisationlabel', organisationlabel,
    'uprn', uprn,
    'assetcode', assetcode,
    'propertyname', propertyname,
    'streetname', streetname,
    'posttown', posttown,
    'postcode', postcode,
    'tenuretype', tenuretype,
    'tenuredetail', tenuredetail,
    'holdingtype', holdingtype
  )
) AS feature
FROM (SELECT * FROM land_and_assets) row) features;"

result = conn.exec(sql)

puts result.first['geojson']

# Close the connection
conn.close
