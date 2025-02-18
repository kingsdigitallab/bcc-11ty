/*jshint esversion: 8 */
import {D3intro} from "./d3intro.js";
import * as fflate from 'fflate';

export class StoryMap {
    constructor(storyUris, L, d3) {
        // todo should be empty for static deploy
        //this.pathPrefix = '/bcc-11ty';
        this.pathPrefix = '';
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
            "offset": -10,
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
            10: "n/a",
            11: "n/a",
            12: "Mitchell, 1755",
            13: "n/a",
            14: "n/a",
            15: "n/a",
            16: "n/a",
            17: "Buell, 1784",
            18: "n/a",
            19: "Bradley, 1796",
        };

        // Explore/filter variables

        // Quicklink has for disabling stories
        this.exploreHash = '#s-6';
        this.exploreFilterControl = {
            id: 0,
            fid: 0, // We should look at this
            // This is hacky, and relies on having as many entries as numbers
            // So we can fill out the form as sub types are selected
            sub_type: [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []],
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

        // Selector dict for explore controls
        this.exploreSelectors = {
            explore_filter: "input.explore_filter",
            map_filter: "input.map_selector",
            explore_counter: "totalExploreFiltersApplied",
            map_counter: "totalMapFiltersApplied",
            selectall_maps: "selectallMaps",
            selectall_features: "selectallFeatures"
        };

        // Explore filters disabled by default
        this.exploreFiltersElementId = "filter-wrapper";
        this.exploreFiltersEnabled = false;
        this.exploreFiltersDisabledClass = "filterDisabled";
        this.filterControlsVisible = false;

        // Total map and explore filters currently applied
        this.totalExploreFilters = document.querySelectorAll(this.exploreSelectors.explore_filter).length;
        this.shadowFeatures = [];
        this.exploreSlideId = 1000;
        this.totalExploreFiltersApplied = 0;
        this.totalMapFilters = document.querySelectorAll(this.exploreSelectors.map_filter).length;
        this.totalMapFiltersApplied = 0;
        // This is all the subtypes used in explore
        this.exploreFeatureSubtypes = [10, 4, 12, 13, 3, 12, 8, 11, 14, 7, 5];
        this.exploreFeatures = [];
        this.initExploreFilters();
    }

