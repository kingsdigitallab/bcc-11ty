/*jshint esversion: 8 */

/*import L from 'leaflet';
import 'leaflet-dvf';
import 'leaflet-textpath';*/

// https://observablehq.com/@sfu-iat355/intro-to-leaflet-d3-interactivity

export class D3intro {
    constructor(geometryUris, L, d3, startingBounds) {
        this.slideIds = {
            500: "homelands",
            600: "pathways1",
            700: "pathways2",
            800: "villagerssettlers",
            900: "lines",

        };
        this.L = L;
        this.d3 = d3;
        this.homelandsSlide = null;
        this.pathways1Slide = null;
        this.pathways2Slide = null;
        this.villagerssettlersSlide = null;
        // Array here since we have four frames of data
        // for lines
        this.linesSlide = [];
        this.svgDrawn = false;
        this.introRunning = false;
        this.geometryUris = geometryUris;
        this.startingBounds = startingBounds;
        this.animationQueue = [];

    }

    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    disableMapMovement(map) {
        map.zoomControl.disable();
        map.dragging.disable();
    }

    enableMapMovement(map) {
        map.zoomControl.enable();
        map.dragging.enable();
    }

    stopAll() {
        this.introRunning = false;
        // todo stop path drawing transition
        this.svg.selectAll("*").interrupt();
    }

    clearSvg() {
        this.svg.selectAll("*").remove();
        this.svgDrawn = false;
    }


    async SectionIntro(map, slideid) {
        //&& !this.introRunning
        console.log("SectoinInto: " + slideid);
        if (this.slideIds[slideid + ""]) {
            let introRun = false;
            this.introRunning = true;

            // Clear any existing transitions and elements
            this.stopAll();
            this.clearSvg();

            //map.on("moveend", slideUpdate);
            // Run this when we've reached the story frame
            let playIntro = async function () {
                this.introRunning = true;
                switch (this.slideIds[slideid + ""]) {
                    case "homelands":
                        console.log("homelands");
                        introRun = await this.playHomelandsIntro(map);
                        break;
                    case "pathways1":
                        console.log("pathways1");
                        introRun = await this.playPathways1Intro(map);
                        await this.sleep(2000);
                        this.clearSvg();
                        introRun = await this.playPathways2Intro(map);
                        break;
                    case "pathways2":
                        console.log("pathways2");
                        introRun = await this.playPathways2Intro(map);
                        break;
                    case "villagerssettlers":
                        console.log("settlers");
                        introRun = await this.playvillagerssettlersSlide(map);
                        break;
                    case "lines":
                        console.log("lines");
                        introRun = await this.playLinesIntro(map);
                        break;
                }
                map.off("moveend", playIntro);
            }.bind(this);
            map.on("moveend", playIntro);
            let bounds = null;
            switch (this.slideIds[slideid + ""]) {
                case "homelands":
                    bounds = this.startingBounds.homelands;
                    break;
                case "pathways1":
                    bounds = this.startingBounds.pathways1;
                    break;
                case "pathways2":
                    bounds = this.startingBounds.pathways2;
                    break;
                case "villagerssettlers":
                    bounds = this.startingBounds.villagerssettlers;
                    break;
                case "lines":
                    bounds = this.startingBounds.lines;
                    break;
            }
            if (bounds) {
                map.flyToBounds(bounds);
            }


            this.svgDrawn = introRun;
        }
        return this.svgDrawn;
    }

    async loadShapeFile(shape_url) {
        let response = await fetch(shape_url);
        let json = await response.json();
        return json;
    }

    async loadD3(map) {
        /*Setup overlar pane as d3 */
        this.L.svg({clickable: true}).addTo(map);
        const overlay = this.d3.select(map.getPanes().overlayPane);
        this.svg = overlay.select("svg").attr("pointer-events", "auto");

        /* Line generators that will work with features */
        this.featureLineGenerator = this.d3
            .line()
            .x((d) => map.latLngToLayerPoint([d[1], d[0]]).x)
            .y((d) => map.latLngToLayerPoint([d[1], d[0]]).y);

        return this.svg;
    }

    /** Transform a feature into an svg path
     * Coordinates are reversed by feature line generator
     * @param feature
     * @return svg path string of feature
     */
    featureToPath(feature) {
        let pathString = "";
        switch (feature.geometry.type) {
            case "MultiPolygon":
                pathString = this.featureLineGenerator(
                    feature.geometry.coordinates[0][0]
                );
                break;
            case "MultiLineString":
                pathString = this.featureLineGenerator(feature.geometry.coordinates[0]);
                break;
        }
        return pathString;
    }

