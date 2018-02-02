require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/config",
  "dojo/domReady!"
], function(
  Map,
  MapView,
  FeatureLayer,
  esriConfig) {
  
  esriConfig.request.corsEnabledServers.push("services.arcgis.com");
  
  let extent = [4.5840346813197375, 46.06484916473661];
  let myRenderer = {
    type: "simple", 
    symbol: {
      type: "simple-fill", 
      color: "purple",
      outline: {
        color: [128, 128, 128],
        width: 1
      }
    }
  };
  let layer = new FeatureLayer({url:"https://services.arcgis.com/OMbfIFNCWRclU5sp/arcgis/rest/services/Region/FeatureServer/0", renderer: myRenderer, outFields: ["*"] });
  let map = new Map( { basemap: "dark-gray", layers: [layer] } );
  let viewOptions = { container: "mapview", map: map, center: extent, zoom: 5 };
  let view = new MapView( viewOptions );
  let rects;
  let mapview = document.getElementById("mapview");
  
  function createChart() {
    let chart = new Cedar({
    "type": "bar",
    "datasets": [{
      "url":  "https://services.arcgis.com/OMbfIFNCWRclU5sp/arcgis/rest/services/Region/FeatureServer/0",
      "query": {
        "orderByFields": "Shape__Area DESC"
      }
    }],
    "series": [
      {
        "category": {"field":"NOM_REGION","label":"Nom région"},
        "value": {"field":"Shape__Area","label":"Superficie"}
      }
    ]
  });
  chart.show({
    elementId: '#chart',
  });
  chart.override = {
    "height": 400,
    "marks": [{"properties": {
      "hover": {"fill": {"value": "aqua"}},
      "update": {"fill": {"value": "purple"}}}}]};
  }
  
  function linkGraphToMap() {
    
    rects = document.querySelectorAll(".mark-rect > rect");
    let svgMap = document.querySelector("svg");
    let graphicList = svgMap.querySelectorAll("path");//
    let regionList = document.querySelector(".mark-text");
    let regions = regionList.querySelectorAll("text");
    
    for (let i = 0; i < regions.length; i++) {
      
      let txt =  regions[i].textContent.toLowerCase();
      let rectangle = rects[i];
      let graphic = graphicList[i];
      
      rectangle.setAttribute("region", txt);
      graphic.setAttribute("region", txt);
      
      rectangle.onmouseenter = function() {
       graphic.classList.add("aqua");
      };
      
      rectangle.onmouseleave = function() {
        graphic.classList.remove("aqua");
      };
   }
  }
      
  layer
    .when(createChart);
  
  setTimeout(linkGraphToMap, 4000);
  
  // Set up an event handler for pointer-down (mobile)
  // and pointer-move events (mouse)
  // and retrieve the screen x, y coordinates
  view.on("pointer-move", eventHandler);
  view.on("pointer-down", eventHandler);
  
  function eventHandler(event) {
    // the hitTest() checks to see if any graphics in the view
    // intersect the given screen x, y coordinates
    view.hitTest(event)
      .then(getGraphics);
 }

  function getGraphics(response) {
    
    // the topmost graphic from the layer
    // and display select attribute values from the
    // graphic to the user
    if (response.results.length) {
      
      let graphic = response.results.filter(function(result) {
        return result.graphic.layer === layer;
      })[0].graphic;
      //console.log(graphic);
      
      let attributes = graphic.attributes;
      let nameRegion = attributes.NOM_REGION;
      
      for (let i = 0; i < rects.length; i++) {
      
        let rectangle = rects[i];
        
        //console.log(rectangle.getAttribute("region"));

        if (rectangle.getAttribute("region") === nameRegion.toLowerCase()) {
          
          rectangle.style.fill = "aqua";
          //continue;
        }
        else if (rectangle.getAttribute("region") !== nameRegion.toLowerCase())
        {
          rectangle.style.fill = "purple";
          //continue;
        }/**/
        
    };
      
    mapview.onmouseleave = function() {
      layer.renderer = myRenderer;
      for (let i = 0; i < rects.length; i++) {
        rects[i].style.fill = "purple";
      } /**/
    }
    
    let myRenderer2 = {
        type: "unique-value",
        field: "NOM_REGION",
        defaultSymbol: layer.renderer.symbol || layer.renderer.defaultSymbol,
        uniqueValueInfos: [{ 
          value: nameRegion,
          symbol: {
            type: "simple-fill", 
            color: "aqua",
            outline: {
              color: [128, 128, 128],
              width: 1
            }
          }
        }]        
      };
    layer.renderer = myRenderer2;
    }
  }
 
});