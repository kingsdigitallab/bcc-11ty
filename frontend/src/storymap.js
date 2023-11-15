/*jshint esversion: 8 */
import { D3intro } from "./d3intro.js";

export class StoryMap {
  constructor(storyUris, L, d3) {
    this.overlay = null;
    // Data parameters
    this.storyUris = storyUris;
    this.map = null;
    this.L = L;
    this.d3 = d3;
    this.layerGroups = {};
    this.storyFrames = [];

    // Geojson feature types
    this.featureTypes = ["points", "lines", "polys"];

    // Map parameters
    this.mapMinZoom = 1;
    this.mapMaxZoom = 11;

    this.slideElementTagName = "article";
    this.topSlideElement = null;

    // Styles for Features
    // fillColor: '#ff7800', fill: true
    this.highlightLineStyle = {
      stroke: true,
      color: "#0000ff",
      weight: 5,
      opacity: 1,
    };

    // color: 'rgba(0,0,0,0)',
    this.defaultLineStyle = {
      stroke: true,
      color: "#ff0000",
      fillColor: "#ff0000",
      weight: 2,
      opacity: 0.6,
      fill: true,
    };

    // Slides for map features with include
    // rules, features, and frame
    this.slides = {};
    this.lastSlideDisplayed = null;

    // <article elements> on page
    this.slideElements = {};

    this.allFeatures = [];
    this.allFeaturesLayer = null;

    // Text features (e.g.) rivers info stored hers
    // So it can be added/changed by zoom
    this.textFeatures = {};
    this.textMinZoomLevel = 8;
    this.defaultTextAttributes = {
      fill: "black",
      "font-family": "EB Garamond, serif",
      "font-weight": "bold",
      dx: "15%",
    };
    this.initStyles();
    // Map lookup
    this.mapLookup = {
      1: "White, 1590",
      2: "Bleau, 1650",
      3: "Seller, 1676",
      4: "n/a",
      5: "Foster, 1677",
      6: "Moll, 1720",
      7: "Burghers, 1738",
      8: "Evans, 1752",
      9: "n/a",
      10: "Herbert, 1755",
      11: "Moll, 1755",
      12: "Mitchell, 1755",
      13: "Bowen, 1772",
      14: "Jeffreys, 1774",
      15: "Hutchins, 1778",
      16: "Cary,  1783",
      17: "Buell, 1784",
      18: "Russell, 1794",
      19: "Bradley, 1796",
    };

    // Explore/filter variables

    this.exploreFilterControl = {
      id: 0,
      fid: 0, // We should look at this
      sub_type: [[], [], [], [], [], [], [], [], [], [], [], [], []],
      maps: [],
      features: [],

      lines: {
        includes: {},
        excludes: {},
      },
      points: {
        includes: {},
        excludes: {},
      },
      polys: {
        includes: {},
        excludes: {},
      },
      excludes: {},
    };
    this.initExploreFilters();
  }

