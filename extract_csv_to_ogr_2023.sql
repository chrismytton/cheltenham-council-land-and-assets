SELECT AssetCode AS id,
  UPRN AS uprn,
  Organisation AS org,
  "Organisation Label" AS org_label,
  "Site Address" AS address,

  -- Clean up and combine the tenure columns.
  REPLACE(TenureType, CAST(X'a0' AS TEXT), '') as tenure,
  TRIM("Tenure Detail") as tenure_detail,

  "Holding Type" AS holding,

  -- Convert the GeoX and GeoY columns to a geometry.
  Transform(
    SetSRID(
      MakePoint(CAST(GeoX AS INTEGER), CAST(GeoY AS INTEGER)),
      27700
    ),
    4326
  ) AS geom

FROM local_authority_land_and_assets_2023

-- Only include rows where we have a valid geometry.
WHERE GeoX != '' AND GeoY != ''
