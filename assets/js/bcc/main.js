(()=>{"use strict";class t{constructor(t,e,s){this.slideIds={5:"homelands",18:"pathways1",14:"pathways2",20:"villagerssettlers",30:"lines"},this.L=e,this.d3=s,this.homelandsSlide=null,this.pathways1Slide=null,this.pathways2Slide=null,this.villagerssettlersSlide=null,this.linesSlide=[],this.svgDrawn=!1,this.introRunning=!1,this.geometryUris=t,this.startingBounds={homelands:{type:"Feature",properties:{id:null,FID:12,Narr_ID:1,Seq_ID:90,Desc:"Extent of Indigenous references in 12 Mitchell"},geometry:{type:"MultiPolygon",coordinates:[[[[-60.37551705595166,50.4951555420448],[-60.31189218529776,27.407898583362975],[-109.07132113730609,27.405734834799336],[-108.82778202129992,50.54606747098813],[-60.37551705595166,50.4951555420448]]]]}},pathways1:{type:"Feature",properties:{id:null,FID:15,Narr_ID:null,Seq_ID:null,Desc:"smaller_continental"},geometry:{type:"MultiPolygon",coordinates:[[[[-64.95605152334238,48.69329204368009],[-65.11062944404395,28.186892930726643],[-104.22843984756395,28.29902204928944],[-104.14627755699446,48.59814245312983],[-64.95605152334238,48.69329204368009]]]]}},pathways2:{type:"Feature",properties:{id:null,FID:10,Narr_ID:1,Seq_ID:50,Desc:"Chesapeake Bay area"},geometry:{type:"MultiPolygon",coordinates:[[[[-80.00247983922968,40.16844118288532],[-71.78812858656173,40.17858098804808],[-71.80139894399737,37.05857933377866],[-80.029020554101,37.07975639320331],[-80.00247983922968,40.16844118288532]]]]}},villagerssettlers:{type:"Feature",properties:{id:null,FID:12,Narr_ID:1,Seq_ID:90,Desc:"Extent of Indigenous references in 12 Mitchell"},geometry:{type:"MultiPolygon",coordinates:[[[[-60.37551705595166,50.4951555420448],[-60.31189218529776,27.407898583362975],[-109.07132113730609,27.405734834799336],[-108.82778202129992,50.54606747098813],[-60.37551705595166,50.4951555420448]]]]}},lines:{type:"Feature",properties:{id:null,FID:11,Narr_ID:1,Seq_ID:80,Desc:"Haudenosaunee homelands"},geometry:{type:"MultiPolygon",coordinates:[[[[-85.11820263067318,47.60401023213455],[-69.19377370789199,47.639788180258115],[-69.06107013353548,39.89409408509995],[-85.11820263067318,39.9144539263869],[-85.11820263067318,47.60401023213455]]]]}}}}sleep(t){return new Promise((e=>setTimeout(e,t)))}disableMapMovement(t){t.zoomControl.disable(),t.dragging.disable()}enableMapMovement(t){t.zoomControl.enable(),t.dragging.enable()}stopAll(){this.introRunning=!1,this.svg.selectAll("*").interrupt()}clearSvg(){this.svg.selectAll("*").remove(),this.svgDrawn=!1}async SectionIntro(t,e){if(this.slideIds[e+""]&&!this.introRunning){let s=!1;switch(this.introRunning=!0,this.svgDrawn&&(this.stopAll(),this.clearSvg()),this.slideIds[e+""]){case"homelands":console.log("homelands"),s=await this.playHomelandsIntro(t);break;case"pathways1":console.log("pathways1"),s=await this.playPathways1Intro(t);break;case"pathways2":console.log("pathways2"),s=await this.playPathways2Intro(t);break;case"villagerssettlers":console.log("settlers"),s=await this.playvillagerssettlersSlide(t);break;case"lines":console.log("lines"),s=await this.playLinesIntro(t)}this.svgDrawn=s}return this.svgDrawn}async loadShapeFile(t){let e=await fetch(t);return await e.json()}async loadD3(t){this.L.svg({clickable:!0}).addTo(t);const e=this.d3.select(t.getPanes().overlayPane);return this.svg=e.select("svg").attr("pointer-events","auto"),this.featureLineGenerator=this.d3.line().x((e=>t.latLngToLayerPoint([e[1],e[0]]).x)).y((e=>t.latLngToLayerPoint([e[1],e[0]]).y)),this.svg}featureToPath(t){let e="";switch(t.geometry.type){case"MultiPolygon":e=this.featureLineGenerator(t.geometry.coordinates[0][0]);break;case"MultiLineString":e=this.featureLineGenerator(t.geometry.coordinates[0])}return e}async drawHomelandsIntro(t,e){this.svg.selectAll(".homelands").data(e).join("path").attr("class","homelands").attr("title",(t=>t.properties.norm_text)).attr("stroke","black").attr("fill","none").attr("stroke-width","0").attr("d",(t=>this.featureToPath(t))),this.svg.selectAll(".homelands").each(((t,e,s)=>{const i=this.d3.select(s[e]).node().getBBox(),r=i.x+i.width/2,l=i.y+i.height/2;this.svg.append("text").text(t.properties.norm_text).attr("x",r).attr("y",l).attr("fill","#0804ee").attr("text-anchor","middle")}))}async playHomelandsIntro(t){return this.homelandsLabels||(this.homelandsLabels=await this.loadShapeFile(this.geometryUris.homelands)),t.flyToBounds(this.L.geoJson(this.startingBounds.homelands).getBounds()),await this.sleep(500),await this.drawHomelandsIntro(t,this.homelandsSlide.features),!0}async playPathways1Intro(t){return t.flyToBounds(this.L.geoJson(this.startingBounds.pathways1).getBounds()),await this.sleep(1500),this.pathways1Slide&&this.pathways1Slide.features.length>0&&(this.svg.selectAll(".river").data(this.pathways1Slide.features).join("path").attr("class","pathways1 river").attr("stroke","blue").attr("fill","none").attr("stroke-width","1.5").attr("d",(t=>this.featureToPath(t))),await this.svg.selectAll("path.river").each((function(t){t.totalLength=this.getTotalLength()})).attr("stroke-dashoffset",(t=>t.totalLength)).attr("stroke-dasharray",(t=>t.totalLength)).transition().duration(2500).attr("stroke-dashoffset",0).end()),!0}static splitFeatures(t){let e={points:[],polys:[],lines:[]};for(let s in t)if(t[s].geometry&&t[s].geometry.type)switch(t[s].geometry.type){case"MultiPolygon":e.polys.push(t[s]);break;case"MultiLineString":e.lines.push(t[s]);break;case"Point":e.points.push(t[s])}return e}async playPathways2Intro(e){if(e.flyToBounds(this.L.geoJson(this.startingBounds.pathways2).getBounds()),await this.sleep(1500),!this.pathways2Slide||0==this.pathways2Slide.features.length)return!1;let s=t.splitFeatures(this.pathways2Slide.features);return s.lines&&s.lines.length>0&&(this.svg.selectAll(".road").data(this.pathways1Slide.features).join("path").attr("class","pathways2 road").attr("stroke","brown").attr("fill","none").attr("stroke-width","1").attr("d",(t=>this.featureToPath(t))),await this.svg.selectAll("path.road").each((function(t){t.totalLength=this.getTotalLength()})).attr("stroke-dashoffset",(t=>t.totalLength)).attr("stroke-dasharray",(t=>t.totalLength)).transition().duration(2500).attr("stroke-dashoffset",0).end()),s.points&&s.points.length>0&&this.svg.selectAll("circle.pathways2").data(s.points).join("circle").attr("class","pathways2 dipsites").attr("fill","red").attr("stroke","black").attr("cx",(t=>e.latLngToLayerPoint([t.geometry.coordinates[1],t.geometry.coordinates[0]]).x)).attr("cy",(t=>e.latLngToLayerPoint([t.geometry.coordinates[1],t.geometry.coordinates[0]]).y)).attr("r",20).transition().attr("r",5).duration(1e3).end(),!0}async playvillagerssettlersSlide(e){if(e.flyToBounds(this.L.geoJson(this.startingBounds.villagerssettlers).getBounds()),await this.sleep(1500),!this.villagerssettlersSlide||0==this.villagerssettlersSlide.features.length)return!1;let s=t.splitFeatures(this.villagerssettlersSlide.features);await this.svg.selectAll("circle.villagerssettlers").data(s.points).join("circle").attr("class","villagerssettlers").attr("fill",(function(t){return t.properties&&12==t.properties.sub_type?"red":"green"})).attr("cx",(t=>e.latLngToLayerPoint([t.geometry.coordinates[1],t.geometry.coordinates[0]]).x)).attr("cy",(t=>e.latLngToLayerPoint([t.geometry.coordinates[1],t.geometry.coordinates[0]]).y)).attr("r",20).transition().attr("r",3).duration(1e3).end();let i=[];for(let t=0;t<s.points.length;t++){let e=s.points[t];e.properties&&e.properties.sub_type&&12==e.properties.sub_type&&i.push(e)}let r="circle.villagerssettlers.pulse";return this.svg.selectAll(r).data(i).join("circle").attr("class","villagerssettlers pulse").attr("fill","black").attr("opacity","0.5").attr("cx",(t=>e.latLngToLayerPoint([t.geometry.coordinates[1],t.geometry.coordinates[0]]).x)).attr("cy",(t=>e.latLngToLayerPoint([t.geometry.coordinates[1],t.geometry.coordinates[0]]).y)).attr("r",3),this.pulseTransition(r),!0}async pulseTransition(t){for(;this.introRunning;)await this.svg.selectAll(t).attr("r",3).attr("opacity","0").attr("fill","black").transition().duration(1e3).attr("r",10).attr("opacity","0.5").styleTween("fill",(()=>this.d3.interpolateRgb("black","red"))).transition().duration(500).attr("opacity","0").end();return!0}async drawLines(t,e,s,i,r){return this.svg.selectAll("."+r).data(t).join("path").attr("class",i+" "+r).attr("stroke",s).attr("fill","none").attr("stroke-width","1").attr("d",(t=>this.featureToPath(t))),this.svg.selectAll("path."+r).each((function(t){t.totalLength=this.getTotalLength()})).attr("stroke-dashoffset",(t=>t.totalLength)).attr("stroke-dasharray",(t=>t.totalLength)).transition().duration(e).attr("stroke-dashoffset",0).end()}async playLinesIntro(t){if(t.flyToBounds(this.L.geoJson(this.startingBounds.lines).getBounds()),this.linesSlide&&this.linesSlide.length>0)for(let t=0;t<this.linesSlide.length;t++)await this.drawLines(this.linesSlide[t].features,2500,"red","lines","border"),await this.sleep(1e3);return!0}}new class{constructor(t,e,s){this.overlay=null,this.storyUris=t,this.map=null,this.L=e,this.d3=s,this.layerGroups={},this.storyFrames=[],this.featureTypes=["points","lines","polys"],this.mapMinZoom=1,this.mapMaxZoom=11,this.slideElementTagName="article",this.topSlideElement=null,this.highlightLineStyle={stroke:!0,color:"#0000ff",weight:5,opacity:1},this.defaultLineStyle={stroke:!0,color:"#ff0000",fillColor:"#ff0000",weight:2,opacity:.6,fill:!0},this.slides={},this.lastSlideDisplayed=null,this.slideElements={},this.allFeatures=[],this.allFeaturesLayer=null,this.textFeatures={},this.textMinZoomLevel=8,this.defaultTextAttributes={fill:"black","font-family":"EB Garamond, serif","font-weight":"bold",dx:"15%"},this.initStyles(),this.mapLookup={1:"White, 1590",2:"Bleau, 1650",3:"Seller, 1676",4:"n/a",5:"Foster, 1677",6:"Moll, 1720",7:"Burghers, 1738",8:"Evans, 1752",9:"n/a",10:"Herbert, 1755",11:"Moll, 1755",12:"Mitchell, 1755",13:"Bowen, 1772",14:"Jeffreys, 1774",15:"Hutchins, 1778",16:"Cary,  1783",17:"Buell, 1784",18:"Russell, 1794",19:"Bradley, 1796"},this.exploreFilterControl={id:0,fid:0,sub_type:[[],[],[],[],[],[],[],[],[],[],[],[],[]],maps:[],features:[],lines:{includes:{},excludes:{}},points:{includes:{},excludes:{}},polys:{includes:{},excludes:{}},excludes:{}},this.initExploreFilters()}initStyles(){this.lineBorderStyle={stroke:!0,dashArray:"3 6",lineCap:"square",color:"#000000",weight:2.5,fill:!1},this.lineLandRouteStyle={stroke:!0,dashArray:"7 6",lineCap:"square",lineJoin:"arcs",color:"#808080",weight:3,fill:!1},this.lineSeaRouteStyle={stroke:!0,dashArray:"7 6",lineCap:"square",lineJoin:"arcs",color:"#ffbd59",weight:3,fill:!1},this.lineRiverRouteStyle={stroke:!0,dashArray:"7 9",color:"#00c2cb",lineCap:"square",lineJoin:"round",weight:2,fill:!1,opacity:.1},this.lineRiverRouteStyleLabel={stroke:!0,smoothFactor:15,dashArray:"7 9",color:"#000000FF",lineCap:"square",lineJoin:"round",weight:2,fill:!1},this.lineMiscStyle={stroke:!0,color:"#ffff00",weight:4,fill:!1},this.lineToponymStyle={stroke:!0,color:"#ff0000",weight:5,fill:!1},this.polyBorderStyle={stroke:!0,dashArray:"4 6",color:"#000000",fillColor:"#000000",lineCap:"square",weight:2,fill:!0,opacity:.5,fillOpacity:.25},this.polySettlementStyle={stroke:!0,dashArray:"2 6",lineCap:"square",lineJoin:"arcs",color:"#ff0000",fillColor:"#ff0000",weight:2,fill:!0,opacity:.75,fillOpacity:.5},this.polySeaRouteStyle={stroke:!0,dashArray:"7 6",lineCap:"square",lineJoin:"arcs",color:"#ffbd59",fillColor:"#ffbd59",weight:2,fill:!0,opacity:.75,fillOpacity:.5},this.polyDescriptiveStyle={stroke:!0,fillColor:"#ff0000",weight:1,fill:!0,opacity:.5,fillOpacity:.5},this.polyRiverRouteStyle={stroke:!0,dashArray:"7 6",lineCap:"square",lineJoin:"arcs",color:"#00c2cb",fillColor:"#00c2cb",weight:2,fill:!0,opacity:.75,fillOpacity:.5},this.polyMiscStyle={stroke:!0,fillColor:"#ff0000",weight:1,fill:!0,opacity:.5,fillOpacity:.5},this.polyNativeStyle={stroke:!0,fillColor:"#ff0000",weight:1,fill:!0,opacity:.5,fillOpacity:.5},this.polyEuroStyle={stroke:!0,fillColor:"#00ff00",weight:1,fill:!0,opacity:.5,fillOpacity:.5},this.polyAnnoStyle={stroke:!0,dashArray:"10 10",lineCap:"square",lineJoin:"arcs",color:"#808080",fillColor:"#808080",weight:1,fill:!0,opacity:1,fillOpacity:.5},this.polyToponymStyle={stroke:!0,dashArray:"7 6",lineCap:"square",lineJoin:"arcs",color:"#ff0000",fillColor:"#ff0000",weight:1,fill:!0,opacity:.5,fillOpacity:.5}}async loadShapeFile(t){let e=await fetch(t);return await e.json()}async loadShapes(t){let e=[],s=[],i=[];for(let s=0;s<t.length;s++)e.push(this.loadShapeFile(t[s]));await Promise.all(e).then((t=>{for(let e=0;e<t.length;e++)s.push(...t[e].features)}));for(let t=0;t<s.length;t++){let e=s[t];e.properties&&(this.allFeatures.push(e),i.push(e))}return i}async loadSlides(){if(this.storyUris&&this.storyUris.slides){let t=await this.loadShapeFile(this.storyUris.slides);this.slides=t.slides}}getSlideById(t){for(let e=0;e<this.slides.length;e++)if(this.slides[e].id==t)return this.slides[e]}pointToLayer(t,e){switch(t.properties.sub_type){case 1:case 5:return this.L.circleMarker(e,{radius:4,fillColor:"#0000ff",color:"#000",weight:.5,opacity:1,fillOpacity:1,bubblingMouseEvents:!0});case 4:return 1===t.properties.identity?new this.L.RegularPolygonMarker(e,{numberOfSides:4,rotation:-45,radius:5,fill:!0,fillColor:"#124d20",color:"#124d20",weight:.5,fillOpacity:1,stroke:!0,bubblingMouseEvents:!0}):this.L.circleMarker(e,{radius:5,fillColor:"#ff0000",color:"#ff000",weight:.5,opacity:1,fillOpacity:1,bubblingMouseEvents:!0});case 6:return this.L.circleMarker(e,{radius:4,fillColor:"#ffbd59",color:"#ffbd59",weight:.5,opacity:1,fillOpacity:.9,bubblingMouseEvents:!0});case 7:return new this.L.RegularPolygonMarker(e,{numberOfSides:4,rotation:-45,radius:5,fill:!0,fillColor:"#ffffff",color:"#000000",weight:.5,fillOpacity:1,stroke:!0,bubblingMouseEvents:!0});case 8:return this.L.circleMarker(e,{radius:4,fillColor:"#ff00ff",color:"#000",weight:.5,opacity:1,fillOpacity:1,bubblingMouseEvents:!0});case 9:return this.L.circleMarker(e,{radius:4,fillColor:"#000000",color:"#000",weight:.5,opacity:1,fillOpacity:1,bubblingMouseEvents:!0});case 10:return 1===t.properties.identity?this.L.circleMarker(e,{radius:5,fillColor:"#800080",color:"#800080",weight:1,opacity:1,fillOpacity:.6,bubblingMouseEvents:!0}):this.L.circleMarker(e,{radius:5,fillColor:"#FFFF00",color:"#FFFF00",weight:.5,opacity:1,fillOpacity:1,bubblingMouseEvents:!0});default:return this.L.circleMarker(e,{radius:4,fillColor:"#000ff",color:"#oooff",weight:.5,opacity:1,fillOpacity:1,bubblingMouseEvents:!0})}}initStoryFeatureLayers(){for(let t=0;t<this.slides.length;t++){let e=this.slides[t];e.layer=this.L.geoJSON(e.features,{pointToLayer:this.pointToLayer.bind(this),onEachFeature:this.onEachFeature.bind(this)})}}initAllFeaturesLayer(){this.allFeaturesLayer=this.L.geoJSON(this.allFeatures,{pointToLayer:this.pointToLayer.bind(this),onEachFeature:this.onEachFeature.bind(this)})}getSlideElements(){this.slideElements=Array.from(document.getElementsByTagName(this.slideElementTagName)),this.slideElements.sort((function(t,e){return t.offsetTop<0?1:e.offsetTop<0?-1:t.offsetTop-e.offsetTop}))}fadeLayerLeaflet(t,e,s,i,r){let l=e;setTimeout((function e(){l<s&&(t.setStyle({opacity:l,fillOpacity:l}),l+=i),setTimeout(e,r)}),r)}async triggerSlideMapEvents(t){if(this.d3Intro.slideIds[t+""])this.storyFeatureLayerGroup.clearLayers(),this.d3Intro.SectionIntro(this.map,t,this.slides);else if("explore"!=t){this.d3Intro.svgDrawn&&(this.d3Intro.stopAll(),this.d3Intro.clearSvg());let e=this.getSlideById(t);if(e){if(this.clearFeatureText(),e.layer&&this.storyFeatureLayerGroup.clearLayers(),this.map.flyToBounds(this.getStoryFrameBounds(e.fid)),e.layer){let t=function(){e.layer.setStyle({opacity:0,fillOpacity:0}),this.storyFeatureLayerGroup.addLayer(e.layer),this.fadeLayerLeaflet(e.layer,0,.8,.2,.01),this.map.off("moveend",t)}.bind(this);this.map.on("moveend",t)}this.lastSlideDisplayed=e}}else"explore"==t&&(this.storyFeatureLayerGroup.clearLayers(),this.loadExploreLayer())}async initMap(e,s,i){this.map=this.L.map("basemap",{scrollWheelZoom:!1,zoomControl:!1}),this.L.control.zoom({position:"bottomleft"}).addTo(this.map),this.overlay=this.L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}",{minZoom:this.mapMinZoom,maxZoom:this.mapMaxZoom,attribution:"ESRI World Terrain",opacity:1}).addTo(this.map);var r=this.L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}",{minZoom:this.mapMinZoom,maxZoom:this.mapMaxZoom,attribution:"ESRI World Terrain",opacity:1}),l=this.L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",{minZoom:this.mapMinZoom,maxZoom:this.mapMaxZoom,attribution:"ESRI World Street Map",opacity:1}),a={"Clean Terrain":r,BCC:this.L.tileLayer("https://api.mapbox.com/styles/v1/neiljakeman1000/cljyd364o006701pdgs7ec6qa/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibmVpbGpha2VtYW4xMDAwIiwiYSI6ImNqcGpoenBtdDA2aTczdnBmYjhsNGc5c2oifQ.vqIAnhyoZnnNeBsaNOzQGw",{tileSize:512,zoomOffset:-1,minZoom:this.mapMinZoom,maxZoom:this.mapMaxZoom,attribution:"MapBox BCC",opacity:1}),"Modern Open Street Map":l};this.L.control.layers(a,{},{position:"bottomleft",collapsed:!1}).addTo(this.map),this.map.setView([e,s],i),this.storyFeatureLayerGroup=this.L.layerGroup().addTo(this.map),await this.loadSlides(),await this.loadStoryFrames(),await this.loadFeatures(),this.attachMapEvents(),this.initStoryFeatureLayers(),this.initAllFeaturesLayer(),this.getSlideElements();let o={},n=new IntersectionObserver(function(t){t.forEach((t=>{!0===t.isIntersecting&&t.target.dataset.slideid?o[t.target.dataset.slideid]=setTimeout(function(){t.target.dataset.isActive="true",this.triggerSlideMapEvents(t.target.dataset.slideid)}.bind(this),1e3):t.isVisible||(t.target.dataset.slideid in o&&clearTimeout(o[t.target.dataset.slideid]),t.target.dataset.isActive&&(t.target.removeAttribute("data-isActive"),this.storyFeatureLayerGroup.clearLayers()))}))}.bind(this),{threshold:[.5]});for(let t=0;t<this.slideElements.length;t++)n.observe(this.slideElements[t]);n.observe(document.getElementById("filters")),this.d3Intro=new t(this.storyUris,this.L,this.d3),this.d3Intro.homelandsSlide=this.getSlideById(102),this.d3Intro.pathways1Slide=this.getSlideById(1031),this.d3Intro.pathways2Slide=this.getSlideById(1032),this.d3Intro.villagerssettlersSlide=this.getSlideById(104),this.d3Intro.linesSlide.push(this.getSlideById(1051)),this.d3Intro.linesSlide.push(this.getSlideById(1052)),this.d3Intro.linesSlide.push(this.getSlideById(1053)),this.d3Intro.linesSlide.push(this.getSlideById(1054)),this.svg=await this.d3Intro.loadD3(this.map)}clearFeatureText(){this.storyFeatureLayerGroup.eachLayer(function(t){let e=t._layers;for(let[t,s]of Object.entries(e)){let e=s.feature.properties.id;t&&this.textFeatures[e]&&null!=s._text&&s.setText(null)}}.bind(this))}attachMapEvents(){this.map.on("zoomend",function(){let t=this.map.getZoom()+4+"px";this.storyFeatureLayerGroup.eachLayer(function(e){if(this.clonedRiverLayer&&e==this.clonedRiverLayer){let s=e._layers;for(let[e,i]of Object.entries(s)){let s=i.feature.properties.id;if(e&&this.textFeatures[s]&&(i.setText(null),this.map.getZoom()>=this.textMinZoomLevel)){let e=this.defaultTextAttributes;e["font-size"]=t,i.setText(this.textFeatures[s].text,{orientation:this.textFeatures[s].orientation,offset:5,center:!0,attributes:e})}}}}.bind(this))}.bind(this))}onEachFeature(t,e){switch((t.properties&&(t.properties.map_text||t.properties.norm_text)||t.properties.Name)&&(t.properties.map_text?(e.bindPopup(t.properties.map_text),t.properties.date_yr&&e.bindPopup(t.properties.map_text+"</br><strong>"+this.mapLookup[t.properties.map_source]+"</stong>")):t.properties.norm_text?(e.bindPopup(t.properties.norm_text),t.properties.date_yr&&e.bindPopup(t.properties.norm_text+"</br><strong>"+this.mapLookup[t.properties.map_source]+"</stong>")):e.bindPopup(t.properties.Name+"</br><strong>Native Land Data API</strong>")),t.geometry.type){case"Point":break;case"MultiPolygon":switch(t.properties.sub_type){case 3:e.setStyle(this.polyBorderStyle);break;case 4:e.setStyle(this.polySettlementStyle);break;case 6:e.setStyle(this.polySeaRouteStyle);break;case 7:e.setStyle(this.polyDescriptiveStyle);break;case 8:e.setStyle(this.polyRiverRouteStyle);break;case 9:e.setStyle(this.polyMiscStyle);break;case 10:e.setStyle(this.polyToponymStyle);break;case 11:switch(t.properties.identity){case 2:e.setStyle(this.polyNativeStyle);break;case 3:e.setStyle(this.polyAnnoStyle);break;default:e.setStyle(this.polyEuroStyle)}}break;case"MultiLineString":switch(t.properties.sub_type){case 3:e.setStyle(this.lineBorderStyle),e.setText(t.properties.norm_text);break;case 5:e.setStyle(this.lineLandRouteStyle),e.setText(t.properties.norm_text);break;case 6:e.setStyle(this.lineSeaRouteStyle),e.setText(t.properties.norm_text);break;case 8:e.setStyle(this.lineRiverRouteStyle);break;case 9:e.setStyle(this.lineMiscStyle),e.setText(t.properties.norm_text);break;case 10:e.setStyle(this.lineToponymStyle),e.setText(t.properties.norm_text)}break;default:e.setStyle(this.defaultLineStyle)}}getStoryFrameBounds(t){for(let e=0;e<this.storyFrames.length;e++)if(this.storyFrames[e].FID==t)return this.storyFrames[e].bounds;return null}async loadStoryFrames(){if(this.storyUris&&this.storyUris.storyFrame){let t=await this.loadShapeFile(this.storyUris.storyFrame);for(let e=0;e<t.features.length;e++){let s=t.features[e],i=this.L.geoJson(s.geometry).getBounds();this.storyFrames.push({FID:s.properties.FID,feature:s,bounds:i})}}}async loadFeatures(){if(this.storyUris&&this.storyUris.lines){let t=await this.loadShapes([this.storyUris.lines]);for(let e=0;e<t.length;e++)this.addFeatureToAllSlides("lines",t[e]);t=await this.loadShapes([this.storyUris.points]);for(let e=0;e<t.length;e++)this.addFeatureToAllSlides("points",t[e]);t=await this.loadShapes([this.storyUris.polys]);for(let e=0;e<t.length;e++)this.addFeatureToAllSlides("polys",t[e]);t=await this.loadShapeFile([this.storyUris.indigenous]);for(let e=0;e<t.features.length;e++)this.addFeatureToAllSlides("indigenous",t.features[e])}}addSubtypeFilter(t,e,s){if(this.exploreFilterControl.sub_type&&this.exploreFilterControl.sub_type.length>=e){const i=this.exploreFilterControl.sub_type[t].indexOf(e);s&&i<0?this.exploreFilterControl.sub_type[t].push(e):s||this.exploreFilterControl.sub_type[t].splice(i,1)}}initExploreFilters(){let t=document.querySelectorAll("input.map_filter");if(t)for(let e=0;e<t.length;e++)t[e].addEventListener("click",this.mapFilterClickEvent.bind(this));let e=document.querySelectorAll("input.explore_filter");if(e)for(let t=0;t<e.length;t++)e[t].addEventListener("click",this.subtypeFilterClickEvent.bind(this))}mapFilterClickEvent(t){let e=t.target.dataset;if(e){const t=parseInt(e.filtervalue),s=this.exploreFilterControl.maps.indexOf(t);s<0?this.exploreFilterControl.maps.push(t):this.exploreFilterControl.maps.splice(s,1),this.applyExploreFilters()}}subtypeFilterClickEvent(t){let e=t.target.dataset;if(e){const s=JSON.parse(e.filtervalue);if(s.sub_type){let e=s.sub_type;for(let i=0;i<s.identity.length;i++)this.addSubtypeFilter(e,s.identity[i],t.target.checked)}this.applyExploreFilters()}}applyExploreFilters(){this.storyFeatureLayerGroup.clearLayers();let t=[],e=[];if(this.allFeatures&&(console.log(this.exploreFilterControl.sub_type),this.allFeatures.forEach(function(t){let s=-1;t.properties&&this.exploreFilterControl.sub_type[0].length>0?s=0:t.properties&&t.properties.sub_type&&(s=t.properties.sub_type),t.properties&&t.properties.identity&&this.exploreFilterControl.sub_type[s].indexOf(t.properties.identity)>-1&&e.push(t)}.bind(this))),this.exploreFilterControl.maps.length>0){let s=this.allFeatures;e.length>0&&(s=e),s.forEach(function(e){e.properties&&e.properties.map_source&&this.exploreFilterControl.maps.indexOf(e.properties.map_source)>-1&&t.push(e)}.bind(this))}else t=e;t&&t.length>0&&(this.exploreFeaturesLayer=this.L.geoJSON(t,{pointToLayer:this.pointToLayer.bind(this),onEachFeature:this.onEachFeature.bind(this)}),this.storyFeatureLayerGroup.addLayer(this.exploreFeaturesLayer)),console.log(t)}filterFeature(t,e){let s=!1;for(const[i,r]of Object.entries(e)){if("id"==i&&i in t.properties&&r.includes(t.properties.id)){s=!0;break}if(!(i in t.properties)||!r.includes(t.properties[i])){s=!1;break}s=!0}return s}includeFeature(t,e,s){let i=!1;switch(e){case"lines":s.lines&&(s.lines.includes&&(i=this.filterFeature(t,s.lines.includes)),s.lines.excludes&&!0===i&&(i=!this.filterFeature(t,s.lines.excludes)));break;case"polys":s.polys&&(s.polys.includes&&(i=this.filterFeature(t,s.polys.includes)),s.polys.excludes&&!0===i&&(i=!this.filterFeature(t,s.polys.excludes)));break;case"points":s.points&&(s.points.includes&&(i=this.filterFeature(t,s.points.includes)),s.points.excludes&&!0===i&&(i=!this.filterFeature(t,s.points.excludes)));break;case"indigenous":s.indigenous&&(i=this.filterFeature(t,s.indigenous.includes))}return i}addFeatureToAllSlides(t,e){for(let s=0;s<this.slides.length;s++){let i=this.slides[s];this.includeFeature(e,t,i)&&i.features.push(e)}}loadExploreLayer(){}}(storyURIs,L,d3).initMap(startLat,startLng,startZoom)})();