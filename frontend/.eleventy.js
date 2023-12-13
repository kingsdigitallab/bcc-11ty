const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const utils = require("./_includes/js/utils.js");
const Image = require("@11ty/eleventy-img");
const inspect = require("util").inspect;
const path = require("node:path");
const debug = require("debug")("Eleventy:KDL");
const markdownItEleventyImg = require("markdown-it-eleventy-img");
const markdownItContainer = require("markdown-it-container");
const { EleventyRenderPlugin } = require("@11ty/eleventy");
const stripHtml = require("string-strip-html");
const markdownIt = require("markdown-it");

module.exports = function (config) {
  utils.configureMarkdown(config);

  config.addPlugin(eleventyNavigationPlugin);

  utils.configureSass(config);

  // just copy the assets folder as is to the static site _site
  // config.addPassthroughCopy("**/*.css");
  config.addPassthroughCopy("assets/node_modules");
  config.addPassthroughCopy("assets/fonts");
  config.addPassthroughCopy("assets/img");
  config.addPassthroughCopy("assets/js");
  config.addPassthroughCopy("assets/json");

  // just copy the admin folder as is to the static site _site
  // config.addPassthroughCopy("admin");

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
  return {
    pathPrefix: "/bcc-11ty/",
  };
};