    getHomelandLabel(id, european) {
        let label = "";
        if (this.homelandsLabels) {

            for (let x = 0; x < this.homelandsLabels.length; x++) {
                if (parseInt(this.homelandsLabels[x].id) == parseInt(id)) {
                    // console.log(this.homelandsLabels[x]);
                    if (european) {
                        label = this.homelandsLabels[x]["Current normalised text"];
                    } else {
                        label = this.homelandsLabels[x].Indigenous_name;
                    }
                    break;
                }
            }
        }

        return label;
    }

    async drawHomelandsIntro(map, features) {


        this.svg
            .selectAll(".homelands")
            .data(features)
            .join("path")
            .attr("class", "homelands")
            .attr("title", function (d) {
                this.getHomelandLabel(d.properties.id, true);
            }.bind(this))
            .attr("stroke", "black")
            .attr("fill", "none")
            .attr("stroke-width", "0")
            .attr("d", (d) => this.featureToPath(d));

        this.svg
            .selectAll(".homelands") // <-- now we can select the paths and get the bbox
            .each((d, i, nodes) => {
                // https://stackoverflow.com/questions/74358276/add-title-text-to-the-center-of-path-in-d3
                const bbox = this.d3.select(nodes[i]).node().getBBox();
                const centreX = bbox.x + bbox.width / 2; // <-- get x centre
                const centreY = bbox.y + bbox.height / 2;
                this.svg
                    .append("text") // <-- now add the text element
                    .text(this.getHomelandLabel(d.properties.id, true))
                    .attr("indigenousLabel", this.getHomelandLabel(d.properties.id, false))
                    .attr("class", "homelandLabel")
                    .attr("x", centreX)
                    .attr("y", centreY)
                    .attr("fill", "#0804ee")
                    .attr("text-anchor", "middle");
            });
        await this.sleep(2000);

        // Now do the label transition
        this.svg.selectAll(".homelandLabel")
            .transition().delay((d, i) => i * 20).duration(2000).style('opacity', 0).on("end", function (d, i, nodes) {
            nodes[i].innerHTML = nodes[i].getAttribute("indigenousLabel");
            d3.select(nodes[i]).transition().delay((d, i) => i * 20).duration(2000).style('opacity', 1);
        });

    }

    /** Animated intro for the homelands section in D3*/
    async playHomelandsIntro(map) {

        if (!this.homelandsLabels) {
            let homelandsData = await this.loadShapeFile(
                this.geometryUris.homelands
            );
            if (homelandsData) {
                this.homelandsLabels = homelandsData.homelandsData;
            }

        }

        if (this.homelandsSlide) {
            //map.flyToBounds(this.startingBounds.homelands);
            await this.sleep(500);
            await this.drawHomelandsIntro(map, this.homelandsSlide.features);

        } else {
            console.log('homelands slide not present!');
        }

        return true;
    }

    /**
     * The D3 intro for the first pathways section
     * Rivers drawn using dash css method: https://medium.com/@louisemoxy/create-a-d3-line-chart-animation-336f1cb7dd61
     * @param map our leaflet map
     * @return {Promise<void>}
     */
    async playPathways1Intro(map) {
        //map.flyToBounds(this.startingBounds.pathways1);
        await this.sleep(1500);

        if (this.pathways1Slide && this.pathways1Slide.features.length > 0) {
            this.svg
                .selectAll(".river")
                .data(this.pathways1Slide.features)
                .join("path")
                .attr("class", "pathways1 river")
                .attr("stroke", "blue")
                .attr("fill", "none")
                .attr("stroke-width", "1.5")
                .attr("d", (d) => this.featureToPath(d));

            await this.svg
                .selectAll("path.river")
                .each(function (d) {
                    d.totalLength = this.getTotalLength();
                })
                .attr("stroke-dashoffset", (d) => d.totalLength)
                .attr("stroke-dasharray", (d) => d.totalLength)
                .transition()
                .duration(2500)
                .attr("stroke-dashoffset", 0)
                .end();
        }
        return true;
    }

