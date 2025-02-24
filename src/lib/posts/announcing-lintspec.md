---
title: Announcing lintspec, a NatSpec Linter
date: 2025-02-23T14:00:00Z
# updated:
categories:
  - rust
  - solidity
  - tooling
  - announcement
coverImage: true
coverAlt: A screenshot of the terminal output of the lintspec CLI tool, showing diagnostics related to missing documentation in a Solidity source file.
excerpt: >
  Lintspec is a command-line utility (linter) that checks the completeness and validity of NatSpec doc-comments in
  Solidity code. It is focused on speed and ergonomics and aims to improve the user experience over existing solutions.
---

<script lang="ts">
  import annotations from './announcing-lintspec/github-annotation.png?enhanced&imgSizes=true'
  import screenshot from './announcing-lintspec/title.png?enhanced&imgSizes=true'
  import ChatNote from '$lib/components/ChatNote.svelte'
  import Console from '$lib/components/Console.svelte'
  import Image from '$lib/components/Image.svelte'
</script>

## Contents

## TL;DR

[`lintspec`](https://github.com/beeb/lintspec) is a command-line utility (linter) that checks the completeness and
validity of NatSpec doc-comments in Solidity code. It is focused on speed and ergonomics and aims to improve the user
experience over existing solutions. Benchmarks show that it can be as much as 200 times faster than `natspec-smells`. A
native GitHub Action allows to easily integrate it with CI.

### Install

#### Via `cargo`

<Console entries={["cargo install lintspec"]} />

#### Via [`cargo-binstall`](https://github.com/cargo-bins/cargo-binstall)

<Console entries={["cargo binstall lintspec"]} />

#### Via `nix`

Depending on your use case, use one of the commands below (on the unstable channel):

<Console entries={["nix-env -iA nixpkgs.lintspec", "nix-shell -p lintspec", "nix run nixpkgs#lintspec"]} />

#### Pre-built binaries and install script

Head over to the [releases page](https://github.com/beeb/lintspec/releases)!

### Usage

```
Usage: lintspec [OPTIONS] [PATH]...

Arguments:
  [PATH]...  One or more paths to files and folders to analyze

Options:
  -e, --exclude <EXCLUDE>  Path to a file or folder to exclude (can be used more than once)
  -o, --out <OUT>          Write output to a file instead of stderr
      --inheritdoc         Enforce that all public and external items have `@inheritdoc`
      --constructor        Enforce that constructors have NatSpec
      --struct-params      Enforce that structs have `@param` for each member
      --enum-params        Enforce that enums have `@param` for each variant
  -f, --enforce <TYPE>     Enforce NatSpec (@dev, @notice) on items even if they don't have params/returns/members (can be used more than once)
      --json               Output diagnostics in JSON format
      --compact            Compact output
      --sort               Sort the results by file path
  -h, --help               Print help (see more with '--help')
  -V, --version            Print version
```

## Introduction

The Solidity language provides a [succinct specification](https://docs.soliditylang.org/en/latest/natspec-format.html)
for documentation comments used to provide rich documentation for functions, arguments, return values, and more.
These were apparently inspired by [Doxygen](https://www.doxygen.nl/) and look like so (example taken from the
official Solidity documentation linked above):

```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 < 0.9.0;

/// @title A simulator for trees
/// @author Larry A. Gardner
/// @notice You can use this contract for only the most basic simulation
/// @dev All function calls are currently implemented without side effects
/// @custom:experimental This is an experimental contract.
contract Tree {
    /// @notice Calculate tree age in years, rounded up, for live trees
    /// @dev The Alexandr N. Tetearing algorithm could increase precision
    /// @param rings The number of rings from dendrochronological sample
    /// @return Age in years, rounded up for partial years
    /// @return Name of the tree
    function age(uint256 rings) external virtual pure returns (uint256, string memory) {
        return (rings + 1, "tree");
    }

    /// @notice Returns the amount of leaves the tree has.
    /// @dev Returns only a fixed number.
    function leaves() external virtual pure returns(uint256) {
        return 2;
    }
}
```

Toolchains like [Foundry](https://github.com/foundry-rs/foundry/) (which, by the way, reached
[`v1.0` recently](https://book.getfoundry.sh/guides/v1.0-migration) 🎉) can use those comments to automatically generate
Markdown and HTML files for documentating a project's API.

**As such, it's pretty important to make sure that these comments stay in sync with the actual code, and even more
important to ensure that they are present altogether!**

## Natspec-smells

I'm not the first one to identify this need, and the good folks over at [Wonderland](https://github.com/defi-wonderland)
did so a while ago, and provide a CLI tool that can be used to validate those comments:
[natspec-smells](https://github.com/defi-wonderland/natspec-smells).

Having used this tool pretty much since its inception in January 2024, I was always a bit disappointed by its speed
and the fact that it sometimes errors for seemingly unrelated reasons, like it
[not being able to understand](https://github.com/defi-wonderland/natspec-smells/issues/65) the path to a source file's
dependencies. Another lacking feature, as of writing this, is the verification of `enum` NatSpec.

## A (Long) Weekend Project

In 2023, the [Nomic Foundation](https://nomic.foundation/), which is well known for having developped the Hardhat
development framework, started working on a new Solidity parser named
[`slang`](https://github.com/NomicFoundation/slang) and written in Rust. After playing for a while with their CST
implementation (an Abstract Syntax Tree with added context about the original source code where nodes were found) for
various small test linting tools, I felt like I had a pretty good grasp of how to use their tree-walking cursor and
query language.

I started working on a code formatter for Solidity using `slang` (which is still a work-in-progress) and learned a lot
about how to traverse the syntax tree and the peculiarities of the library.

After opening a couple of issues in the `natspec-smells` repository, a sudden and unexpected _RiiR_™ (Rewrite it in
Rust) urge came onto me. This was the perfect small-ish-scope project I was looking for to entertain my week-end!

This is how `lintspec` came to be. Besides the unoriginality of the name, I thought I had a very good shot at making a
tool that could be both much faster than the single-threaded, NodeJS-based `natspec-smells`, and also more ergonomic to
use.

Speed was an important factor because I wanted people to be able to use `lintspec` in git pre-commit hooks, where any
command running for more than a few hundreds of milliseconds really affects the developer experience.

What was initially a weekend project turned into 5 days of relatively intense development, until I felt I had most of
the features I wanted in the tool. This didn't include much unit and intergration testing, and a few days of bug-hunting
shortly followed.

One of the important parts of the development was to create a parser for NatSpec comments, which was done with the help
of [`winnow`](https://docs.rs/winnow/). Since the `lintspec` crate is both a binary and a library, the parser can and
will be re-used for future projects!

## Features

Below is a comparison table highlighting the features that were added in `lintspec`, which I felt were missing from
Wonderland's implementation:

| Feature                         | `lintspec` | `natspec-smells` |
|---------------------------------|------------|------------------|
| Identify missing NatSpec        | ✅          | ✅                |
| Identify duplicate NatSpec      | ✅          | ✅                |
| Include files/folders           | ✅          | ✅                |
| Exclude files/folders           | ✅          | ✅                |
| Enforce usage of `@inheritdoc`  | ✅          | ✅                |
| Enforce NatSpec on constructors | ✅          | ✅                |
| Configure via config file       | ✅          | ✅                |
| Configure via env variables     | ✅          | ❌                |
| Respects gitignore files        | ✅          | ❌                |
| Enforce NatSpec on enums        | ✅          | ❌                |
| Pretty output with code excerpt | ✅          | ❌                |
| JSON output                     | ✅          | ❌                |
| Output to file                  | ✅          | ❌                |
| Multithreaded                   | ✅          | ❌                |
| No pre-requisites (node/npm)    | ✅          | ❌                |

Most notably, the ability to respect the patterns in `.gitignore` files, and the ability to output structured JSON were
at the top of my list. I also felt like the default output for the diagnostics (found problems) was a bit terse and
could benefit from some added flair. Finally, having to install NodeJS and `npm` to run the tool always seemed a bit
tedious, especially since `npm` is not required to manage Solidity dependencies (thanks,
[`soldeer`](https://github.com/mario-eth/soldeer)!).

To produce pretty diagnostic messages, I used the amazing [`miette`](https://crates.io/crates/miette) crate which gives
really good results with very little work.

<Image
  src={screenshot}
  maxWidth={800}
  alt="A screenshot of the pretty output from lintspec, featuring an excerpt of the code where a problem
  was found, along with colorful markers pointing at which code items created the issues."
  caption="The default output of lintspec is pleasing to look at."
/>

## Benchmark

Now, since performance has been identified as one goal for the tool, I can hear you from here: "how does it compare
to the competition?". Feat not, reader, I have benchmarked the tool against <code>natspec-smells</code> after pretty much every development step. And the results are pretty good, dare I say!

I used the [Uniswap v4 codebase](https://github.com/Uniswap/v4-core) for this, because it includes (at the time of
writing) 83 Solidity source files totaling about 6600 lines of code and comments, which is pretty representative of a
large project where you'd be worried about the performance of a linter, and they don't strictly enforce NatSpec for
all items, which gives us a nice amount of diagnostics to output (487 of them!).

I set up `lintspec`'s output format to be as close as possible to what `natspec-smells` is doing, that is including
validation of `struct` members and using the compact text output format seen below:

```
# natspec-smells output
src/libraries/Pool.sol:83
Pool:State
  @param slot0 is missing
  @param feeGrowthGlobal0X128 is missing
  @param feeGrowthGlobal1X128 is missing
  @param liquidity is missing
  @param ticks is missing
  @param tickBitmap is missing
  @param positions is missing

# lintspec output
src/libraries/Pool.sol:78:1
struct Pool.State
  @param slot0 is missing
  @param feeGrowthGlobal0X128 is missing
  @param feeGrowthGlobal1X128 is missing
  @param liquidity is missing
  @param ticks is missing
  @param tickBitmap is missing
  @param positions is missing
```

I used the excellent [`hyperfine`](https://github.com/sharkdp/hyperfine) tool for comparing both commands. Granted the
machine I'm on for this benchmark has 16 cores (AMD Ryzen 9 7950X), which greatly benefits from the multithreaded
capabilities of `lintspec`, the verdict is clear:

```
Benchmark 1: npx @defi-wonderland/natspec-smells --include "src/**/*.sol"
  Time (mean ± σ):     12.223 s ±  0.143 s    [User: 13.377 s, System: 0.547 s]
  Range (min … max):   12.022 s … 12.463 s    10 runs

Benchmark 2: lintspec src --compact --struct-params
  Time (mean ± σ):      57.9 ms ±   1.2 ms    [User: 254.6 ms, System: 75.3 ms]
  Range (min … max):    54.9 ms …  60.2 ms    49 runs

Summary
  lintspec src --compact --struct-params ran
  210.98 ± 4.98 times faster than npx @defi-wonderland/natspec-smells --include "src/**/*.sol"
```

## Run It in CI

`lintspec` comes with a built-in Github Action that you can use in your workflows. Here's an example of how you would
use it. Of course, it can be customized with parameters, check out the
[GitHub repository](https://github.com/beeb/lintspec) to learn more:

```yaml
name: Lintspec

on:
  pull_request:

jobs:
  lintspec:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: beeb/lintspec@main
```

<ChatNote>
The action even generates some annotations on the code, which appear during the Pull Request review!
<Image
  src={annotations}
  maxWidth={500}
  alt="A screenshot of the annotations generated for the source code of a GitHub Pull Request.
  The diagnostic generated by lintspec is shown right on the corresponding line of the source file."
  caption="The GitHub Action for lintspec creates nice annotations right in the source files."
/>
</ChatNote>


Thanks to the JSON output generated by the tool, it's easy to extract information about the found problems with
utilities like [`jq`](https://jqlang.org/) and make your own if you don't use Github Actions.
The CLI exits with code `1` if some diagnostics were found, and `0` if everything is good. This makes it even easier to
fail a workflow run if problems are found. Note that diagnostics are by default emitted in `stderr` and so you might
need to redirect output to `stdout` for piping into `jq`. Here are a couple of queries you might be interested in:

<Console entries={[
"lintspec src --json 2>&1 | jq 'length' # number of files with problems",
"lintspec src --json 2>&1 | jq '[.[].items[].diags | length] | add // 0' # total number of problems",
]} />

## What's Next

Although the test suite is now pretty extensive, I'm sure there are some bugs I didn't find yet. I would be extremely
greateful if you could consider using the tool and letting me know how it goes!
Please do [open an issue on GitHub](https://github.com/beeb/lintspec/issues/new) if you have suggestions or
experience problems.

Thanks for reading all the way to the end, and talk soon!

*[HTML]: Hypertext Markup Language
*[API]: Application Programming Interface
*[CLI]: Command Line Interface
*[CST]: Concrete Syntax Tree
*[JSON]: JavaScript Object Notation

