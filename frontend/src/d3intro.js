/*jshint esversion: 8 */

/*import L from 'leaflet';
import 'leaflet-dvf';
import 'leaflet-textpath';*/

// https://observablehq.com/@sfu-iat355/intro-to-leaflet-d3-interactivity

export class D3intro {
    constructor(geometryUris, L, d3) {
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
        this.startingBounds = {
            homelands: {
                type: "Feature",
                properties: {
                    id: null,
                    FID: 12,
                    Narr_ID: 1,
                    Seq_ID: 90,
                    Desc: "Extent of Indigenous references in 12 Mitchell",
                },
                geometry: {
                    type: "MultiPolygon",
                    coordinates: [
                        [
                            [
                                [-60.375517055951661, 50.495155542044799],
                                [-60.311892185297758, 27.407898583362975],
                                [-109.071321137306086, 27.405734834799336],
                                [-108.827782021299925, 50.546067470988127],
                                [-60.375517055951661, 50.495155542044799],
                            ],
                        ],
                    ],
                },
            },
            pathways1: {
                type: "Feature",
                properties: {
                    id: null,
                    FID: 15,
                    Narr_ID: null,
                    Seq_ID: null,
                    Desc: "smaller_continental",
                },
                geometry: {
                    type: "MultiPolygon",
                    coordinates: [
                        [
                            [
                                [-64.956051523342381, 48.693292043680088],
                                [-65.110629444043951, 28.186892930726643],
                                [-104.228439847563948, 28.299022049289441],
                                [-104.146277556994463, 48.598142453129832],
                                [-64.956051523342381, 48.693292043680088],
                            ],
                        ],
                    ],
                },
            },
            pathways2: {
                type: "Feature",
                properties: {
                    id: null,
                    FID: 10,
                    Narr_ID: 1,
                    Seq_ID: 50,
                    Desc: "Chesapeake Bay area",
                },
                geometry: {
                    type: "MultiPolygon",
                    coordinates: [
                        [
                            [
                                [-80.002479839229679, 40.168441182885317],
                                [-71.788128586561726, 40.178580988048083],
                                [-71.80139894399737, 37.05857933377866],
                                [-80.029020554100995, 37.079756393203311],
                                [-80.002479839229679, 40.168441182885317],
                            ],
                        ],
                    ],
                },
            },
            villagerssettlers: {
                type: "Feature",
                properties: {
                    id: null,
                    FID: 12,
                    Narr_ID: 1,
                    Seq_ID: 90,
                    Desc: "Extent of Indigenous references in 12 Mitchell",
                },
                geometry: {
                    type: "MultiPolygon",
                    coordinates: [
                        [
                            [
                                [-60.375517055951661, 50.495155542044799],
                                [-60.311892185297758, 27.407898583362975],
                                [-109.071321137306086, 27.405734834799336],
                                [-108.827782021299925, 50.546067470988127],
                                [-60.375517055951661, 50.495155542044799],
                            ],
                        ],
                    ],
                },
            },
            lines: {
                type: "Feature",
                properties: {
                    id: null,
                    FID: 11,
                    Narr_ID: 1,
                    Seq_ID: 80,
                    Desc: "Haudenosaunee homelands",
                },
                geometry: {
                    type: "MultiPolygon",
                    coordinates: [
                        [
                            [
                                [-85.118202630673181, 47.604010232134549],
                                [-69.193773707891992, 47.639788180258115],
                                [-69.06107013353548, 39.894094085099951],
                                [-85.118202630673181, 39.914453926386898],
                                [-85.118202630673181, 47.604010232134549],
                            ],
                        ],
                    ],
                },
            },
        };
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
            console.log(this.svgDrawn);
            if (this.svgDrawn) {
                // Clear any existing transitions and elements
                this.stopAll();
                this.clearSvg();
            }
            switch (this.slideIds[slideid + ""]) {
                case "homelands":
                    console.log("homelands");
                    introRun = await this.playHomelandsIntro(map);
                    break;
                case "pathways1":
                    console.log("pathways1");
                    introRun = await this.playPathways1Intro(map);
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

    async drawHomelandsIntro(map, features) {
        this.svg
            .selectAll(".homelands")
            .data(features)
            .join("path")
            .attr("class", "homelands")
            .attr("title", (d) => d.properties.norm_text)
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
                    .text(d.properties.norm_text)
                    .attr("x", centreX)
                    .attr("y", centreY)
                    .attr("fill", "#0804ee")
                    .attr("text-anchor", "middle");
            });
    }

    /** Animated intro for the homelands section in D3*/
    async playHomelandsIntro(map) {

        if (!this.homelandsLabels) {
            this.homelandsLabels = await this.loadShapeFile(
                this.geometryUris.homelands
            );
        }

        if (this.homelandsSlide) {
            map.flyToBounds(this.L.geoJson(this.startingBounds.homelands).getBounds());
            await this.sleep(500);
            await this.drawHomelandsIntro(map, this.homelandsSlide.features);

        } else{
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
        map.flyToBounds(this.L.geoJson(this.startingBounds.pathways1).getBounds());
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

    /**
     *  Pathways 2 intro (slide 14)
     * @param map
     * @return {Promise<boolean>}
     */
    async playPathways2Intro(map) {
        map.flyToBounds(this.L.geoJson(this.startingBounds.pathways2).getBounds());
        await this.sleep(1500);

        if (!this.pathways2Slide || this.pathways2Slide.features.length == 0) {
            return false;
        }

        let splitFeatures = D3intro.splitFeatures(this.pathways2Slide.features);

        if (splitFeatures.lines && splitFeatures.lines.length > 0) {
            this.svg
                .selectAll(".road")
                .data(this.pathways1Slide.features)
                .join("path")
                .attr("class", "pathways2 road")
                .attr("stroke", "brown")
                .attr("fill", "none")
                .attr("stroke-width", "1")
                .attr("d", (d) => this.featureToPath(d));

            await this.svg
                .selectAll("path.road")
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

        if (splitFeatures.points && splitFeatures.points.length > 0) {
            this.svg
                .selectAll("circle.pathways2")
                .data(splitFeatures.points)
                .join("circle")
                .attr("class", "pathways2 dipsites")
                .attr("fill", "red")
                .attr("stroke", "black")
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
                .attr("r", 5)
                .duration(1000)
                .end();
        }
        return true;
    }

    async playvillagerssettlersSlide(map) {
        map.flyToBounds(
            this.L.geoJson(this.startingBounds.villagerssettlers).getBounds()
        );
        await this.sleep(1500);
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

        this.pulseTransition(villagerspulseSelector);
        return true;
    }

    async pulseTransition(selector) {
        // .attr("opacity", "0.5")
        while (this.introRunning) {
            await this.svg
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
        }

        return true;
    }

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
        map.flyToBounds(this.L.geoJson(this.startingBounds.lines).getBounds());

        let drawDuration = 2500;
        let colour = "red";
        let majorClass = "lines";
        let minorClass = "border";
        let frameDelay = 1000;

        if (this.linesSlide && this.linesSlide.length > 0) {
            for (let f = 0; f < this.linesSlide.length; f++) {
                //console.log(this.linesFeatures[f]);
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
        return true;
    }
}
