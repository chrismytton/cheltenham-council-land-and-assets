SELECT AssetCode AS id,
  UPRN AS uprn,
  Organisation AS org,
  OrganisationLabel AS org_label,
  PropertyName AS property,

  -- StreetName has some carriage returns and line feeds in it, so we need to clean it up.
  TRIM(
    REPLACE(
      REPLACE(StreetName, CHAR(13), ' '),
      CHAR(10),
      ' '
    )
  ) AS street,

  PostTown AS town,

  -- Postcode has some carriage returns and line feeds in it, so we need to clean it up.
  REPLACE(
    REPLACE(TRIM(Postcode), CHAR(13), ''),
    CHAR(10),
    ''
  ) AS postcode,

  -- Clean up and combine the tenure columns.
  REPLACE(TenureType, CAST(X'a0' AS TEXT), '') || ' - ' || TRIM(TenureDetail) as tenure,

  HoldingType AS holding,

  -- Convert the GeoX and GeoY columns to a geometry.
  Transform(
    SetSRID(
      MakePoint(CAST(GeoX AS INTEGER), CAST(GeoY AS INTEGER)),
      27700
    ),
    4326
  ) AS geom

FROM local_authority_land_and_assets_2021

-- Only include rows where we have a valid geometry.
WHERE GeoX != '' AND GeoY != ''