    /**
     Split slides features by shape to display differently in d3
     */
    static splitFeatures(features) {
        let splitFeatures = {
            points: [],
            polys: [],
            lines: [],
        };
        for (let f in features) {
            if (features[f].geometry && features[f].geometry.type) {
                switch (features[f].geometry.type) {
                    case "MultiPolygon":
                        splitFeatures.polys.push(features[f]);
                        break;
                    case "MultiLineString":
                        splitFeatures.lines.push(features[f]);
                        break;
                    case "Point":
                        splitFeatures.points.push(features[f]);

                        break;
                }
            }
        }

        return splitFeatures;
    }

    /** Animated reveal of drawn pathway */
    async drawPathway(feature){
            await this.svg
                .selectAll("path.road-" + feature.properties.id)
                .each(function (d) {
                    d.totalLength = this.getTotalLength();
                })
                .attr("stroke-dashoffset", (d) => d.totalLength)
                .attr("stroke-dasharray", (d) => d.totalLength)
                .attr("opacity", 1)
                .transition()
                .duration(2000)
                .attr("stroke-dashoffset", 0)
                .end();
    }

    /**
     *  Pathways 2 intro (slide 14)
     * @param map
     * @return {Promise<boolean>}
     */
    async playPathways2Intro(map) {
        //map.flyToBounds(this.startingBounds.pathways2);
        //await this.sleep(1500);
        console.log("pathways2");

        if (!this.pathways2Slide || this.pathways2Slide.features.length == 0) {
            return false;
        }


        let splitFeatures = D3intro.splitFeatures(this.pathways2Slide.features);
        if (splitFeatures.lines && splitFeatures.lines.length > 0) {
            this.svg
                .selectAll(".roadHighlight")
                .data(splitFeatures.lines)
                .join("path")
                .attr("class", (d) => "pathways2 roadHighlist road-" + d.properties.id)
                .attr("lineCap", "square")
                .attr("lineJoin", "round")
                .attr("stroke", "#000000")
                .attr("weight", "5")
                .attr("opacity", 0)
                .attr("fill", "none")
                .attr("stroke-width", "5")
                .attr("d", (d) => this.featureToPath(d));

            this.svg
                .selectAll(".road")
                .data(splitFeatures.lines)
                .join("path")
                .attr("class", (d) => "pathways2 road-" + d.properties.id)
                .attr("lineCap", "square")
                .attr("lineJoin", "arcs")
                .attr("stroke", "#FFFFFF")
                .attr("weight", "3")
                .attr("opacity", 1)
                .attr("fill", "none")
                .attr("stroke-width", "3")
                .attr("d", (d) => this.featureToPath(d));


            // Draw these in order so they look better
            await this.drawPathway(splitFeatures.lines[0]);
            await this.drawPathway(splitFeatures.lines[1]);
        }

        // Sort the features so they follow the points order in bcc_slides
        let pointOrder = this.pathways2Slide.points.includes.id;

        let sortedPoints = [];
        for (let o = 0; o < pointOrder.length; o++) {
            for (let p = 0; p < splitFeatures.points.length; p++) {
                if (splitFeatures.points[p].properties.id === pointOrder[o]) {
                    sortedPoints.push(splitFeatures.points[p]);
                    break;
                }
            }
        }

        if (sortedPoints && sortedPoints.length > 0) {
             console.log(sortedPoints);
            //append('img').attr('src',"/assets/icon.svg")
            //d3.select('svg').append('svg:image').attr('id', 'wtf2').attr('width','2%').attr('x', 1247).attr('y',292);
            this.svg
                .selectAll("image.pathways2")
                .data(sortedPoints)
                .join("svg:image")
                .attr("class", "pathways2 dipsites")
                .attr('xlink:href',"/bcc-11ty/assets/img/icons/council-fire.svg")
                .attr('width', "1%")
                .attr(
                    "x",
                    (d) =>
                        map.latLngToLayerPoint([
                            d.geometry.coordinates[1],
                            d.geometry.coordinates[0],
                        ]).x
                )
                .attr(
                    "y",
                    (d) =>
                        map.latLngToLayerPoint([
                            d.geometry.coordinates[1],
                            d.geometry.coordinates[0],
                        ]).y
                ).attr("opacity", 0)
                .transition()
                .delay((d, i) => i * 500)
                .attr("opacity", 1)
                .duration(1000)
                .end();

        }
        return true;
    }