  initStyles() {
    // line Styles

    this.lineBorderStyle = {
      stroke: true,
      dashArray: "3 6",
      lineCap: "square",
      color: "#000000",
      weight: 2.5,
      fill: false,
    };
    this.lineLandRouteStyle = {
      stroke: true,
      dashArray: "7 6",
      lineCap: "square",
      lineJoin: "arcs",
      color: "#808080",
      weight: 3,
      fill: false,
    };
    this.lineSeaRouteStyle = {
      stroke: true,
      dashArray: "7 6",
      lineCap: "square",
      lineJoin: "arcs",
      color: "#ffbd59",
      weight: 3,
      fill: false,
    };
    this.lineRiverRouteStyle = {
      stroke: true,
      //smoothFactor:10,
      dashArray: "7 9",
      color: "#00c2cb",
      lineCap: "square",
      lineJoin: "round",
      weight: 2,
      fill: false,
      opacity: 0.1,
    };
    this.lineRiverRouteStyleLabel = {
      stroke: true,
      smoothFactor: 15,
      dashArray: "7 9",
      color: "#000000FF",
      lineCap: "square",
      lineJoin: "round",
      weight: 2,
      fill: false,
    };
    this.lineMiscStyle = {
      stroke: true,
      color: "#ffff00",
      weight: 4,
      fill: false,
    };
    this.lineToponymStyle = {
      stroke: true,
      color: "#ff0000",
      weight: 5,
      fill: false,
    };

    // Poly Styles
    this.polyBorderStyle = {
      stroke: true,
      dashArray: "4 6",
      color: "#000000",
      fillColor: "#000000",
      lineCap: "square",
      weight: 2,
      fill: true,
      opacity: 0.5,
      fillOpacity: 0.25,
    };
    this.polySettlementStyle = {
      stroke: true,
      dashArray: "2 6",
      lineCap: "square",
      lineJoin: "arcs",
      color: "#ff0000",
      fillColor: "#ff0000",
      weight: 2,
      fill: true,
      opacity: 0.75,
      fillOpacity: 0.5,
    };
    this.polySeaRouteStyle = {
      stroke: true,
      dashArray: "7 6",
      lineCap: "square",
      lineJoin: "arcs",
      color: "#ffbd59",
      fillColor: "#ffbd59",
      weight: 2,
      fill: true,
      opacity: 0.75,
      fillOpacity: 0.5,
    };
    this.polyDescriptiveStyle = {
      stroke: true,
      fillColor: "#ff0000",
      weight: 1,
      fill: true,
      opacity: 0.5,
      fillOpacity: 0.5,
    };

    this.polyRiverRouteStyle = {
      stroke: true,
      dashArray: "7 6",
      lineCap: "square",
      lineJoin: "arcs",
      color: "#00c2cb",
      fillColor: "#00c2cb",
      weight: 2,
      fill: true,
      opacity: 0.75,
      fillOpacity: 0.5,
    };
    this.polyMiscStyle = {
      stroke: true,
      fillColor: "#ff0000",
      weight: 1,
      fill: true,
      opacity: 0.5,
      fillOpacity: 0.5,
    };
    this.polyNativeStyle = {
      stroke: true,
      fillColor: "#ff0000",
      weight: 1,
      fill: true,
      opacity: 0.5,
      fillOpacity: 0.5,
    };
    this.polyEuroStyle = {
      stroke: true,
      fillColor: "#00ff00",
      weight: 1,
      fill: true,
      opacity: 0.5,
      fillOpacity: 0.5,
    };
    this.polyAnnoStyle = {
      stroke: true,
      dashArray: "10 10",
      lineCap: "square",
      lineJoin: "arcs",
      color: "#808080",
      fillColor: "#808080",
      weight: 1,
      fill: true,
      opacity: 1,
      fillOpacity: 0.5,
    };
    this.polyToponymStyle = {
      stroke: true,
      dashArray: "7 6",
      lineCap: "square",
      lineJoin: "arcs",
      color: "#ff0000",
      fillColor: "#ff0000",
      weight: 1,
      fill: true,
      opacity: 0.5,
      fillOpacity: 0.5,
    };
  }

  async loadShapeFile(shape_url) {
    let response = await fetch(shape_url);
    let json = await response.json();
    return json;
  }

  /**
   * Load all shape files asynchronously
   */
  async loadShapes(shape_urls) {
    let shapePromises = [];
    let shapeGeoJSON = [];
    let storyFeatures = [];

    for (let u = 0; u < shape_urls.length; u++) {
      shapePromises.push(this.loadShapeFile(shape_urls[u]));
    }
    await Promise.all(shapePromises).then((values) => {
      for (let v = 0; v < values.length; v++) {
        shapeGeoJSON.push(...values[v].features);
      }
    });

    // Arrange into stories and default layer
    for (let s = 0; s < shapeGeoJSON.length; s++) {
      let feature = shapeGeoJSON[s];
      if (feature.properties) {
        // add to all features
        this.allFeatures.push(feature);
        //if (feature.properties.story_link === story_id) {
        storyFeatures.push(feature);
        //}
      }
    }

    return storyFeatures;
  }

  async loadSlides() {
    if (this.storyUris && this.storyUris.slides) {
      let storySlides = await this.loadShapeFile(this.storyUris.slides);
      this.slides = storySlides.slides;
    }
  }

  getSlideById(slideid) {
    for (let s = 0; s < this.slides.length; s++) {
      if (this.slides[s].id == slideid) {
        return this.slides[s];
      }
    }
  }

