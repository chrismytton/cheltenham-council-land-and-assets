import maplibregl from 'maplibre-gl';
import * as pmtiles from "pmtiles";
import layers from 'protomaps-themes-base';
import Spiderfy from '@nazka/map-gl-js-spiderfy';

let protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

function inIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

console.log(layers("protomaps", "light"));

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
          clusterMaxZoom: 18,
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
    // Get all layers from the protomaps source
    const layers = map.getStyle().layers.filter(layer => layer.source === 'protomaps');
    console.log(layers);

    // Get source data from protomaps source
    const source = map.getSource('protomaps');
    console.log(source);

    map.loadImage(
      'https://raw.githubusercontent.com/nazka/map-gl-js-spiderfy/dev/demo/img/circle-yellow.png',
      (error, image) => {
        if (error) throw error;
        map.addImage('cluster', image);

        map.addLayer({
          'id': 'markers',
          'type': 'symbol', // must be symbol
          'source': 'cheltenham_council_land_and_assets_2021',
          'layout': {
            'icon-image': 'cluster',
            'icon-allow-overlap': true // recommended
          }
        });

        map.addLayer({
          "id": "counters",
          "type": "symbol",
          "source": "cheltenham_council_land_and_assets_2021",
          "layout": {
            "text-field": ["get", "point_count"],
            "text-size": 12,
            "text-allow-overlap": true,
            "text-font": ["Roboto Regular"]
          }
        });

        function onClickHandler(feature) {
          const coordinates = feature.geometry.coordinates.slice();

          let popup = '<table>';
          for (const [key, value] of Object.entries(feature.properties)) {
            popup += `<tr><td><b>${key}</b></td><td>${value}</td></tr>`;
          }
          popup += '</table>';

          new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(popup)
            .addTo(map);
        }

        map.on('click', 'markers', (e) => {
          const feature = e.features[0];
          if (!feature.properties.cluster_id) {
            onClickHandler(feature);
          }
        });

        let pointer = () => { map.getCanvas().style.cursor = 'pointer' }
        let clearPointer = () => { map.getCanvas().style.cursor = '' }

        map.on('mouseenter', 'markers', pointer);
        map.on('mouseleave', 'markers', clearPointer);

        const spiderfy = new Spiderfy(map, {
          onLeafClick: onClickHandler,
          onLeafHover: (feature) => {
            if (feature) {
              pointer();
            } else {
              clearPointer();
            }
          },
          minZoomLevel: 18,
          zoomIncrement: 2,
          closeOnLeafClick: false
        }); // create a new spiderfy object

        spiderfy.applyTo('markers'); // apply to a cluster layer
    });
  });
}

main();
