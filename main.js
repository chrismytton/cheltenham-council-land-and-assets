import maplibregl from 'maplibre-gl';
import * as pmtiles from "pmtiles";
import layers from 'protomaps-themes-base';

let protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

function inIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

async function main() {
  // Initialize the map.
  const map = new maplibregl.Map({
    container: 'map',
    minZoom: 12,
    maxZoom: 18,
    center: {
      lat: 51.8986,
      lng: -2.0862
    },
    zoom: 13,
    hash: true,
    style: {
      version: 8,
      glyphs: 'https://cdn.protomaps.com/fonts/pbf/{fontstack}/{range}.pbf',
      sources: {
        "protomaps": {
          type: "vector",
          url: "pmtiles:///Cheltenham.pmtiles",
        },
        "cheltenham_council_land_and_assets_2021": {
          type: "geojson",
          data: "cheltenham_council_land_and_assets_2021.geojson",
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50
        }
      },
      layers: layers("protomaps", "light"),
    }
  });

  map.addControl(new maplibregl.NavigationControl());

  // Enable gesture handling in iframes
  if (inIframe()) {
    map.setCooperativeGestures(true);
  }

  // Add the data to the map
  map.on('load', function () {
    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'cheltenham_council_land_and_assets_2021',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bbd6',
          5,
          '#f1f075',
          10,
          '#f28cb1'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          5,
          30,
          10,
          40
        ]
      }
    });
    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'cheltenham_council_land_and_assets_2021',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['Barlow Regular'],
        'text-size': 12
      }
    });

    map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'cheltenham_council_land_and_assets_2021',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#11b4da',
        'circle-radius': 4,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff'
      }
    });

    map.on('click', 'clusters', function (e) {
      var features = map.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });
      var clusterId = features[0].properties.cluster_id;
      map.getSource('cheltenham_council_land_and_assets_2021').getClusterExpansionZoom(
        clusterId,
        function (err, zoom) {
          if (err) return;

          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom
          });
        }
      );
    });

    // When a click event occurs on a feature in
    // the unclustered-point layer, open a popup at
    // the location of the feature, with
    // description HTML from its properties.
    map.on('click', 'unclustered-point', (e) => {
      console.log(e.features);
      const coordinates = e.features[0].geometry.coordinates.slice();

      let popup = '<table>';
      for (const [key, value] of Object.entries(e.features[0].properties)) {
        popup += `<tr><td><b>${key}</b></td><td>${value}</td></tr>`;
      }
      popup += '</table>';

      new maplibregl.Popup()
        .setLngLat(coordinates)
        .setHTML(popup)
        .addTo(map);
    });

    let pointer = () => { map.getCanvas().style.cursor = 'pointer' }
    let clearPointer = () => { map.getCanvas().style.cursor = '' }

    map.on('mouseenter', 'clusters', pointer);
    map.on('mouseleave', 'clusters', clearPointer);

    map.on('mouseenter', 'unclustered-point', pointer);
    map.on('mouseleave', 'unclustered-point', clearPointer);
  });
}

main();