  pointToLayer(feature, latlng) {
    switch (feature.properties.sub_type) {
      // Indigenous : Circle - Red - point down
      case 1:
        return this.L.circleMarker(latlng, {
          radius: 4,
          fillColor: "#0000ff",
          color: "#000",
          weight: 0.5,
          opacity: 1,
          fillOpacity: 1,
          bubblingMouseEvents: true,
        });
      // Settlement : Squares - dark green - point up
      case 4:
        // Capture Indig vs Haudenasnee
        switch (feature.properties.identity) {
          case 1:
            // European - Green Squre
            return new this.L.RegularPolygonMarker(latlng, {
              numberOfSides: 4,
              rotation: -45,
              radius: 5,
              //this.L.Path style options
              fill: true,
              fillColor: "#124d20",
              color: "#124d20",
              weight: 0.5,
              fillOpacity: 1,
              stroke: true,
              bubblingMouseEvents: true,
            });
          // Default - Indigenous Red circle - everything else
          default:
            return this.L.circleMarker(latlng, {
              radius: 5,
              fillColor: "#ff0000",
              color: "#ff000",
              weight: 0.5,
              opacity: 1,
              fillOpacity: 1,
              bubblingMouseEvents: true,
            });
        }
      // Land route -
      case 5:
        return this.L.circleMarker(latlng, {
          radius: 4,
          fillColor: "#0000ff",
          color: "#000",
          weight: 0.5,
          opacity: 1,
          fillOpacity: 1,
          bubblingMouseEvents: true,
        });

      // Sea route
      case 6:
        return this.L.circleMarker(latlng, {
          radius: 4,
          fillColor: "#ffbd59",
          color: "#ffbd59",
          weight: 0.5,
          opacity: 1,
          fillOpacity: 0.9,
          bubblingMouseEvents: true,
        });

      // Descriptive - white squares
      case 7:
        return new this.L.RegularPolygonMarker(latlng, {
          numberOfSides: 4,
          rotation: -45,
          radius: 5,
          //this.L.Path style options
          fill: true,
          fillColor: "#ffffff",
          color: "#000000",
          weight: 0.5,
          fillOpacity: 1,
          stroke: true,
          bubblingMouseEvents: true,
        });

      //River route
      case 8:
        return this.L.circleMarker(latlng, {
          radius: 4,
          fillColor: "#ff00ff",
          color: "#000",
          weight: 0.5,
          opacity: 1,
          fillOpacity: 1,
          bubblingMouseEvents: true,
        });

      // Miscellaneous
      case 9:
        return this.L.circleMarker(latlng, {
          radius: 4,
          fillColor: "#000000",
          color: "#000",
          weight: 0.5,
          opacity: 1,
          fillOpacity: 1,
          bubblingMouseEvents: true,
        });

      // Toponym
      // Purple - to differentiate!
      case 10:
        // Capture Indig vs Haudenasnee
        switch (feature.properties.identity) {
          case 1:
            return this.L.circleMarker(latlng, {
              radius: 5,
              fillColor: "#800080",
              color: "#800080",
              weight: 1,
              opacity: 1,
              fillOpacity: 0.6,
              bubblingMouseEvents: true,
            });
          default:
            return this.L.circleMarker(latlng, {
              radius: 5,
              fillColor: "#FFFF00",
              color: "#FFFF00",
              weight: 0.5,
              opacity: 1,
              fillOpacity: 1,
              bubblingMouseEvents: true,
            });
        }
      default:
        return this.L.circleMarker(latlng, {
          radius: 4,
          fillColor: "#000ff",
          color: "#oooff",
          weight: 0.5,
          opacity: 1,
          fillOpacity: 1,
          bubblingMouseEvents: true,
        });
    }
  }

  initStoryFeatureLayers() {
    for (let s = 0; s < this.slides.length; s++) {
      let slide = this.slides[s];
      slide.layer = this.L.geoJSON(slide.features, {
        // Stopping style override here
        //style: this.defaultLineStyle,
        pointToLayer: this.pointToLayer.bind(this),
        onEachFeature: this.onEachFeature.bind(this),
      });
    }
  }

  initAllFeaturesLayer() {
    this.allFeaturesLayer = this.L.geoJSON(this.allFeatures, {
      //style: this.defaultLineStyle,
      pointToLayer: this.pointToLayer.bind(this),
      onEachFeature: this.onEachFeature.bind(this),
    });
  }

  /**
   * Get all the slide html elements and sort them by their offset top
   * So we can track user scrolling and trigger map events
   */
  getSlideElements() {
    this.slideElements = Array.from(
      document.getElementsByTagName(this.slideElementTagName)
    );
    this.slideElements.sort(function (a, b) {
      if (a.offsetTop < 0) {
        return 1;
      }
      if (b.offsetTop < 0) {
        return -1;
      }
      return a.offsetTop - b.offsetTop;
    });
  }

  // Fade-in function for Leaflet
  fadeLayerLeaflet(lyr, startOpacity, finalOpacity, opacityStep, delay) {
    let opacity = startOpacity;
    setTimeout(function changeOpacity() {
      if (opacity < finalOpacity) {
        lyr.setStyle({
          opacity: opacity,
          fillOpacity: opacity,
        });
        opacity = opacity + opacityStep;
      }

      setTimeout(changeOpacity, delay);
    }, delay);
  }

  /**
   * Fly the map to the slide's storyframe
   * clear existing layers
   * add this slide's layer
   *
   * @param slideid slide to display
   */
  async triggerSlideMapEvents(slideid) {
    /* Trigger intros */
    //console.log(slideid);
    if (this.d3Intro.slideIds[slideid + ""]) {
      // This slide triggers an animated slide
      // Clear layers
      console.log(slideid);
      this.storyFeatureLayerGroup.clearLayers();
      this.d3Intro.SectionIntro(this.map, slideid, this.slides);
    } else
      if (slideid != "explore") {
      if (this.d3Intro.svgDrawn) {
        // Clear the svg overlay so we can replace with layers
        this.d3Intro.stopAll();
        this.d3Intro.clearSvg();
      }
      let slide = this.getSlideById(slideid);
      if (slide) {
        // Clear layers and text
        this.clearFeatureText();
        if (slide.layer) {
          this.storyFeatureLayerGroup.clearLayers();
        }

        // Move to bounds
        this.map.flyToBounds(this.getStoryFrameBounds(slide.fid));

        // Add new layer once move is finished
        if (slide.layer) {
          let slideUpdate = function () {
            slide.layer.setStyle({
              opacity: 0,
              fillOpacity: 0,
            });
            this.storyFeatureLayerGroup.addLayer(slide.layer);
            this.fadeLayerLeaflet(slide.layer, 0, 0.8, 0.2, 0.01);
            this.map.off("moveend", slideUpdate);
          }.bind(this);
          this.map.on("moveend", slideUpdate);
        }
        this.lastSlideDisplayed = slide;
      }
    } else if (slideid == "explore") {
      this.storyFeatureLayerGroup.clearLayers();
      this.loadExploreLayer();
    }
  }

