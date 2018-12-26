/* eslint-env node */

const path = require("path");
const { echo, exec, cp, mkdir } = require("shelljs");

// Create output base dir.
const OUTPUT_BASEDIR = "dist/extension";

mkdir("-p", OUTPUT_BASEDIR);

const src = fp => path.join("src", fp);
const dest = fp => path.join(OUTPUT_BASEDIR, fp);

// Copy any static assets.
const STATIC_ASSETS = [
  "manifest.json",
  "icon.png",
  {
    src: "privileged/extensionPermissionManager/*",
    dest: "privileged/extensionPermissionManager/"
  },
  {
    src: "ui/*.html",
    dest: "ui/"
  },
  {
    src: "ui/*.css",
    dest: "ui/"
  },
  // Spectre CSS dependency.
  {
    src: "../node_modules/spectre.css/dist/spectre.min.css",
    dest: "ui/"
  }
  // {
  //   src: "../node_modules/spectre.css/dist/spectre-exp.min.css",
  //   dest: "ui/"
  // },
  // {
  //   src: "../node_modules/spectre.css/dist/spectre-icons.min.css",
  //   dest: "ui/"
  // }
];

for (const asset of STATIC_ASSETS) {
  if (typeof asset === "string") {
    echo(`Copying ${src(asset)} to ${dest(asset)}`);
    cp(src(asset), dest(asset));
  } else {
    if (typeof asset.src !== "string" || typeof asset.dest !== "string") {
      // eslint-disable-next-line no-console
      console.error("Error processing asset", asset);
      // eslint-disable-next-line no-process-exit
      process.exit(1);
    }
    echo(`Copying ${src(asset.src)} to ${dest(asset.dest)}`);
    mkdir("-p", dest(asset.dest));
    cp("-rf", src(asset.src), dest(asset.dest));
  }
}

// Bundle extension code.
const BUNDLES = ["background.js", "ui/tab.js"];

for (const bundle of BUNDLES) {
  echo(`Rolling up ${src(bundle)} into ${dest(bundle)}`);
  exec(
    `npm run cmd:rollup -- -c rollup.config.js -i ${src(bundle)} -o ${dest(
      bundle
    )}`
  );
}