    async playvillagerssettlersSlide(map) {
        /*map.flyToBounds(
            this.startingBounds.villagerssettlers
        );*/
        //await this.sleep(1500);
        if (
            !this.villagerssettlersSlide ||
            this.villagerssettlersSlide.features.length == 0
        ) {
            return false;
        }

        let splitFeatures = D3intro.splitFeatures(
            this.villagerssettlersSlide.features
        );
        //console.log(splitFeatures.points);
        await this.svg
            .selectAll("circle.villagerssettlers")
            .data(splitFeatures.points)
            .join("circle")
            .attr("class", "villagerssettlers")
            .attr("fill", function (d) {
                if (d.properties && d.properties.sub_type == 12) {
                    return "red";
                }
                return "green";
            })
            .attr(
                "cx",
                (d) =>
                    map.latLngToLayerPoint([
                        d.geometry.coordinates[1],
                        d.geometry.coordinates[0],
                    ]).x
            )
            .attr(
                "cy",
                (d) =>
                    map.latLngToLayerPoint([
                        d.geometry.coordinates[1],
                        d.geometry.coordinates[0],
                    ]).y
            )
            .attr("r", 20)
            .transition()
            .attr("r", 3)
            .duration(1000)
            .end();

        let dipsites = [];
        for (let p = 0; p < splitFeatures.points.length; p++) {
            let point = splitFeatures.points[p];
            if (
                point.properties &&
                point.properties.sub_type &&
                point.properties.sub_type == 12
            ) {
                dipsites.push(point);
            }
        }

        let villagerspulseSelector = "circle.villagerssettlers.pulse";

        this.svg
            .selectAll(villagerspulseSelector)
            .data(dipsites)
            .join("circle")
            .attr("class", "villagerssettlers pulse")
            .attr("fill", "black")
            .attr("opacity", "0.5")
            .attr(
                "cx",
                (d) =>
                    map.latLngToLayerPoint([
                        d.geometry.coordinates[1],
                        d.geometry.coordinates[0],
                    ]).x
            )
            .attr(
                "cy",
                (d) =>
                    map.latLngToLayerPoint([
                        d.geometry.coordinates[1],
                        d.geometry.coordinates[0],
                    ]).y
            )
            .attr("r", 3);
        console.log(this.introRunning);
        /*
        for (let c = 0; c < cows.length; c++) {
            promiseArray.push(cows[c].sendCowToHomePen()
            );
        }
        let done = await Promise.all(promiseArray);
         */
        
        await this.pulseTransition(villagerspulseSelector);
        return true;
    }

    async pulseTransition(selector) {
             this.svg
                .selectAll(selector)
                .attr("r", 3)
                .attr("opacity", "0")
                .attr("fill", "black")
                .transition()
                .duration(1000)
                .attr("r", 10)
                .attr("opacity", "0.5")
                .styleTween("fill", () => this.d3.interpolateRgb("black", "red"))
                .transition()
                .duration(500)
                .attr("opacity", "0")
                .end();
        return true;
    }

    /*
    this.lineLandRouteStyle = {
                stroke: true,
                //dashArray: "7 6",
                lineCap: "square",
                lineJoin: "arcs",
                color: "#FFFFFF",
                weight: 3,
                fill: false,
            };
     */
    async drawLines(features, duration, colour, majorClass, minorClass) {
        this.svg
            .selectAll("." + minorClass)
            .data(features)
            .join("path")
            .attr("class", majorClass + " " + minorClass)
            .attr("stroke", colour)
            .attr("fill", "none")
            .attr("stroke-width", "1")
            .attr("d", (d) => this.featureToPath(d));

        return this.svg
            .selectAll("path." + minorClass)
            .each(function (d) {
                d.totalLength = this.getTotalLength();
            })
            .attr("stroke-dashoffset", (d) => d.totalLength)
            .attr("stroke-dasharray", (d) => d.totalLength)
            .transition()
            .duration(duration)
            .attr("stroke-dashoffset", 0)
            .end();
    }

    async playLinesIntro(map) {

        let drawDuration = 2500;
        let colour = "black";
        let majorClass = "lines";
        let minorClass = "border";
        let frameDelay = 1000;

        if (this.linesSlide && this.linesSlide.length > 0) {
            for (let f = 0; f < this.linesSlide.length; f++) {
                if (this.introRunning){
                    await this.drawLines(
                    this.linesSlide[f].features,
                    drawDuration,
                    colour,
                    majorClass,
                    minorClass
                );
                await this.sleep(frameDelay);
                }

            }
        }
        return true;
    }
}
