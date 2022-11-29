// Add console.log to check to see if our code is working.
console.log("working");

// We create the tile layer that will be the background of our map.
let streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    accessToken: API_KEY
});

// We create the tile layer that will be the background of our map.
let satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    accessToken: API_KEY
});

//Create outdoors tile layer to toggle at top right
let outdoorsMap = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    accessToken: API_KEY
});

//Create a base layer that holds all three maps. 
let baseMaps = {
    "Streets": streets, 
    "Satellite": satelliteStreets, 
    "Outdoors": outdoorsMap
};

//earthquake layer 
let earthquakes = new L.layerGroup(); 
//tectonic plate - step 1
let plates = new L.layerGroup(); 
//major quake 
let mquakes = new L.layerGroup(); 

//object to have both options available to toggle
let overlays = {
  Earthquakes: earthquakes, 
  Plates: plates,  
  "Major Events": mquakes
}; 

//create the map object with center, zoom level and default layer
let map = L.map('mapid', {
    center: [39.5, -98.5], 
    zoom: 3, 
    layers: [streets]
    }); 

// Then we add a control to the map that will allow the user to change which
// layers are visible.
L.control.layers(baseMaps, overlays ).addTo(map); 

//retrieve earthquake GeoJSON data 
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data) {
   //create a geoJson layer with retrieved data. 
   L.geoJson(data, {
    
  // We turn each feature into a circleMarker on the map.
    pointToLayer: function(feature, latlng) {
    //console.log(data); 
    return L.circleMarker(latlng);
    },
    style: styleInfo, 
    //create a popup for each marker to display 
    //magnitude and location 
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br> Location: " + feature.properties.place); 
    }
    }).addTo(earthquakes);
    //add the earthquake layer to the map. 
    earthquakes.addTo(map); 

    //create a legend control object 
    let legend = L.control({
      position: "bottomright"
    });

    // Then add all the details for the legend.
    legend.onAdd = function() {
      let div = L.DomUtil.create("div", "info legend");
      const magnitudes = [0, 1, 2, 3, 4, 5];
      const colors = [
        "#98ee00",
        "#d4ee00",
        "#eecc00",
        "#ee9c00",
        "#ea822c",
        "#ea2c2c"
      ];
      // Looping through  intervals to generate a label with a colored square for each interval.
      for (var i = 0; i < magnitudes.length; i++) {
        // console.log(colors[i]); //Uncomment for troubleshooting
        div.innerHTML +=
          "<i style='background: " + colors[i] + "'></i> " +
          magnitudes[i] + (magnitudes[i + 1] ? "&ndash;" + magnitudes[i + 1] + "<br>" : "+");
        }
      return div;
        };

      legend.addTo(map); 
 
    // This function returns the style data for each of the earthquakes we plot on
    // the map. We pass the magnitude of the earthquake into a function
    // to calculate the radius.
    function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag), 
      stroke: true,
      weight: 0.5

    };


    // This function determines the radius of the earthquake marker based on its magnitude.
  // Earthquakes with a magnitude of 0 were being plotted with the wrong radius.

    function getRadius(magnitude) {
        if (magnitude === 0) {
          return 1;
        }
        return magnitude * 4;
      }
   

    // This function determines the color of the marker based on the magnitude of the earthquake.

    function getColor(magnitude) {
      if (magnitude > 5) {
        return "#ea2c2c";
      }
      if (magnitude > 4) {
        return "#ea822c";
      }
      if (magnitude > 3) {
        return "#ee9c00";
      }
      if (magnitude > 2) {
        return "#eecc00";
      }
      if (magnitude > 1) {
        return "#d4ee00";
      }
      return "#98ee00";
    }   
  }; 

  //Step 7 - style lines with a color and weight that make it stand out
  let plateStyle = {
    color: "white", 
    weight: 4
  }

  //pull tectonic plate information from GitHub 
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json").then(function(data) {
   
  let tPlate = [{
    "type": "Feature", 
    "geometry": {
      "type": "Polygon", 
      "coordinates": ["coordinates"] 
    }
  }]; 
  
  L.geoJSON(data , {
    pointToLayer: function(tPlate) {
      console.log(">>>>PLATE TEST<<<<"); 
      }, 
    style: plateStyle, 
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Plate Name:" + feature.properties.PlateName)
      
    }}).addTo(plates); 

    plates.addTo(map); 
  }); 

  function majorStyleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getMajorColor(feature.properties.mag),
      color: "#000000",
      radius: getMajorRadius(feature.properties.mag),//tells the code where to get the mag value 
      stroke: true,
      weight: 0.5
      };}
  
  //Function that defines radius of major quake layer. 
  function getMajorRadius(magnitude) {
    if (magnitude > 6) {
      return magnitude * 6;
      }; 
    if (magnitude > 5) {
    return magnitude * 5;
      }; 
    return magnitude * 3; 
  }; 

  //function that defines colors for major quake layer. 
  function getMajorColor(magnitude) { 
    if (magnitude>6) {
      return "#ea2c2c"; 
    }
    if (magnitude>5) {
      return "#ea822c"; 
    }
    return "#ee9c00";
  };

//Pull major quake information from USGS Site 
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson").then(function(data) {
  L.geoJson(data, {
      pointToLayer: function(feature, latlng) {
        //console.log ("Major Quake Data"); //Uncomment for troubleshooting
        return L.circleMarker(latlng); 
    },
    style: majorStyleInfo, 
    //create a popup for each marker to display 
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br> Location: " + feature.properties.place); 
    }    
  }).addTo(mquakes); 
  //console.log("Major Quake function testing") 
  //add major information to map and map the results.
  });
  mquakes.addTo(map);
});