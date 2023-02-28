# Contributing guide

This guide will ensure that you have all the necessary information needed to be an effective contributor to Openapi-forge

We are actively looking for contributors to help increase the Forge's capabilities and robustness

<br>

## Before you create an issue

- Does the issue already exist? _Remember to check the **open** and **closed** tickets_

<br>

## What to include in the issue

- ### Bug

  - A short and clear title of the bug
  - Forge version (and generator versions if it relates to the generators)
  - Reproduction steps or a link to a project that shows the bug
  - Expected and actual behaviour<br><br>

- ### New Feature / Improvement
  - A short and clear title of the new feature / improvement
  - A more detailed description of the new feature / improvement (adding code snippets if you desire)<br><br>

## Before you start working on an issue

- Fork the repos you will need to work on. _You may also need the generators_
- Have you contributed before? _If not, look for issues with the 'good first issue' label_
- Is it assigned to anyone else? _If so, post a message to see if the assignee is still working on it_
- Is it assigned to you? _If not, post a message stating your intent so that the maintainers and other contributors know what is being developed_
- Do you understand the issue fully? _If not, ask on in the issue. We are all here to help you contribute_

<br>

## Before you submit a PR

- Link issue that PR addresses
- Link any related PRs _This could happen when forge and generator needs updating_
- Have you added tests?
- Are all workflow steps passing?
- Is it ready for review? _If not, create a draft_

<br>

## Testing

You can test openapi-forge on all of the language generators from one command:

```
% openapi-forge help test-generators
Usage: openapi-forge test-generators [options]

Test language specific generators.

Options:
  -g, --generators <gens>            Narrow down the generators to test. Each letter is a generator, combine letters to test multiple generators, options are:
                                     c (CSharp), t (TypeScript) (default: "ct")
  -c, --csharp <csharpPath>          Sets the location of the CSharp generator. Default is a directory called 'openapi-forge-csharp' in the same location as
                                     openapi-forge (default: "./openapi-forge-csharp")
  -t, --typescript <typescriptPath>  Sets the location of the TypeScript generator. Default is a directory called 'openapi-forge-typescript' in the same
                                     location as openapi-forge (default: "./openapi-forge-typescript")
  -l, --logLevel <level>             Sets the logging level, options are: quiet ('quiet', 'q' or '0'), standard (default) ('standard', 's' or '1'), verbose
                                     ('verbose', 'v' or '2') (default: "1")
  -h, --help                         display help for command
```

### OpenAPI Forge Package

Install openapi-forge as a global package (this is required for running the tests even if you have it git-cloned locally):

```
$ npm install openapi-forge --global
```

### Dependencies on the Forge Project

The generators hardcode the relative path to the generate.js in order to run test-generators. Currently these must be changed manually if the path of generate.js is changed. See this issue: #158.

### GitHub Workflows

The Gherkin tests are run as part of Continuous Integration using `.github/workflows/test.yml`. It runs the tests on every generator, checking for the presence of a generated test results file. It does not check for passing/failing tests. See this issue: #157.

<br>

# Example directory structure for testing to work using default locations

You can have the locations of the forge and generators in custom locations with custom names but you will need to input the relative file paths into the testing commands of the forge and generators.
Below is the file structure needed to use the testing commands with the default locations:

```
openapi-forge
|
|-openapi-forge-typescript
|-openapi-forge-csharp
|-openapi-forge-...
```

For example, run:

```
$ openapi-forge test-generators --format json --generators openapi-forge-csharp
```

You should see an output that looks like this:

```
{
  logLevel: '1',
  format: 'json',
  generators: [ 'openapi-forge-csharp' ]
}
<path>\openapi-forge-csharp
Starting tests for generator openapi-forge-csharp
[
  { testRunStarted: { timestamp: [Object] } },
  { testCaseStarted: {} },
  { testCaseFinished: {} },
  // ....
  { testRunFinished: { timestamp: [Object] } }
]
{
  "openapi-forge-csharp": {
    "scenarios": 44,
    "failed": 0,
    "passed": 44,
    "time": 47
  }
}

```

<br>

## Points to remember when contributing

- The branch `gh-pages` is used to auto-generate the Github Pages webpage. DO NOT USE THIS BRANCH!!!
- This project uses [semantic-release](https://semantic-release.gitbook.io/semantic-release/) which enforces [Angular Commit Message Conventions](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-commit-message-format) & [Angular Verbs](https://www.conventionalcommits.org/en/v1.0.0-beta.4/). Ensure you are writing your commit messages correctly. Husky hooks have got your back for ensuring correct format but will not prevent the use of wrong types.
- The NPM scripts below can help you fix failing workflow steps:

```
    npm run test:generators
    npm run format:check:all
    npm run format:write:all
    npm run lint:check:all
    npm run lint:write:all
```
