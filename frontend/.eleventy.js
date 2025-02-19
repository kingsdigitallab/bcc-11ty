const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const utils = require("./_includes/js/utils.js");
const Image = require("@11ty/eleventy-img");
const {eleventyImageTransformPlugin} = require("@11ty/eleventy-img");


const inspect = require("util").inspect;
const path = require("node:path");
const debug = require("debug")("Eleventy:KDL");
const markdownItEleventyImg = require("markdown-it-eleventy-img");
const markdownItContainer = require("markdown-it-container");
//const {EleventyRenderPlugin} = require("@11ty/eleventy");
const stripHtml = require("string-strip-html");
const markdownIt = require("markdown-it");
const markdownItAttrs = require('markdown-it-attrs');


function sortByOrderNo(a, b) {
    if (a.orderno > b.orderno) {
        return 1;
    } else if (a.orderno < b.orderno) {
        return -1;
    }
    return 0;
}

module.exports = async function (config) {
    const {EleventyRenderPlugin} = await import("@11ty/eleventy");
    utils.configureMarkdown(config);
    config.addPlugin(eleventyNavigationPlugin);
    utils.configureSass(config);

    config.addPlugin(eleventyImageTransformPlugin, {
        // which file extensions to process
        extensions: "html",

        // Add any other Image utility options here:
        outputDir: '../html/assets/img',
        urlPath: '/assets/img',

        // optional, output image formats
        formats: ["webp", "jpeg"],
        //formats: ["auto"],

        // optional, output image widths
        widths: [300, 600, 1200],

        // optional, attributes assigned on <img> override these values.
        defaultAttributes: {
            sizes: [300, 600, 1200],
            loading: "lazy",
            decoding: "async",
        },
    });


    // just copy the assets folder as is to the static site html
    // config.addPassthroughCopy("**/*.css");
    //config.addPassthroughCopy("assets/node_modules");

    config.addPassthroughCopy({
        "../node_modules/leaflet/dist": "assets/vendor/leaflet/dist",
        "../node_modules/leaflet-dvf/dist": "assets/vendor/leaflet-dvf/dist",
        "../node_modules/leaflet-textpath": "assets/vendor/leaflet-textpath",
        "../node_modules/d3/dist": "assets/vendor/d3/dist"
    });

    config.addPassthroughCopy("assets/fonts");
    config.addPassthroughCopy("assets/img");
    config.addPassthroughCopy("assets/js");
    config.addPassthroughCopy("assets/json");

    // {{ myvar | debug }} => displays full content of myvar object
    config.addFilter("debug", (content) => `<pre>${inspect(content)}</pre>`);

    // Returns all entries from an array which have a given value for a given property
    // Note: this filter can't beused in a {% for loop, use {% assign first
    // {{ collections.posts | lookup:'.categories','news' }}
    config.addFilter(
        "lookup",
        function (collection, property_path, accepted_values) {
            return utils.lookup(collection, property_path, accepted_values);
        }
    );

    let options = {
        html: true,
    };

    const md = new markdownIt(options).use(markdownItContainer, "slide", {
        validate: function (params) {
            //return params.trim().match(/^slide\s+(.*)$/);
            return true;
        },
        render: function (tokens, idx) {
            let m = tokens[idx].info.trim().match(/^slide\s+(\d*).*$/);
            if (tokens[idx].nesting === 1) {
                // opening tag
                //return '<details><summary>' + md.utils.escapeHtml(m[1]) + '</summary>\n';
                if (m) {
                    return (
                        '<article class="mapSlide" id="slide_' +
                        md.utils.escapeHtml(m[1]) +
                        '" data-slideId="' +
                        md.utils.escapeHtml(m[1]) +
                        '">'
                    );
                } else {
                    return "<article>";
                }
            } else {
                // closing tag
                return "</article>\n<div class=\"article_spacer\">&nbsp;</div>";
            }
        },
        marker: ":",
    }).use(
        markdownItAttrs, {
            // optional, these are default options
            leftDelimiter: '{',
            rightDelimiter: '}',
            allowedAttributes: []  // empty array = all attributes are allowed
        });


    config.setLibrary("md", md);
    config.addPlugin(EleventyRenderPlugin);


    config.addFilter(
        "exclude",
        function (collection, property_path, rejected_values) {
            return utils.lookup(collection, property_path, rejected_values, true);
        }
    );

    config.addFilter("sortby", function (collection, property_name) {
        return collection.sort(
            (a, b) => a.data[property_name] - b.data[property_name]
        );
    });

    config.addFilter("hasContent", function (item) {
        return item.template.frontMatter.content.length > 5;
    });

    config.addFilter("includes", function (collection, accepted_values) {
        let ret = utils.lookup(collection, "", accepted_values);
        return ret.length > 0;
    });

    config.addFilter("contains", (a, b) => a.includes(b));

    config.addFilter(
        // TODO: avoid truncating an element e.g. "[...]<img "
        "excerpt",
        (s) => stripHtml.stripHtml(s).result.substring(0, 200) + "..."
    );

    //
    return {
        //pathPrefix: "/bcc-11ty/",
        dir: {
            output: "../html",
        }
    };
};
