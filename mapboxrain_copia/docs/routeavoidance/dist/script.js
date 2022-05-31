mapboxgl.accessToken = 'pk.eyJ1IjoiaWFyYWtpc3RhaW4iLCJhIjoiY2podnY0cWs5MTAyaTNrbnY3MnR5OHJ0bSJ9.aOqeUPZkBISqt1UKpmmX7g';

      const map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/mapbox/light-v10',
        center: [-84.5, 38.05], // starting position
        zoom: 11 // starting zoom
      });

      const directions = new MapboxDirections({
        accessToken: mapboxgl.accessToken,
        unit: 'metric',
        profile: 'mapbox/driving',
        alternatives: 'false',
        geometries: 'geojson'
      });

      map.scrollZoom.enable();
      map.addControl(directions, 'top-right');

      const clearances = {
        'type': 'FeatureCollection',
        'features': [
          {
            'type': 'Feature',
            'geometry': {
              'type': 'Point',
              'coordinates': [-84.47426, 38.06673]
            },
            'properties': {
              'clearance': "13' 2"
            }
          },
          {
            'type': 'Feature',
            'geometry': {
              'type': 'Point',
              'coordinates': [-84.47208, 38.06694]
            },
            'properties': {
              'clearance': "13' 7"
            }
          },
          {
            'type': 'Feature',
            'geometry': {
              'type': 'Point',
              'coordinates': [-84.47184, 38.06694]
            },
            'properties': {
              'clearance': "13' 7"
            }
          },
          {
            'type': 'Feature',
            'geometry': {
              'type': 'Point',
              'coordinates': [-84.60485, 38.12184]
            },
            'properties': {
              'clearance': "13' 7"
            }
          },
          {
            'type': 'Feature',
            'geometry': {
              'type': 'Point',
              'coordinates': [-84.61905, 37.87504]
            },
            'properties': {
              'clearance': "12' 0"
            }
          },
          {
            'type': 'Feature',
            'geometry': {
              'type': 'Point',
              'coordinates': [-84.55946, 38.30213]
            },
            'properties': {
              'clearance': "13' 6"
            }
          },
          {
            'type': 'Feature',
            'geometry': {
              'type': 'Point',
              'coordinates': [-84.27235, 38.04954]
            },
            'properties': {
              'clearance': "13' 6"
            }
          },
          {
            'type': 'Feature',
            'geometry': {
              'type': 'Point',
              'coordinates': [-84.27264, 37.82917]
            },
            'properties': {
              'clearance': "11' 6"
            }
          }
        ]
      };

      const obstacle = turf.buffer(clearances, 0.25, { units: 'kilometers' });

      map.on('load', () => {
        map.addLayer({
          id: 'clearances',
          type: 'fill',
          source: {
            type: 'geojson',
            data: obstacle
          },
          layout: {},
          paint: {
            'fill-color': '#f03b20',
            'fill-opacity': 0.5,
            'fill-outline-color': '#f03b20'
          }
        });

        // Create sources and layers for the returned routes.
        // There will be a maximum of 3 results from the Directions API.
        // We use a loop to create the sources and layers.
        for (let i = 0; i < 3; i++) {
          map.addSource(`route${i}`, {
            type: 'geojson',
            data: {
              type: 'Feature'
            }
          });

          map.addLayer({
            id: `route${i}`,
            type: 'line',
            source: `route${i}`,
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#cccccc',
              'line-opacity': 0.5,
              'line-width': 13,
              'line-blur': 0.5
            }
          });
        }
      });

      directions.on('route', (event) => {
        const reports = document.getElementById('reports');
        reports.innerHTML = '';
        const report = reports.appendChild(document.createElement('div'));
        // Add IDs to the routes
        const routes = event.route.map((route, index) => ({
          ...route,
          id: index
        }));

        // Hide all routes by setting the opacity to zero.
        for (let i = 0; i < 3; i++) {
          map.setLayoutProperty(`route${i}`, 'visibility', 'none');
        }

        for (const route of routes) {
          // Make each route visible, by setting the opacity to 50%.
          map.setLayoutProperty(`route${route.id}`, 'visibility', 'visible');

          // Get GeoJSON LineString feature of route
          const routeLine = polyline.toGeoJSON(route.geometry);

          // Update the data for the route, updating the visual.
          map.getSource(`route${route.id}`).setData(routeLine);

          const isClear = turf.booleanDisjoint(obstacle, routeLine) === true;

          const collision = isClear ? 'is good!' : 'is bad.';
          const emoji = isClear ? '✔️' : '⚠️';
          const detail = isClear ? 'does not go' : 'goes';
          report.className = isClear ? 'item' : 'item warning';

          if (isClear) {
            map.setPaintProperty(`route${route.id}`, 'line-color', '#74c476');
          } else {
            map.setPaintProperty(`route${route.id}`, 'line-color', '#de2d26');
          }

          // Add a new report section to the sidebar.
          // Assign a unique `id` to the report.
          report.id = `report-${route.id}`;

          // Add the response to the individual report created above.
          const heading = report.appendChild(document.createElement('h3'));

          // Set the class type based on clear value.
          heading.className = isClear ? 'title' : 'warning';
          heading.innerHTML = `${emoji} Route ${route.id + 1} ${collision}`;

          // Add details to the individual report.
          const details = report.appendChild(document.createElement('div'));
          details.innerHTML = `This route ${detail} through an avoidance area.`;
          report.appendChild(document.createElement('hr'));
        }
      });