  async initMap(lat, lng, zoom) {
    this.map = this.L.map("basemap", {
      scrollWheelZoom: false,
      zoomControl: false,
    });

    this.L.control
      .zoom({
        position: "bottomleft",
      })
      .addTo(this.map);

    // Establish baselayers group
    /*this.osmLayer = this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }).addTo(this.map);*/

    this.overlay = this.L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}",
      {
        minZoom: this.mapMinZoom,
        maxZoom: this.mapMaxZoom,
        attribution: "ESRI World Terrain",
        opacity: 1,
      }
    ).addTo(this.map);

    var worldTerrain = this.L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}",
      {
        minZoom: this.mapMinZoom,
        maxZoom: this.mapMaxZoom,
        attribution: "ESRI World Terrain",
        opacity: 1,
      }
    );

    var worldStreet = this.L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
      {
        minZoom: this.mapMinZoom,
        maxZoom: this.mapMaxZoom,
        attribution: "ESRI World Street Map",
        opacity: 1,
      }
    );

    var bcc = this.L.tileLayer(
      "https://api.mapbox.com/styles/v1/neiljakeman1000/cljyd364o006701pdgs7ec6qa/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibmVpbGpha2VtYW4xMDAwIiwiYSI6ImNqcGpoenBtdDA2aTczdnBmYjhsNGc5c2oifQ.vqIAnhyoZnnNeBsaNOzQGw",
      {
        tileSize: 512,
        zoomOffset: -1,
        minZoom: this.mapMinZoom,
        maxZoom: this.mapMaxZoom,
        attribution: "MapBox BCC",
        opacity: 1,
      }
    );

    var baseLayers = {
      "Clean Terrain": worldTerrain,
      BCC: bcc,
      "Modern Open Street Map": worldStreet,
    };

    // Create Layer Switcher

    this.L.control
      .layers(baseLayers, {}, { position: "bottomleft", collapsed: false })
      .addTo(this.map);

    // Initial view
    // This could be changed based on get string etc.
    this.map.setView([lat, lng], zoom);

    this.storyFeatureLayerGroup = this.L.layerGroup().addTo(this.map);

    await this.loadSlides();
    await this.loadStoryFrames();
    await this.loadFeatures();

    this.attachMapEvents();
    this.initStoryFeatureLayers();

    // All features layer used for building filtered layers
    this.initAllFeaturesLayer();

    this.getSlideElements();
    let observerTimeouts = {};
    /* This observer controls the scrolling behaviour:
                    - triggering slides and animations
                    - clearing the map layers and svg after a triggered slide is no longer visible
                    (Timeout is to stop fast scrolling triggering slides as it goes past)
                     */
    let observer = new IntersectionObserver(
      function (entries) {
        entries.forEach((entry) => {
          if (entry.isIntersecting === true && entry.target.dataset.slideid) {
            observerTimeouts[entry.target.dataset.slideid] = setTimeout(
              function () {
                entry.target.dataset.isActive = "true";
                this.triggerSlideMapEvents(entry.target.dataset.slideid);
              }.bind(this),
              1000
            );
          } else if (!entry.isVisible) {
            if (entry.target.dataset.slideid in observerTimeouts) {
              clearTimeout(observerTimeouts[entry.target.dataset.slideid]);
            }
            if (entry.target.dataset.isActive) {
              entry.target.removeAttribute("data-isActive");
              this.storyFeatureLayerGroup.clearLayers();
            }
            //console.log(entry);
          }
        });
      }.bind(this),
      {
        threshold: [0.5],
      }
    );

    //this.storyFeatureLayerGroup.addLayer(this.allFeaturesLayer);
    for (let s = 0; s < this.slideElements.length; s++) {
      observer.observe(this.slideElements[s]);
    }
    // Add intersection observer for filters
    observer.observe(document.getElementById("filters"));

    // Init our d3 intro class and pass relevant layer data
    this.d3Intro = new D3intro(this.storyUris, this.L, this.d3);
    this.d3Intro.homelandsSlide = this.getSlideById(102);
    this.d3Intro.pathways1Slide = this.getSlideById(1031);
    this.d3Intro.pathways2Slide = this.getSlideById(1032);
    this.d3Intro.villagerssettlersSlide = this.getSlideById(104);
    this.d3Intro.linesSlide.push(this.getSlideById(1051));
    this.d3Intro.linesSlide.push(this.getSlideById(1052));
    this.d3Intro.linesSlide.push(this.getSlideById(1053));
    this.d3Intro.linesSlide.push(this.getSlideById(1054));

    this.svg = await this.d3Intro.loadD3(this.map);
  }

  clearFeatureText() {
    this.storyFeatureLayerGroup.eachLayer(
      function (layer) {
        let features = layer._layers;
        for (let [key, feature] of Object.entries(features)) {
          let featureId = feature.feature.properties.id;
          if (key && this.textFeatures[featureId] && feature._text != null) {
            feature.setText(null);
          }
        }
      }.bind(this)
    );
  }

  /** Map level events such as zoom, used to update text levels
   *
   */
  attachMapEvents() {
    this.map.on(
      "zoomend",
      function () {
        let TextSize = this.map.getZoom() + 4 + "px";

        this.storyFeatureLayerGroup.eachLayer(
          function (layer) {
            if (this.clonedRiverLayer && layer == this.clonedRiverLayer) {
              let features = layer._layers;
              for (let [key, feature] of Object.entries(features)) {
                let featureId = feature.feature.properties.id;
                if (key && this.textFeatures[featureId]) {
                  feature.setText(null);
                  if (this.map.getZoom() >= this.textMinZoomLevel) {
                    let textAttributes = this.defaultTextAttributes;
                    textAttributes["font-size"] = TextSize;
                    feature.setText(this.textFeatures[featureId].text, {
                      orientation: this.textFeatures[featureId].orientation,
                      offset: 5,
                      center: true,
                      attributes: textAttributes,
                    });
                  }
                }
              }
            }
          }.bind(this)
        );
        //for (let x=0; x< this.storyFeatureLayerGroup.getLayers());
      }.bind(this)
    );
  }

  onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (
      (feature.properties &&
        (feature.properties.map_text || feature.properties.norm_text)) ||
      feature.properties.Name
    ) {
      if (feature.properties.map_text) {
        layer.bindPopup(feature.properties.map_text);
        if (feature.properties.date_yr) {
          layer.bindPopup(
            feature.properties.map_text +
              "</br><strong>" +
              this.mapLookup[feature.properties.map_source] +
              "</stong>"
          );
        }
      } else if (feature.properties.norm_text) {
        layer.bindPopup(feature.properties.norm_text);
        if (feature.properties.date_yr) {
          layer.bindPopup(
            feature.properties.norm_text +
              "</br><strong>" +
              this.mapLookup[feature.properties.map_source] +
              "</stong>"
          );
        }
      } else {
        layer.bindPopup(
          feature.properties.Name + "</br><strong>Native Land Data API</strong>"
        );
      }
    }
    switch (feature.geometry.type) {
      case "Point":
        // Do nothing - point styles are defined in pointToFeature
        break;
      // If polys
      case "MultiPolygon":
        switch (feature.properties.sub_type) {
          case 3:
            layer.setStyle(this.polyBorderStyle);
            break;
          case 4:
            layer.setStyle(this.polySettlementStyle);
            break;
          case 6:
            layer.setStyle(this.polySeaRouteStyle);
            break;
          case 7:
            layer.setStyle(this.polyDescriptiveStyle);
            break;
          case 8:
            layer.setStyle(this.polyRiverRouteStyle);
            break;
          case 9:
            layer.setStyle(this.polyMiscStyle);
            break;
          case 10:
            layer.setStyle(this.polyToponymStyle);
            break;
          case 11:
            // Capture Indig vs Haudenasnee
            switch (feature.properties.identity) {
              case 2:
                // Red poly
                layer.setStyle(this.polyNativeStyle);
                break;
              case 3:
                //Grey poly (Haudenasuanee)
                layer.setStyle(this.polyAnnoStyle);
                break;
              default:
                layer.setStyle(this.polyEuroStyle);
            }
            break;
        }
        break;
      // If lines
      case "MultiLineString":
        switch (feature.properties.sub_type) {
          case 3:
            layer.setStyle(this.lineBorderStyle);
            layer.setText(feature.properties.norm_text);
            break;
          case 5:
            layer.setStyle(this.lineLandRouteStyle);
            layer.setText(feature.properties.norm_text);
            break;
          case 6:
            layer.setStyle(this.lineSeaRouteStyle);
            layer.setText(feature.properties.norm_text);
            break;
          case 8:
            //this.clonedRiverLayer = cloneLayer(layer)
            //this.clonedRiverLayer.setStyle(lineRiverRouteStyleLabel).addTo(storyMap.map);
            layer.setStyle(this.lineRiverRouteStyle);

            /* this.textFeatures[feature.properties.id] = {
                                                                 orientation: testDirection(feature),
                                                                 text: feature.properties.norm_text
                                                             }*/

            /*layer.setText(feature.properties.norm_text,
                                                                {
                                                                    orientation: testDirection(feature), offset: 5, center: true,
                                                                    attributes: {
                                                                        'fill': 'black',
                                                                        'font-family': 'EB Garamond, serif',
                                                                        'font-weight': 'bold',
                                                                        'font-size': '7px',
                                                                        //'textLength': 300,
                                                                        //'lengthAdjust': 'spacing',
                                                                        'dx': '15%',
                                                                    }
                                                                }
                                                            );*/
            break;
          case 9:
            layer.setStyle(this.lineMiscStyle);
            layer.setText(feature.properties.norm_text);
            break;
          case 10:
            layer.setStyle(this.lineToponymStyle);
            layer.setText(feature.properties.norm_text);
            break;
        }
        break;
      default:
        layer.setStyle(this.defaultLineStyle);
    }
  }

  getStoryFrameBounds(fid) {
    for (let f = 0; f < this.storyFrames.length; f++) {
      if (this.storyFrames[f].FID == fid) {
        return this.storyFrames[f].bounds;
      }
    }
    return null;
  }

  /**
   * Load the story frame objects from json, convert the feature to bounds and
   * store to be added to slides later
   * @returns {Promise<void>}
   */
  async loadStoryFrames() {
    if (this.storyUris && this.storyUris.storyFrame) {
      let storyFrames = await this.loadShapeFile(this.storyUris.storyFrame); // loadShapes([this.storyFrame_uri]);

      for (let s = 0; s < storyFrames.features.length; s++) {
        let feature = storyFrames.features[s];
        let bounds = this.L.geoJson(feature.geometry).getBounds();
        this.storyFrames.push({
          FID: feature.properties.FID,
          feature: feature,
          bounds: bounds,
        });
      }
    }
  }

  /** Load separate feature files and assign to slides
   *
   * @returns {Promise<void>}
   */
  async loadFeatures() {
    if (this.storyUris && this.storyUris.lines) {
      // console.log(storyFeatures);
      let storyFeatures = await this.loadShapes([this.storyUris.lines]);

      for (let f = 0; f < storyFeatures.length; f++) {
        this.addFeatureToAllSlides("lines", storyFeatures[f]);
        // todo add feature to river labels group here
        // Then use this layer only
      }

      storyFeatures = await this.loadShapes([this.storyUris.points]);
      for (let f = 0; f < storyFeatures.length; f++) {
        this.addFeatureToAllSlides("points", storyFeatures[f]);
      }

      storyFeatures = await this.loadShapes([this.storyUris.polys]);
      for (let f = 0; f < storyFeatures.length; f++) {
        this.addFeatureToAllSlides("polys", storyFeatures[f]);
      }

      storyFeatures = await this.loadShapeFile([this.storyUris.indigenous]);

      for (let f = 0; f < storyFeatures.features.length; f++) {
        this.addFeatureToAllSlides("indigenous", storyFeatures.features[f]);
      }
    }
  }

  /** Add a single criteria value to our search filters */
  addSubtypeFilter(subtypeValue, filterValue, include) {
    //console.log(this.exploreFilterSlide[featureType]);
    if (
      this.exploreFilterControl.sub_type &&
      this.exploreFilterControl.sub_type.length >= filterValue
    ) {
      const index =
        this.exploreFilterControl.sub_type[subtypeValue].indexOf(filterValue);
      if (include && index < 0) {
        this.exploreFilterControl.sub_type[subtypeValue].push(filterValue);
      } else if (!include) {
        // Remove from array
        this.exploreFilterControl.sub_type[subtypeValue].splice(index, 1);
      }
    }

    /*if (this.exploreFilterControl[featureType]) {
    
              if (!this.exploreFilterControl[featureType].includes[criteria]) {
                this.exploreFilterControl[featureType].includes[criteria] = [];
              }
              const index =
                this.exploreFilterControl[featureType].includes[criteria].indexOf(
                  value
                );
              // If we're including and it isn't there already
              if (include && index < 0) {
                this.exploreFilterControl[featureType].includes[criteria].push(value);
              } else {
                // Remove
                // If value already in filters, turn off
    
                console.log(this.exploreFilterControl[featureType].includes.identity);
                // Special case for sub_type, don't remove if we still have identity values
                if (
                  index > -1 &&
                  (criteria != "sub_type" ||
                    !this.exploreFilterControl[featureType].includes.identity ||
                    this.exploreFilterControl[featureType].includes.identity.length ==
                      0)
                ) {
                  console.log(index);
    
                }
              }
            }*/
  }

  /**
   * Attach click events to control the explore controls
   *
   */
  initExploreFilters() {
    // Map filters
    let mapFilters = document.querySelectorAll("input.map_filter");
    if (mapFilters) {
      for (let f = 0; f < mapFilters.length; f++) {
        mapFilters[f].addEventListener(
          "click",
          this.mapFilterClickEvent.bind(this)
        );
        /*mapFilters[f].addEventListener('click', function (e) {
                                    let dataset = e.target.dataset;
                                    console.log(dataset);
                                    if (dataset) {
                                        if (dataset.featuretype == "all") {
                                            for (let t = 0; t < this.featureTypes.length; t++) {
                                                this.addExploreFilter(
                                                    this.featureTypes[t],
                                                    dataset.criteria,
                                                    dataset.filtervalue,
                                                    true
                                                );
                                            }
        
                                        } else {
                                            this.addExploreFilter(
                                                dataset.featuretype,
                                                dataset.criteria,
                                                dataset.filtervalue,
                                                true
                                            );
                                        }
        
                                        this.applyExploreFilters();
                                    }
        
                                }.bind(this));*/
      }
    }

    // Subtype filters (borders, land routes, etc.)
    let subtypeFilters = document.querySelectorAll("input.explore_filter");
    if (subtypeFilters) {
      for (let f = 0; f < subtypeFilters.length; f++) {
        subtypeFilters[f].addEventListener(
          "click",
          this.subtypeFilterClickEvent.bind(this)
        );
      }
    }
  }

  mapFilterClickEvent(e) {
    let dataset = e.target.dataset;
    if (dataset) {
      const filterValue = parseInt(dataset.filtervalue);
      const index = this.exploreFilterControl.maps.indexOf(filterValue);
      if (index < 0) {
        this.exploreFilterControl.maps.push(filterValue);
      } else {
        this.exploreFilterControl.maps.splice(index, 1);
      }
      this.applyExploreFilters();
    }
  }

  subtypeFilterClickEvent(e) {
    let dataset = e.target.dataset;
    //console.log(dataset);
    if (dataset) {
      // [{"sub_type":3, "identity":[2,3,4]}]
      const values = JSON.parse(dataset.filtervalue);
      if (values.sub_type) {
        let subtypeValue = values.sub_type;
        // Add identities
        for (let t = 0; t < values.identity.length; t++) {
          this.addSubtypeFilter(
            subtypeValue,
            values.identity[t],
            e.target.checked
          );
        }
      }
      this.applyExploreFilters();
    }
  }

  /**
   * Apply map and subtype filters to our full dataset
   * @return filters in slide format
   */
  applyExploreFilters() {
    this.storyFeatureLayerGroup.clearLayers();
    // Filter by subtype first
    let filteredFeatures = [];
    let subtypeFeatures = [];
    if (this.allFeatures) {
      console.log(this.exploreFilterControl.sub_type);
      this.allFeatures.forEach(
        function (item) {
          let subtypeIndex = -1;
          if (
            item.properties &&
            this.exploreFilterControl.sub_type[0].length > 0
          ) {
            // All features
            subtypeIndex = 0;
          } else if (item.properties && item.properties.sub_type) {
            subtypeIndex = item.properties.sub_type;
          }
          if (
            item.properties &&
            item.properties.identity &&
            this.exploreFilterControl.sub_type[subtypeIndex].indexOf(
              item.properties.identity
            ) > -1
          ) {
            subtypeFeatures.push(item);
          }
        }.bind(this)
      );
    }

    if (this.exploreFilterControl.maps.length > 0) {
      // if it's empty, apply any map
      let iterateFeatures = this.allFeatures;
      if (subtypeFeatures.length > 0) {
        // If we have a subset, apply map filter to that subset
        iterateFeatures = subtypeFeatures;
      }
      iterateFeatures.forEach(
        function (item) {
          if (
            item.properties &&
            item.properties.map_source &&
            this.exploreFilterControl.maps.indexOf(item.properties.map_source) >
              -1
          ) {
            filteredFeatures.push(item);
          }
        }.bind(this)
      );
    } else {
      filteredFeatures = subtypeFeatures;
    }

    if (filteredFeatures && filteredFeatures.length > 0) {
      // EH: commented out pending review
      //     // sort the checkboxes
      //     if (document.querySelectorAll("input.explore_filter:checked").length == 0) {
      //         // IF we've got one or the other not checked, maps of subtypes
      //         let exploreFilters = document.querySelectorAll("input.explore_filter");
      //         let availableSubtypes = [];
      //         filteredFeatures.forEach(function (item) {
      //             if (item.properties && item.properties.sub_type && availableSubtypes.indexOf(item.properties.sub_type) == -1) {
      //                 availableSubtypes.push(item.properties.sub_type);
      //                 /*for (let e = 0; e<exploreFilters.length;e++){
      //                     const values = JSON.parse(exploreFilters[e].dataset.filtervalue);
      //                     if (item.properties.sub_type == values.sub_type && !exploreFilters[e].checked){
      //
      //                         exploreFilters[e].checked = true;
      //                         break;
      //                     }
      //                 }*/
      //             }
      //
      //         }.bind(this));
      //     }

      // IF we've got selected maps, but no subtypes
      // Go through our subset and check every relevant subtype

      // IF we've got selected subtype but not maps
      // go through subset and enable any maps we find.

      // ONLY show the layer if we've got something at the end.
      this.exploreFeaturesLayer = this.L.geoJSON(filteredFeatures, {
        //style: this.defaultLineStyle,
        pointToLayer: this.pointToLayer.bind(this),
        onEachFeature: this.onEachFeature.bind(this),
      });
      this.storyFeatureLayerGroup.addLayer(this.exploreFeaturesLayer);
    }

    console.log(filteredFeatures);
  }

  /** Apply filter logic to feature of one type
   * To be included it must pass all inclcudes (e.g sub type 12 and map_type 5)
   * If filters passed are for excludes, then a true result means exclude this feature
   * @param feature
   * @param filters filters for this type
   * @return {boolean} Include
   */
  filterFeature(feature, filters) {
    let result = false;
    for (const [field, includeValues] of Object.entries(filters)) {
      if (field == "id" && field in feature.properties) {
        // If there's an id include check that first
        if (includeValues.includes(feature.properties.id)) {
          result = true;
          break;
        }
      }
      // If they match ALL include rules, set to include
      if (
        field in feature.properties &&
        includeValues.includes(feature.properties[field])
      ) {
        result = true;
      } else {
        result = false;
        break;
      }
    }
    return result;
  }

  /**
   * Apply filter criteria to a feature to see if it should be included in this
   * slide (or search)
   * @param feature
   * @param featureType
   * @param slide
   * @return {boolean} include in feature
   */
  includeFeature(feature, featureType, slide) {
    let includeFeature = false;
    switch (featureType) {
      case "lines":
        if (slide.lines) {
          if (slide.lines.includes) {
            includeFeature = this.filterFeature(feature, slide.lines.includes);
          }
          if (slide.lines.excludes && includeFeature === true) {
            includeFeature = !this.filterFeature(feature, slide.lines.excludes);
          }
        }
        break;

      case "polys":
        if (slide.polys) {
          if (slide.polys.includes) {
            includeFeature = this.filterFeature(feature, slide.polys.includes);
          }
          if (slide.polys.excludes && includeFeature === true) {
            includeFeature = !this.filterFeature(feature, slide.polys.excludes);
          }
        }
        break;
      case "points":
        if (slide.points) {
          if (slide.points.includes) {
            includeFeature = this.filterFeature(feature, slide.points.includes);
          }
          if (slide.points.excludes && includeFeature === true) {
            includeFeature = !this.filterFeature(
              feature,
              slide.points.excludes
            );
          }
        }
        break;
      case "indigenous":
        if (slide.indigenous) {
          includeFeature = this.filterFeature(
            feature,
            slide.indigenous.includes
          );
        }
        break;
      default:
        break;
    }
    return includeFeature;
  }

  /**
   * Add the feature to as many slide groups
   * as pass the conditions in slideRules.
   *
   * @param featureType point, poly, line
   * @param feature the feature to assign
   */
  addFeatureToAllSlides(featureType, feature) {
    for (let s = 0; s < this.slides.length; s++) {
      // Foreach slide rule
      let slide = this.slides[s];
      let includeFeature = this.includeFeature(feature, featureType, slide);
      if (includeFeature) {
        slide.features.push(feature);
      }
    }
  }

  /*
          addFeatureToSlideGroups(featureType, feature) {
              for (let s = 0; s < this.slides.length; s++) {
                  // Foreach slide rule
                  let slide = this.slides[s];
                  if (slide && feature != null) {
                      let lineIncludes = null;
                      let lineExcludes = null;
                      let polyIncludes = null;
                      let polyExcludes = null;
                      let pointIncludes = null;
                      let pointExcludes  = null;
                      let indigenousIncludes = null;
  
                      if (slide.lines) {
                          lineIncludes = slide.lines.includes;
                          lineExcludes = slide.lines.excludes;
                      }
  
                      if (slide.polys){
                          polyIncludes = slide.polys.includes;
                          polyExcludes = slide.polys.excludes;
                      }
  
                      if (slide.points != null){
                          if (slide.points.includes !=null){
                            pointIncludes = slide.points.includes;
                             console.log(slide.points.includes.length);
                          }
                          if (slide.points.excludes !=null && slide.points.excludes.length > 0){
                              pointExcludes = slide.points.excludes;
                          }
  
  
                      }
  
                      let includeFeature = this.isFeatureIncluded(
                          featureType, feature, lineIncludes, lineExcludes,
                          polyIncludes, polyExcludes,
                          pointIncludes, pointExcludes, indigenousIncludes
                      )
  
                      if (includeFeature) {
                          slide.features.push(feature);
                      }
                  }
              }
          }*/

  // Explore and filter functionality

  loadExploreLayer() {}
}
