const path = require('node:path');
const fs = require('node:fs').promises;
const { exec } = require('node:child_process');

build();

async function build() {
  await writeESMFiles();
  await renameESMFiles();
  await writeCJSFiles();
}

function writeESMFiles() {
  return tsc(path.join(__dirname, 'tsconfig.esm.json'));
}

function writeCJSFiles() {
  return tsc(path.join(__dirname, 'tsconfig.json'));
}

async function renameESMFiles() {
  const MAP_RE = /\.js\.map$/;
  const SOURCE_RE = /\.js$/;
  const filenames = await fs.readdir(path.join(__dirname, 'lib'));

  // Build mapping of { oldname => newname }
  //
  // Example:
  //
  //     { "foo.js": "foo.mjs", "bar.js": "bar.mjs" } // sources
  //     { "foo.js.map": "foo.mjs.map", "bar.js.map": "bar.mjs.map" } // maps
  //
  function buildNameMapping(filenames, regex, ext) {
    return filenames.reduce((names, filename) => {
      if (regex.test(filename)) {
        names[filename] = filename.replace(regex, ext);
      }
      return names;
    }, {});
  }

  const sources = buildNameMapping(filenames, SOURCE_RE, '.mjs');
  const maps = buildNameMapping(filenames, MAP_RE, '.mjs.map');

  // Rename the file itself
  await Promise.all(
    Object.entries({ ...sources, ...maps }).map(([oldname, newname]) => {
      return fs.rename(toBuildPath(oldname), toBuildPath(newname));
    })
  );

  // Update source to point to the right source map
  await Promise.all(
    Object.entries(sources).map(async ([oldname, newname]) => {
      const filepath = toBuildPath(newname);
      const contents = await fs.readFile(filepath, { encoding: 'utf8' });
      const updated = contents.replace(
        `sourceMappingURL=${oldname}`,
        `sourceMappingURL=${newname}`
      );
      return fs.writeFile(filepath, updated, { encoding: 'utf8' });
    })
  );

  // Update source map to point to the right file
  return Promise.all(
    Object.values(maps).map(async (filename) => {
      const filepath = toBuildPath(filename);
      const contents = await fs.readFile(filepath, { encoding: 'utf8' });
      const sourceMap = JSON.parse(contents);
      sourceMap.file = filename.replace('.mjs.map', '.mjs');
      return fs.writeFile(filepath, JSON.stringify(sourceMap), { encoding: 'utf8' });
    })
  );
}

function toBuildPath(filename) {
  return path.join(__dirname, 'lib', filename);
}

function tsc(tsconfigPath) {
  return new Promise(async (resolve, reject) => {
    exec(`npx tsc -p ${tsconfigPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(stderr);
        reject(error);
      } else {
        console.log(stdout);
        resolve();
      }
    });
  });
}
