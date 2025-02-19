/*jshint esversion: 8 */

import {StoryMap} from "./storymap.js";

//Custom Canvas Renderer);


/* eslint-disable */
window.onload = async function () {

    let storyMap = new StoryMap(storyURIs, L, d3);
    storyMap.initMap(startLat, startLng, startZoom);
};
//return storyMap;

/* eslint-enable */