    initStyles() {

        // line Styles
        this.lineBorderStyle = {
            stroke: true,
            dashArray: "5 5",
            lineCap: "square",
            color: "#696969",
            weight: 2.5,
            fill: false,
        };
        this.lineLandRouteStyle = {
            stroke: true,
            //dashArray: "7 6",
            lineCap: "square",
            lineJoin: "arcs",
            color: "#FFFFFF",
            weight: 3,
            fill: false,
        };
        this.lineLandRouteHighlightStyle = {
            stroke: true,
            lineCap: "square",
            lineJoin: "round",
            color: "#000000",
            weight: 5,
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
            color: "#0059a2",
            lineCap: "square",
            lineJoin: "round",
            weight: 2,
            fill: false,
            opacity: 0.5,
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
            color: "#000000",
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

        this.indigenousAreaStyle = {
            stroke: true,
            color: "#4b5d04",
            fillColor: "#4b5d04",
            lineCap: "square",
            weight: 2,
            fill: true,
            opacity: 1,
            fillOpacity: 0.1,
        };

        this.europeanAreaStyle = {
            stroke: true,
            color: "#e29e21 ",
            fillColor: "#e29e21 ",
            lineCap: "square",
            weight: 2,
            fill: true,
            opacity: 0.5,
            fillOpacity: 0.1,
        };

        this.haudenosauneeAreaStyle = {
            stroke: true,
            lineCap: "square",
            color: "#4b5d04",
            //fillColor: "#4b5d04",
            fill: 'url(' + this.pathPrefix + '/assets/img/stories/hatch-green.webp)',
            weight: 2,
            opacity: 1,
            fillOpacity: 1,
        };

        this.europeanAnnoStyle = {
            stroke: true,
            lineCap: "square",
            color: "#e29e21",
            //fillColor: "#e29e21",
            fill: 'url(' + this.pathPrefix + '/assets/img/stories/hatch-yellow.webp)',
            weight: 2,
            opacity: 1,
            fillOpacity: 1,
        };

        this.polyBorderStyle = {
            stroke: true,
            dashArray: "4 6",
            color: "#000000",
            fillColor: "#000000",
            lineCap: "square",
            weight: 2,
            fill: true,
            opacity: 0.2,
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
            color: "#696969",
            fillColor: "#696969",
            weight: 1,
            fill: true,
            opacity: 0.5,
            fillOpacity: 0.2,
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
            fillColor: "#f8600e",
            dashArray: "7 6",
            color: "f8600e",
            weight: 2,
            fill: true,
            opacity: 0.25,
            fillOpacity: 0.2,
        };
        this.polyEuroStyle = {
            stroke: true,
            fillColor: "#00ff00",
            weight: 2,
            fill: true,
            opacity: 0.5,
            fillOpacity: 0.2,
        };
        this.polyAnnoStyle = {
            stroke: true,
            dashArray: "10 10",
            lineCap: "square",
            lineJoin: "arcs",
            color: "#8C8C8C",
            fillColor: "#8C8C8C00",
            fill: 'url(' + this.pathPrefix + '/assets/img/stories/horizontal_hatch_print_8C8C8C.webp)',
            weight: 2,
            opacity: 0.3,
            fillOpacity: 1,
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
        // New poly styles for sub_type 14
        this.polyDomainNativeStyle = {
            stroke: true,
            lineCap: "square",
            lineJoin: "arcs",
            color: "#f8600e",
            fillOpacity: 0.5,
            fillColor: "#f8600e00", //fill colour completely transparent
            fill: 'url(' + this.pathPrefix + '/assets/img/stories/vertical_hatch_orange_f8600e.webp)',
            weight: 3,
            opacity: 1,
        };
        this.polyDomainHaudenasuaneeStyle = {
            stroke: true,
            lineCap: "square",
            lineJoin: "arcs",
            color: "#8C8C8C",
            fillColor: "#8C8C8C00",
            fill: 'url(' + this.pathPrefix + '/assets/img/stories/vertical_hatch_grey_8C8C8C.webp)',
            weight: 3,
            opacity: 0.3,
        };
        this.polyDomainEuroStyle = {
            stroke: true,
            lineCap: "square",
            lineJoin: "arcs",
            color: "#8D33CC",
            fillOpacity: 0.5,
            fillColor: "#8D33CC00",
            fill: 'url(' + this.pathPrefix + '/assets/img/stories/vertical_hatch_purple_8D33CC.webp)',
            weight: 3,
            opacity: 1,
        };

        this.councilFireIcon = this.L.icon({
            iconUrl: this.pathPrefix + '/assets/img/stories/council_fire.webp',
            iconSize: [22, 22],
            iconAnchor: [11, 21],
            popupAnchor: [-3, -20]
        });

        this.indigenousSettlementIcon = this.L.icon({
            iconUrl: this.pathPrefix + '/assets/img/stories/settlement_indig.webp',
            iconSize: [20, 20],
            shadowSize: [20, 20],
            iconAnchor: [10, 19],
            shadowAnchor: [10, 19],
            popupAnchor: [-3, -20]
        });
        this.europeanSettlementIcon = this.L.icon({
            iconUrl: this.pathPrefix + '/assets/img/stories/settlement_euro.webp',
            iconSize: [20, 20],
            shadowSize: [20, 20],
            iconAnchor: [10, 19],
            shadowAnchor: [10, 19],
            popupAnchor: [-3, -20]
        });
        this.indigenousPlacenameIcon = this.L.icon({
            iconUrl: this.pathPrefix + '/assets/img/stories/placename_indig.webp',
            iconSize: [20, 20],
            shadowSize: [20, 20],
            iconAnchor: [10, 19],
            shadowAnchor: [10, 19],
            popupAnchor: [-3, -20]
        });
        this.europeanPlacenameIcon = this.L.icon({
            iconUrl: this.pathPrefix + '/assets/img/stories/placename_euro.webp',
            iconSize: [20, 20],
            shadowSize: [20, 20],
            iconAnchor: [10, 19],
            shadowAnchor: [10, 19],
            popupAnchor: [-3, -20]
        });
    }

    async loadShapeFile(shape_url) {
        if (shape_url.indexOf('gz') > -1) {
            // Gzipped json, we need to handle this ourselves as the encoding won't be right
            const compressed = new Uint8Array(
                await fetch(shape_url).then(res => res.arrayBuffer())
            );
            const decompressed = fflate.decompressSync(compressed);
            const origText = fflate.strFromU8(decompressed);
            return JSON.parse(origText);
        } else {
            // Uncompressed JSON, handle as normal
            let response = await fetch(shape_url);
            let json = await response.json();
            return json;
        }

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
                storyFeatures.push(feature);


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
        console.log('Warning! slide ' + slideid + ' not found');
    }

    pointToLayer(feature, latlng) {
        switch (feature.properties.sub_type) {
            // Indigenous : Circle - Red
            case 1:
                return this.L.circleMarker(latlng, {
                    radius: 4,
                    fillColor: "#7A0707",
                    color: "#7A0707",
                    weight: 0.5,
                    opacity: 1,
                    fillOpacity: 1,
                    bubblingMouseEvents: true,
                });
            case 4:
                // Capture Indig vs Haudenasnee
                switch (feature.properties.identity) {
                    case 1:
                        // European - purple cross
                        return this.L.marker(latlng, {
                            icon: this.europeanSettlementIcon,
                            bubblingMouseEvents: true
                        });
                    // Default - Indigenous turq cross - everything else
                    default:
                        return this.L.marker(latlng, {
                            icon: this.indigenousSettlementIcon,
                            bubblingMouseEvents: true
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

            // Descriptive - grey squares
            case 7:
                return new this.L.RegularPolygonMarker(latlng, {
                    numberOfSides: 4,
                    rotation: -45,
                    radius: 5,
                    //this.L.Path style options
                    fill: true,
                    fillColor: "#696969",
                    color: "#000000",
                    weight: 0.5,
                    fillOpacity: 1,
                    stroke: true,
                    bubblingMouseEvents: true,
                });

            //River route
            case 8:
                return new this.L.RegularPolygonMarker(latlng, {
                    numberOfSides: 4,
                    rotation: -45,
                    radius: 5,
                    //this.L.Path style options
                    fill: true,
                    fillColor: "#0059a2",
                    color: "#000000",
                    weight: 0.5,
                    fillOpacity: 1,
                    stroke: true,
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
                    case 1: //European - green sq, white centre (yellow square)
                        return this.L.marker(latlng, {
                            icon: this.europeanPlacenameIcon,
                            bubblingMouseEvents: true
                        });
                    default: //indigenous  - green circle,white centre (green square)
                        return this.L.marker(latlng, {
                            icon: this.indigenousPlacenameIcon,
                            bubblingMouseEvents: true
                        });

                }
                ;
            case 12: // Council fire
                return this.L.marker(latlng, {
                    icon: this.councilFireIcon,
                    bubblingMouseEvents: true
                });

            default: //other
                return this.L.circleMarker(latlng, {
                    radius: 4,
                    fillColor: "#000ff",
                    color: "#0000ff",
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
            this.shadowFeatures.length = 0;
            slide.layer = this.L.geoJSON(slide.features, {
                // Stopping style override here
                //style: this.defaultLineStyle,
                pointToLayer: this.pointToLayer.bind(this),
                onEachFeature: this.onEachFeature.bind(this),
            });

            if (this.shadowFeatures && this.shadowFeatures.length > 0) {
                slide.shadowLayer = this.L.geoJSON(this.shadowFeatures, {
                    pane: 'lane-lines-pane',
                    onEachFeature: this.onEachShadowFeature.bind(this),
                });
            }

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


        if (slideid == this.exploreSlideId) {
            this.storyFeatureLayerGroup.clearLayers();
            this.loadExploreLayer();
        } else if (this.d3Intro.slideIds[slideid + ""]) {
            // This slide triggers an animated slide
            // Clear layers
            console.log("Section intro :" + slideid);
            this.storyFeatureLayerGroup.clearLayers();
            this.d3Intro.SectionIntro(this.map, slideid, this.slides);
            if (this.filterControlsVisible) {
                this.toggleFilterControls();
            }
        } else if (slideid != this.exploreSlideId) {

            // Clear the svg overlay so we can replace with layers
            this.d3Intro.stopAll(this.map);
            this.d3Intro.clearSvg();
            if (this.filterControlsVisible) {
                this.toggleFilterControls();
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

                        if (slide.shadowLayer) {
                            this.storyFeatureLayerGroup.addLayer(slide.shadowLayer);
                        }
                        this.storyFeatureLayerGroup.addLayer(slide.layer);
                        this.fadeLayerLeaflet(slide.layer, 0, 1, 0.2, 0.01);
                        this.map.off("moveend", slideUpdate);
                    }.bind(this);
                    this.map.on("moveend", slideUpdate);
                }
                this.lastSlideDisplayed = slide;
            }
        }
        return true;
    }


    async initMap(lat, lng, zoom) {
        this.map = this.L.map("basemap", {
            scrollWheelZoom: false,
            zoomControl: false,

        });

        // Solve the narrative scrolling issue on tablet/mobile by using touch events
        const el = document.getElementById("basemap");
        const touchScrollSpeed = 1;
        let lastTouch = [0, 0];
        let scrollActive = false; // Allow scroll to happen (timeout)
        let scrollStart = false;
        let scrollActivateTimeout = null;
        el.addEventListener("touchstart", function (e) {
            if (!scrollStart) {
                console.log('touchmovestart');
                lastTouch = [e.touches[0].screenX, e.touches[0].screenY];
                scrollActive = true;
                scrollStart = true;
            }

        });
        el.addEventListener("touchmove", function (e) {
            if (e.touches.length > 0 && lastTouch.length > 1 && scrollActive) {
                const delta = -1 * (e.touches[0].screenY - lastTouch[1]) * touchScrollSpeed;
                //console.log('wtf: ' + delta);
                console.log('touchmove ' + delta.toString());
                window.scrollBy({
                    top: delta,
                    left: 0,
                    behavior: "instant"
                });
                //window.scrollBy(0, delta);
                lastTouch = [e.touches[0].screenX, e.touches[0].screenY + delta];
                scrollActive = false;
                scrollActivateTimeout = setTimeout(function () {
                    scrollActive = true;
                }, 50);
            }
            e.stopPropagation();
        });
        el.addEventListener("touchend", function (e) {
            console.log('touchmoveend');
            // Final scroll
            console.log(e);
            if (e.changedTouches.length > 0) {
                const delta = -1 * (e.changedTouches[0].screenY - lastTouch[1]) * touchScrollSpeed;
                //console.log('wtf: ' + delta);
                console.log('touchend ' + delta.toString());
                window.scrollBy({
                    top: delta,
                    left: 0,
                    behavior: "instant"
                });
            }


            scrollStart = false;
            clearTimeout(scrollActivateTimeout);
        });
        /*

        el.addEventListener("touchcancel", handleCancel);
        */

        this.L.control
            .zoom({
                position: "bottomleft",
            })
            .addTo(this.map);


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
        ).addTo(this.map);


        var baseLayers = {
            //"Clean Terrain": worldTerrain,
            "BCC": bcc,
            "ESRI World Street Map": worldStreet,
        };

        // Create Layer Switcher
        this.L.control
            .layers(baseLayers, {}, {position: "bottomleft", collapsed: false})
            .addTo(this.map);

        // Initial view
        // This could be changed based on get string etc.
        this.map.setView([lat, lng], zoom);
        this.map.createPane('lane-lines-pane').style.zIndex = 300;
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
        this.lastIntersected = "";
        this.iIndex = 0;
        let slideIndex = -1;
        let intersectionY = 0;
        let slides = document.getElementsByClassName("mapSlide");

        this.observerEnabled = true;
        // If we're getting here via the explore link don't enable

        if (window.location && window.location.hash == this.exploreHash) {
            this.observerEnabled = false;

        }

        let observer = new IntersectionObserver(
            function (entries) {
                if (!this.observerEnabled) {
                    return;
                }
                let nextSlide = null;
                let lastIntersected = this.lastIntersected;

                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.target.dataset.slideid != this.lastIntersected) {
                        // New interesection event, save id and window y
                        this.lastIntersected = entry.target.dataset.slideid;
                        intersectionY = window.scrollY;
                    } else if (!entry.isIntersecting && entry.target.dataset.slideid == this.lastIntersected) {

                        for (let x = 0; x < slides.length; x++) {
                            if (slides[x].dataset.slideid == lastIntersected) {
                                // Are we scrolling up or down, set previous or next slide
                                if (window.scrollY < intersectionY && x > 0) {
                                    nextSlide = slides[x - 1];
                                } else if (window.scrollY > intersectionY && (x + 1) < slides.length) {
                                    nextSlide = slides[x + 1];
                                } else {
                                    nextSlide = slides[x];
                                }
                            }
                        }
                        this.lastIntersected = "";
                    }
                });
                if (nextSlide) {

                    observerTimeouts[nextSlide.dataset.slideid] = setTimeout(
                        function () {
                            nextSlide.dataset.isActive = "true";
                            this.triggerSlideMapEvents(nextSlide.dataset.slideid);
                        }.bind(this),
                        1000
                    );
                }
                this.iIndex += 1;
            }.bind(this),
            {
                threshold: [0.4],
            }
        );


        //this.storyFeatureLayerGroup.addLayer(this.allFeaturesLayer);
        for (let s = 0; s < this.slideElements.length; s++) {
            observer.observe(this.slideElements[s]);
        }
        // Add intersection observer for filters
        observer.observe(document.getElementById(this.exploreFiltersElementId));

        let overviewLinks = document.getElementsByClassName("overviewLink");

        for (let i = 0; i < overviewLinks.length; i++) {
            overviewLinks[i].addEventListener('click', this.onOverviewLinkClick.bind(this));
        }

        let homelandsSlide = this.getSlideById(500);
        let pathways1Slide = this.getSlideById(600);
        let pathways2Slide = this.getSlideById(700);
        let villagerssettlersSlide = this.getSlideById(800);
        let linesSlide = this.getSlideById(900);

        let StartingBounds = {
            "homelands": this.getStoryFrameBounds(homelandsSlide.fid),
            "pathways1": this.getStoryFrameBounds(pathways1Slide.fid),
            "pathways2": this.getStoryFrameBounds(pathways2Slide.fid),
            "villagerssettlers": this.getStoryFrameBounds(villagerssettlersSlide.fid),
            "lines": this.getStoryFrameBounds(linesSlide.fid),
        };

        // Init our d3 intro class and pass relevant layer data
        this.d3Intro = new D3intro(this.storyUris, this.L, this.d3, StartingBounds);
        this.d3Intro.homelandsSlide = homelandsSlide;
        this.d3Intro.pathways1Slide = pathways1Slide;
        this.d3Intro.pathways2Slide = pathways2Slide;
        this.d3Intro.villagerssettlersSlide = villagerssettlersSlide;
        this.d3Intro.linesSlide.push(linesSlide);
        this.d3Intro.linesSlide.push(this.getSlideById(901));
        this.d3Intro.linesSlide.push(this.getSlideById(902));
        this.d3Intro.linesSlide.push(this.getSlideById(903));
        this.svg = await this.d3Intro.loadD3(this.map);

        if (window.location && window.location.hash == this.exploreHash) {
            this.loadExploreLayer();
        }
    }

    onOverviewLinkClick(evt) {
        let target = evt.target;
        if (target.nodeName == "SPAN") {
            // get the parent
            target = target.parentElement;
        }
        let href = target.href;
        if (href.indexOf(this.exploreHash) > -1) {
            // This is the link to explore hash, jump there.
            console.log('hash');
            window.location.href = href;
            window.location.reload();
        }
        // Clear our svgs and layers
        this.d3Intro.stopAll(this.map);
        this.d3Intro.clearSvg();
        this.storyFeatureLayerGroup.clearLayers();


        this.observerEnabled = false;
        let dataset = target.dataset;
        if (target.dataset) {
            // In a timeout so we have time to scroll there
            this.overviewTimeout = setTimeout(function () {
                // Make sure it's clear
                this.storyFeatureLayerGroup.clearLayers();
                // Trigger the d3 slide we've arrived at.
                let slideId = dataset.slideid;
                if (slideId) {

                    this.triggerSlideMapEvents(slideId);
                }
                // re-enable observer
                this.observerEnabled = true;
            }.bind(this), 1500);
        }
        return true;
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
                                        // nullifying text - not sure that this is needed
                                        // but leaving code in place incase ...
                                        feature.setText(null/*this.textFeatures[featureId].text*/, {
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

    /*
    Adding features to the shadow layer e.g. lines that have a second feature layer
     */
    onEachShadowFeature(feature, layer) {
        switch (feature.geometry.type) {
            case "MultiLineString":
                switch (feature.properties.sub_type) {
                    case 5:
                        layer.setStyle(this.lineLandRouteHighlightStyle);
                        layer.bindPopup("This is one of those duplicated lines");
                        break;
                }
                break;
        }
    }

    onEachFeature(feature, layer) {
        // does this feature have a property named popupContent?
        if (
            (feature.properties &&
                (feature.properties.map_text || feature.properties.norm_text)) ||
            feature.properties.Name
        ) {
            if (feature.properties.map_text && [7, 11].includes(feature.properties.sub_type)) {
                // Catching if this is just a text region on the map ...
                layer.bindPopup(feature.properties.map_text);
                if (feature.properties.date_yr) {
                    layer.bindPopup(
                        "<p style='font-family:Playfair Display,serif'><em>" + '"'
                        + feature.properties.map_text + '"' + "</em></p>" +
                        "<strong>" +
                        this.mapLookup[feature.properties.map_source] +
                        "</strong>"
                    );
                }
            } else if (feature.properties.map_text) {
                layer.bindPopup(feature.properties.map_text);
                if (feature.properties.date_yr) {
                    layer.bindPopup(
                        feature.properties.map_text +
                        "<br><strong>" +
                        this.mapLookup[feature.properties.map_source] +
                        "</strong>"
                    );
                }
            } else if (feature.properties.norm_text) {
                layer.bindPopup(feature.properties.norm_text);
                if (feature.properties.date_yr) {
                    layer.bindPopup(
                        feature.properties.norm_text +
                        "</br><strong>" +
                        this.mapLookup[feature.properties.map_source] +
                        "</strong>"
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
                        //layer.setStyle(this.polyDomainNativeStyle);
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
                        // Capture Indig vs Haudenasaunee
                        switch (feature.properties.identity) {
                            case 1:
                                layer.setStyle(this.europeanAnnoStyle);
                                break;
                            case 2:
                                // Pale green solid fill poly
                                layer.setStyle(this.indigenousAreaStyle);
                                break;
                            case 3:
                                //Green hatched poly (Haudenasaunee)
                                layer.setStyle(this.haudenosauneeAreaStyle);
                                break;
                            default:
                                layer.setStyle(this.europeanAreaStyle);
                        }
                        break;
                    case 14:
                        // Capture Indig vs Haudenasaunee
                        switch (feature.properties.identity) {
                            case 2:
                                layer.setStyle(this.indigenousAreaStyle);
                                break;
                            case 3:
                                layer.setStyle(this.haudenosauneeAreaStyle);
                                break;
                            default:
                                layer.setStyle(this.europeanAreaStyle);
                        }
                        break;
                }
                break;
            // If lines
            case "MultiLineString":
                switch (feature.properties.sub_type) {
                    case 3:
                        layer.setStyle(this.lineBorderStyle);
                        break;
                    case 4:
                        layer.setStyle(this.lineLandRouteStyle);
                        this.shadowFeatures.push(feature);
                        break;
                    case 5:

                        layer.setStyle(this.lineLandRouteStyle);
                        this.shadowFeatures.push(feature);
                        break;
                    case 6:
                        layer.setStyle(this.lineSeaRouteStyle);
                        break;
                    case 8:
                        layer.setStyle(this.lineRiverRouteStyle);
                        break;
                    case 9:
                        layer.setStyle(this.lineMiscStyle);
                        break;
                    case 10:
                        layer.setStyle(this.lineToponymStyle);
                        break;
                }
                break;
            default:
                switch (feature.properties.Slug) {
                    case "catawba":
                        layer.setStyle(this.indigenousAreaStyle);
                        break;
                    default:
                        layer.setStyle(this.haudenosauneeAreaStyle);
                }
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
        console.log("addsubtypefilter:" + subtypeValue + "," + filterValue);
        if (
            this.exploreFilterControl.sub_type &&
            this.exploreFilterControl.sub_type[subtypeValue] &&
            this.exploreFilterControl.sub_type.length >= filterValue
        ) {
            const index =
                this.exploreFilterControl.sub_type[subtypeValue].indexOf(filterValue);

            if (include && index < 0) {
                this.exploreFilterControl.sub_type[subtypeValue].push(filterValue);
                this.totalExploreFiltersApplied += 1;
            } else if (!include) {
                // Remove from array
                this.exploreFilterControl.sub_type[subtypeValue].splice(index, 1);
                if (this.totalExploreFiltersApplied > 0) {
                    this.totalExploreFiltersApplied -= 1;
                }
            }
        }
    }

    /**
     * Attach click events to control the explore controls
     *
     */
    initExploreFilters() {
        // Map filters
        let mapFilters = document.querySelectorAll(this.exploreSelectors.map_filter);
        if (mapFilters) {
            for (let f = 0; f < mapFilters.length; f++) {
                mapFilters[f].addEventListener(
                    "click",
                    this.mapFilterClickEvent.bind(this)
                );
                mapFilters[f].checked = false;
            }
        }

        // Subtype filters (borders, land routes, etc.)
        let subtypeFilters = document.querySelectorAll(this.exploreSelectors.explore_filter);
        if (subtypeFilters) {
            for (let f = 0; f < subtypeFilters.length; f++) {
                subtypeFilters[f].addEventListener(
                    "click",
                    this.subtypeFilterClickEvent.bind(this)
                );
                subtypeFilters[f].checked = false;
            }
        }

        //selectallFeatures
        let selectAllExplore = document.getElementById(this.exploreSelectors.selectall_features);
        if (selectAllExplore) {
            selectAllExplore.addEventListener(
                "click",
                function (event) {
                    let status = event.target.checked;
                    this.toggleAllFeaturesEnabled = event.target.checked;
                    this.toggleAll(this.exploreSelectors.explore_filter, event.target.checked);
                    selectAllExplore.checked = status;
                }.bind(this)
            );
            selectAllExplore.checked = false;
        }
        //selectallMaps
        let selectAllMaps = document.getElementById(this.exploreSelectors.selectall_maps);
        if (selectAllMaps) {
            selectAllMaps.addEventListener(
                "click",
                function (event) {
                    let status = event.target.checked;
                    this.toggleAllMapsEnabled = event.target.checked;
                    this.toggleAll(this.exploreSelectors.map_filter, event.target.checked);
                    selectAllMaps.checked = status;
                }.bind(this)
            );
            selectAllMaps.checked = false;
        }

        this.toggleAllFeaturesEnabled = false;
        this.toggleAllMapsEnabled = false;

        let filterWrapper = document.getElementById("filter-wrapper");
        filterWrapper.style.display = "none";

    }

    /**
     * Function to toggle all filters or maps
     * @param selector which group we're toggling on as selector
     */
    toggleAll(selector, checked) {

        let elements = document.querySelectorAll(selector);

        // Switch to prevent updates on each criteria selected
        Array.prototype.forEach.call(elements, function (el) {
            if (el.checked != checked) {
                el.click();
            }
        });
        // Apply filters and update counts
        this.applyExploreFilters();
        this.updateFilterCounts();

    }

    mapFilterClickEvent(e) {
        let dataset = e.target.dataset;
        this.updateToggleAllElement(this.exploreSelectors.selectall_maps, e.target.checked);
        if (dataset) {
            const filterValue = parseInt(dataset.filtervalue);
            const index = this.exploreFilterControl.maps.indexOf(filterValue);
            if (index < 0) {
                this.exploreFilterControl.maps.push(filterValue);
                this.totalMapFiltersApplied += 1;
            } else {
                this.exploreFilterControl.maps.splice(index, 1);
                if (this.totalMapFiltersApplied > 0) {
                    this.totalMapFiltersApplied -= 1;

                    this.toggleAllMapsEnabled = false;
                }
            }

            //if (!this.toggleAllFeaturesEnabled) {
            this.applyExploreFilters();
            // Update filter counts for map and explore
            this.updateFilterCounts();
            // }

        }
    }

    /** Updates the total filters applied numbers in the filter box */
    updateFilterCounts() {
        let filterTotal = document.getElementById(this.exploreSelectors.explore_counter);
        let mapTotal = document.getElementById(this.exploreSelectors.map_counter);
        if (filterTotal) {
            filterTotal.innerHTML = this.totalExploreFiltersApplied;
            // Case when all filters have been individually clicked; silently turn on toggle all controls
            let exploreToggleAll = document.getElementById(this.exploreSelectors.selectall_features);
            if (this.totalExploreFiltersApplied == this.totalExploreFilters && exploreToggleAll.checked == false) {
                exploreToggleAll.checked = true;
            } else if (exploreToggleAll.checked == true && this.totalExploreFiltersApplied < this.totalExploreFilters) {
                exploreToggleAll.checked = false;
            }
        }
        if (mapTotal) {
            mapTotal.innerHTML = this.totalMapFiltersApplied;
            // same as above
            let mapToggleAll = document.getElementById(this.exploreSelectors.selectall_maps);
            if (this.totalMapFiltersApplied == this.totalMapFilters && mapToggleAll.checked == false) {
                mapToggleAll.checked = true;
            } else if (true == mapToggleAll.checked && this.totalMapFiltersApplied < this.totalMapFilters) {
                mapToggleAll.checked = false;
            }
        }

    }

    /**
     * Keeps the select all toggles in line with their list of criteria
     * by turning off after all is selected, then one criteria is unselected.
     * @param selector elements selector for which checkbox
     * @param checked The status of the criteria calling it
     */
    updateToggleAllElement(selector, checked) {
        if (this.toggleAllFeaturesEnabled && checked != this.toggleAllFeaturesEnabled) {
            this.toggleAllEnabled = false;
            this.toggleAllFeaturesEnabled = false;
            let toggleAll = document.getElementById(selector);
            if (toggleAll) {
                toggleAll.checked = false;
            }
        }
    }

    subtypeFilterClickEvent(e) {
        let dataset = e.target.dataset;
        this.updateToggleAllElement(this.exploreSelectors.selectall_features, e.target.checked);
        if (dataset) {

            const values = JSON.parse(dataset.filtervalue);
            if (values.sub_type) {
                let subtypeValue = values.sub_type;
                //if (parseInt(subtypeValue)
                console.log(subtypeValue + " :: " + values.identity);
                // Add identities
                if (values.identity) {
                    for (let t = 0; t < values.identity.length; t++) {
                        this.addSubtypeFilter(
                            subtypeValue,
                            values.identity[t],
                            e.target.checked
                        );
                    }
                }

            }

            if (!this.toggleAllFeaturesEnabled) {
                this.applyExploreFilters();
                // Update filter counts for map and explore
                this.updateFilterCounts();
            }

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

        if (this.exploreFeatures) {

            let exploreFilteringEnabled = false;
            if (!this.toggleAllFeaturesEnabled) {
                // Check if any feature criteria are enabled
                let subtypeFilters = document.querySelectorAll(this.exploreSelectors.explore_filter);
                if (subtypeFilters) {
                    for (let f = 0; f < subtypeFilters.length; f++) {
                        if (subtypeFilters[f].checked) {
                            exploreFilteringEnabled = true;
                            break;
                        }
                    }
                }
            }

            if (this.exploreFiltersEnabled) {
                this.exploreFeatures.forEach(
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

                        // If we've got an identity e.g. European and a subtype OR just a subtype (0 in criteria)
                        if (
                            subtypeIndex >= 0 &&
                            item.properties &&
                            this.exploreFilterControl.sub_type.length > subtypeIndex) {

                            if (
                                (item.properties.identity && this.exploreFilterControl.sub_type[subtypeIndex].indexOf(item.properties.identity) > -1) ||
                                (this.exploreFilterControl.sub_type[subtypeIndex].indexOf(0) > -1)
                            ) {
                                subtypeFeatures.push(item);
                            }
                        }
                    }.bind(this)
                );
            }
        }

        // Filter what we've done in subtype by map
        // todo we need default behaviour so toggle all if explore filter selected
        // but don't filter
        // Otherwise filter

        if (this.toggleAllMapsEnabled) {
            filteredFeatures = subtypeFeatures;
            if (!this.exploreFiltersEnabled) {
                this.toggleExploreFilters(true);
            }
        } else if (this.exploreFilterControl.maps.length == 0 && !this.toggleAllMapsEnabled) {
            // In this case, no maps selected, show nothing
            filteredFeatures = [];
            if (this.exploreFiltersEnabled) {
                this.toggleExploreFilters(false);
            }
        } else if (this.exploreFilterControl.maps.length > 0 && !this.toggleAllMapsEnabled) {
            // Filter by map

            // If explored filters are disabled, enable them
            if (!this.exploreFiltersEnabled) {
                this.toggleExploreFilters(true);
            }


            let iterateFeatures = subtypeFeatures;
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
        }

        if (filteredFeatures && filteredFeatures.length > 0) {
            console.log(filteredFeatures);
            console.log(this.shadowFeatures);
            this.shadowFeatures.length = 0;
            // ONLY show the layer if we've got something at the end.
            this.exploreFeaturesLayer = this.L.geoJSON(filteredFeatures, {
                //style: this.defaultLineStyle,
                pointToLayer: this.pointToLayer.bind(this),
                onEachFeature: this.onEachFeature.bind(this),
            });
            this.storyFeatureLayerGroup.addLayer(this.exploreFeaturesLayer);
            this.exploreFeaturesShadowLayer = null;
            if (this.shadowFeatures && this.shadowFeatures.length > 0) {
                this.exploreFeaturesShadowLayer = this.L.geoJSON(this.shadowFeatures, {
                    pane: 'lane-lines-pane',
                    onEachFeature: this.onEachShadowFeature.bind(this),
                });
            }
            if (this.exploreFeaturesShadowLayer) {
                this.storyFeatureLayerGroup.addLayer(this.exploreFeaturesShadowLayer);
            }

        }
    }

    /**
     * Toggles whether the features filter pane can be used, reset all choices each time
     * @param toggle
     */
    toggleExploreFilters(toggle) {
        let exploreFilters = document.getElementById("featureFilters");

        if (toggle) {
            // Remove disable class
            exploreFilters.classList.remove(this.exploreFiltersDisabledClass);
        } else {
            exploreFilters.classList.add(this.exploreFiltersDisabledClass);
        }
        // reset all explore feature filters
        document.querySelectorAll(this.exploreSelectors.explore_filter).forEach(
            function (item) {
                item.checked = false;
            });
        this.exploreFiltersEnabled = toggle;
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
     * slide
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

        // Add to explorefeatures if it has one of our subtypes
        if (feature && feature.properties && feature.properties.sub_type &&
            this.exploreFeatureSubtypes.includes(feature.properties.sub_type)) {
            this.exploreFeatures.push(feature);

        }
    }

    // Explore and filter functionality

    loadExploreLayer() {
        console.log('init explore layer');
        // Make sure d3 is clear
        this.d3Intro.stopAll(this.map);
        this.d3Intro.clearSvg();
        clearTimeout(this.overviewTimeout);
        document.getElementById("s-6").scrollIntoView(false);
        setTimeout(function () {
            this.toggleFilterControls();
            setTimeout(function () {
                document.getElementById("s-7").scrollIntoView();
            }.bind(this), 7000);
        }.bind(this), 1000);


        let mapFilters = document.querySelectorAll(this.exploreSelectors.map_filter);
        if (mapFilters) {
            for (let f = 0; f < mapFilters.length; f++) {
                mapFilters[f].checked = false;
            }
        }

        // Subtype filters (borders, land routes, etc.)
        let subtypeFilters = document.querySelectorAll(this.exploreSelectors.explore_filter);
        if (subtypeFilters) {
            for (let f = 0; f < subtypeFilters.length; f++) {
                subtypeFilters[f].checked = false;
            }
        }

        //selectallFeatures
        let selectAllExplore = document.getElementById(this.exploreSelectors.selectall_features);
        if (selectAllExplore) {
            selectAllExplore.checked = false;
        }
        //selectallMaps
        let selectAllMaps = document.getElementById(this.exploreSelectors.selectall_maps);
        if (selectAllMaps) {
            selectAllMaps.checked = false;
        }

        this.toggleAllFeaturesEnabled = false;
        this.toggleAllMapsEnabled = false;

    }

    toggleFilterControls() {
        let filterWrapper = document.getElementById("filter-wrapper");
        let filterButton = document.getElementsByClassName("filter-button")[0];
        if (this.filterControlsVisible) {
            filterButton.click();
            filterWrapper.style.display = "none";
            this.filterControlsVisible = false;
        } else {
            // Toggle the filter and make it visible
            filterWrapper.style.display = "block";
            filterButton.click();
            this.filterControlsVisible = true;
        }

    }
}
