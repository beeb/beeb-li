---
title: Introducing swpui
date: 2026-05-09T10:00:00Z
categories:
  - rust
  - search
  - ratatui
  - tooling
  - announcement
coverImage: false
# coverAlt: A screenshot of the terminal user interface of the swpui search and replace tool.
excerpt: >
  swpui is a TUI (terminal user interface) tool for ergonomic and fast case-aware search and replace. It supports multiple search modes, including regex with capture groups.
---

<script lang="ts">
  import Asciinema from "$lib/components/Asciinema.svelte"
  import Console from '$lib/components/Console.svelte'
  import Kbd from "$lib/components/Kbd.svelte"
  import overview from './introducing-swpui/overview.cast?url'
</script>

## Contents

## TL;DR

<Asciinema url={overview} fallback="https://asciinema.org/a/1030220" cols={105} rows={24} />

[`swpui`](https://github.com/beeb/swpui) (pronounced "swap UI") is a TUI utility to search and replace text, with a
focus on ergonomics, speed and case-awareness in source code. The tool's binary is `swp` for a short and easy to
remember command. It supports the following search modes:

- Case-aware (the replacement matches the original case of the search result)
- Literal
- Regex
- Regex multiline (the `.` pattern matches newlines)

In regex mode, capture groups are supported and can be inserted into the replacement pattern with `$1` through `$9`.
`$0` represents the full match.

By default, hidden files are included, but files ignored by `.gitignore` are excluded. These preferences can be changed
by opening the options panel (<Kbd seq="Ctrl-o" /> or <Kbd seq="Alt-o" />).

## Install

### Via `cargo`

<Console entries={["cargo install swpui"]} />

### Via [`cargo-binstall`](https://github.com/cargo-bins/cargo-binstall)

<Console entries={["cargo binstall swpui"]} />

### Via `nix` flake

Depending on your use case, use one of the commands below:

<Console entries={["nix profile install github:beeb/swpui", "nix run github:beeb/swpui"]} />

### Pre-built binaries and install script

Head over to the [releases page](https://github.com/beeb/swpui/releases)!

## Usage

*[TUI]: Terminal User Interface
