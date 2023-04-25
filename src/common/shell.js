// This module exports a number of functions that are used to execute shell commands. Each function
// ensures that the working directory is restored to its original value after the command has executed.

const shell = require("shelljs");

function gitClone(url, path, shellOptions) {
  shell.exec(`git clone ${url} ${path}`, shellOptions);
}

function listInstalledPackages(path, shellOptions) {
  const currentPath = process.cwd();
  shell.cd(path, shellOptions);
  const code = shell.exec(`npm list --depth=0`, shellOptions);
  shell.cd(currentPath, shellOptions);
  return code;
}

function installPackage(packageName, path, shellOptions) {
  const currentPath = process.cwd();
  shell.cd(path, shellOptions);
  const code = shell.exec(`npm install ${packageName}`, shellOptions);
  shell.cd(currentPath, shellOptions);
  return code;
}

function installDependencies(path, shellOptions) {
  const currentPath = process.cwd();
  shell.cd(path, shellOptions);
  // Do not run husky preparation script as it will cause unnecessary errors
  shell.exec(`npm pkg delete scripts.prepare`, shellOptions);
  shell.exec(`npm install`, shellOptions);
  shell.cd(currentPath, shellOptions);
}

function uninstallPackage(npmPackage, path, shellOptions) {
  const currentPath = process.cwd();
  shell.cd(path, shellOptions);
  shell.exec(`npm uninstall ${npmPackage}`, shellOptions);
  shell.cd(currentPath, shellOptions);
}

// use partial application to adapt a function to a new signature, with a 'fixed' value
// for the first argument
const partial =
  (fn, lastArg) =>
  (...args) =>
    fn(...args, lastArg);

const exportedFns = {
  gitClone,
  listInstalledPackages,
  installPackage,
  installDependencies,
  uninstallPackage,
};

module.exports = {
  ...exportedFns,
  // export a version of each function that has the shellOptions argument pre-filled
  shellWithOptions: (options) =>
    Object.keys(exportedFns).reduce((acc, key) => {
      acc[key] = partial(exportedFns[key], options);
      return acc;
    }, {}),
};
