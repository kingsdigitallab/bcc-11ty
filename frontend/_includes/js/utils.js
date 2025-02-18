import path from "node:path";
import sass from "sass";
import debug from "debug";
import markdownItImageFigures from "markdown-it-image-figures";
import markdownItFootnote from "markdown-it-footnote";
import markdownItAttrs from "markdown-it-attrs";
import markdownIt from "markdown-it";

const debugLog = debug("Eleventy:KDL");

function lookup(anarray, path_to_property, accepted_values, exclude = false) {
  // returns array with elements of anarray st <element>.<path_to_property belongs> to <accepted_values>
  // accepted values can be an array or a literal.
  // If accepted_values is 'ALL', returns anarray.
  // If exclude is true => opposite condition, returns only elements
  // that don't match any fo the accepted_values.
  if (accepted_values === "ALL") {
    return anarray;
  }

  path_to_property = path_to_property
    .replace(/(^\.)|(\.$)/g, "")
    .split(".")
    .filter((v) => v.length);

  if (accepted_values.constructor !== Array) {
    accepted_values = [accepted_values];
  }

  return anarray.filter(function (item) {
    // debug(path_to_property);
    let values = [item];
    if (path_to_property.length) {
      values = path_to_property.reduce((o, i) => o[i], item);
      if (typeof values !== "undefined") {
        if (values.constructor !== Array) {
          values = [values];
        }
      } else {
        values = [];
      }
    }
    let ret = values.filter((v) => accepted_values.includes(v)).length > 0;
    if (exclude) ret = !ret;
    return ret;
  });
}

function configureSass(config) {
  /* Convert *.scss -> *.css 
  Ignores _*.scss files.
  (see https://www.11ty.dev/docs/languages/custom/#using-inputpath)
  (alternative https://www.npmjs.com/package/eleventy-sass?activeTab=readme)
  */

  // NOT using the eleventy-sass plugin.
  // Problem1: impossible to exclude .sass files, bulma assumes var
  // declared before theyare parsed but their name doesn't start with _.
  // Problem2: sutainable? only one maintainer.
  // const eleventySass = require("eleventy-sass");
  // config.addPlugin(eleventySass);

  // refresh the browser when your CSS changes,
  // without triggering a rebuild of all your pages by Eleventy.
  // config.setBrowserSyncConfig({
  // 	files: './_site/**/*.css'
  // });
  config.addTemplateFormats("scss");

  // Creates the extension for use
  config.addExtension("scss", {
    outputFileExtension: "css",
    read: false,

    // `compile` is called once per .scss file in the input directory
    compile: async function (content, inputPath) {
      let parsed = path.parse(inputPath);
      debugLog(inputPath);
      if (parsed.name.startsWith("_")) {
        debugLog("return");
        return;
      }
      debugLog(parsed.name);
      // let res = sass.compileString(content);
      let res = sass.compile(inputPath);

      // debug(res.css)

      // This is the render function, `data` is the full data cascade
      return async () => {
        return res.css;
      };
    },
  });
}

function configureMarkdown(config) {
  let options = {
    html: true, // Enable HTML tags in source
    breaks: false, // Convert '\n' in paragraphs into <br>
    linkify: true, // Autoconvert URL-like text to links
  };
  let markdownLib = markdownIt(options)
    .use(markdownItAttrs)
    .use(markdownItFootnote)
    .use(markdownItImageFigures, {
      figcaption: true,
      copyAttrs: "class",
    });
  config.setLibrary("md", markdownLib);
}

export const utils = { lookup, configureSass, configureMarkdown };
