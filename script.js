var map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

function getColor(d) {
    return d > 80 ? '#006400' :
           d > 60 ? '#228B22' :
           d > 40 ? '#ADFF2F' :
           d > 20 ? '#FFFF00' :
           d > 10 ? '#FF4500' :
                    '#FF0000';
}

function style(feature) {
    // Se non ci sono dati di energia rinnovabile, rendi il paese trasparente
    let fillOpacity = feature.properties.renewables !== undefined ? 0.7 : 0; // Trasparente se non trovato
    return {
        fillColor: feature.properties.renewables !== undefined ? getColor(feature.properties.renewables) : '#FFFFFF', // Colore di default se non trovato
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: fillOpacity
    };
}

function onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.name) {
        layer.bindPopup("<strong>" + feature.properties.name + "</strong><br />" +
        "Energia Rinnovabile: " + (feature.properties.renewables !== undefined ? feature.properties.renewables + "%" : "Dati non disponibili"));
    }
}

// Funzione per aggiornare i dati delle energie rinnovabili
function updateRenewablesData(data, geoJsonData) {
    data.forEach(function(csvRow) {
        let countryName = csvRow[0];
        let renewableValue = parseFloat(csvRow[1]);

        geoJsonData.features.forEach(function(feature) {
            if (feature.properties.name === countryName) {
                feature.properties.renewables = renewableValue;
            }
        });
    });
}

// Carica i paesi e il CSV
Promise.all([
    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        }),
    fetch('stat_ren.csv')  // Cambia questo percorso con il percorso effettivo del tuo file CSV
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.text();
        })
])
.then(function([geoJsonData, csvText]) {
    // Usa PapaParse per leggere il CSV
    let parsedCSV = Papa.parse(csvText, { header: false });
    let csvData = parsedCSV.data;

    // Aggiorna i dati di energia rinnovabile con il CSV
    updateRenewablesData(csvData, geoJsonData);

    // Aggiungi il GeoJSON aggiornato alla mappa
    L.geoJson(geoJsonData, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);
})
.catch(function(error) {
    console.error('Error loading data:', error);
});

// Dati GeoJSON per gli stati degli Stati Uniti (puoi lasciarlo come prima)
var usStatesData = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": { "name": "California", "renewables": 45 },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [-124.4096, 41.991794],
                    [-120.0018, 41.991794],
                    [-120.0018, 36.578581],
                    [-114.8480, 36.578581],
                    [-114.8480, 32.534156],
                    [-124.4096, 32.534156],
                    [-124.4096, 41.991794]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": { "name": "Texas", "renewables": 20 },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [-106.645646, 36.500704],
                    [-93.508292, 36.500704],
                    [-93.508292, 25.837164],
                    [-106.645646, 25.837164],
                    [-106.645646, 36.500704]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": { "name": "Florida", "renewables": 15 },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [-87.6349, 30.3975],
                    [-79.9743, 30.3975],
                    [-79.9743, 24.3963],
                    [-87.6349, 24.3963],
                    [-87.6349, 30.3975]
                ]]
            }
        }
    ]
};
