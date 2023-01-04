SELECT AssetCode as id,
  UPRN as uprn,
  Organisation as org,
  OrganisationLabel as org_label,
  PropertyName as property,

  -- StreetName has some carriage returns and line feeds in it, so we need to clean it up.
  TRIM(
    REPLACE(
      REPLACE(StreetName, CHAR(13), ' '),
      CHAR(10),
      ' '
    )
  ) as street,

  PostTown as town,

  -- Postcode has some carriage returns and line feeds in it, so we need to clean it up.
  REPLACE(
    REPLACE(TRIM(Postcode), CHAR(13), ''),
    CHAR(10),
    ''
  ) as postcode,

  -- Clean up and combine the tenure columns.
  REPLACE(TenureType, CAST(X'a0' AS TEXT), '') || ' - ' || TRIM(TenureDetail) as tenure,

  HoldingType as holding,

  -- Convert the GeoX and GeoY columns to a geometry.
  Transform(
    SetSRID(
      MakePoint(CAST(GeoX as INTEGER), CAST(GeoY AS INTEGER)),
      27700
    ),
    4326
  ) as geom

from local_authority_land_and_assets_2021
