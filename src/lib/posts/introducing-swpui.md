---
title: Introducing swpui
date: 2026-05-09T10:00:00Z
categories:
  - rust
  - search
  - ratatui
  - tooling
  - announcement
coverImage: true
coverAlt: A screenshot of the terminal user interface of the swpui search and replace tool.
excerpt: >
  swpui is a TUI (terminal user interface) tool for ergonomic and fast case-aware search and replace. It supports multiple search modes, including regex with capture groups.
---

<script lang="ts">
  import Asciinema from "$lib/components/Asciinema.svelte"
  import Console from '$lib/components/Console.svelte'
  import Kbd from "$lib/components/Kbd.svelte"
  import Image from '$lib/components/Image.svelte'
  import overview from './introducing-swpui/overview.cast?url'
  import start from './introducing-swpui/start.png?enhanced&imgSizes=true'
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
by opening the options menu (<Kbd seq="Ctrl-o" /> or <Kbd seq="Alt-o" />).

### Install

#### Via `cargo`

<Console entries={["cargo install swpui"]} />

#### Via [`cargo-binstall`](https://github.com/cargo-bins/cargo-binstall)

<Console entries={["cargo binstall swpui"]} />

#### Via `nix` flake

Depending on your use case, use one of the commands below:

<Console entries={["nix profile install github:beeb/swpui", "nix run github:beeb/swpui"]} />

#### Pre-built binaries and install script

Head over to the [releases page](https://github.com/beeb/swpui/releases)!

## Introduction

Ever since I switched to a full terminal IDE setup using [`zellij`](https://zellij.dev/),
[`helix`](https://helix-editor.com/), [`yazi`](https://yazi-rs.github.io/) and
[`lazygit`](https://github.com/jesseduffield/lazygit) a year or two ago (there's been a transition period), I've been on
the lookout for a good search and replace tool I could use for cases where the language server doesn't help or is
insufficient. One thing I enjoyed about Visual Studio Code (there were very few things) was the search and replace
functionality. It gave immediate feedback about the search terms, allowed to use regular expressions (regex) for more
advanced patterns, and was overall pretty intuitive to use.

I always strive to find tools written in Rust for my work environment because the language generally correlates with
high quality, speed, and stability. I fear this is becoming less and less true with the ever-increasing use of LLMs in
open-source software, but that is a topic for another time. I first tried a few CLI tools for search and replace, in no
particular order:

- [fastmod](https://github.com/facebookincubator/fastmod)
- [repgrep](https://github.com/acheronfail/repgrep)
- [sd](https://github.com/chmln/sd)

Unfortunately, these did not check all the boxes I had in my wish list:

- immediate feedback: I want my search query to give me matches immediately, so I can adjust it if the matches are poor.
  This is one of the reasons I really like `helix` and `nvim` never clicked. `helix` works on a select-then-act model,
  where you first create a selection with a key or regex search, then operate on that selection (delete, change, copy,
  etc.). This is very intuitive because you have immediate feedback for your selection and can correct if you messed up.
- support for case-aware replacement: sometimes, the "rename" function of your best LSP is not enough to cover a large
  codebase refactor that requires much renaming. That's if your LSP even supports that feature and implements it
  correctly, which is not a given. Having a way to adapt the replacement text's case based on the match's case is
  something that I've rarely seen and makes renaming things easier.
- support for capture groups: I want to be able to refer to some part of the matched term into the replacement.
- a familiar UI with a search field, a replacement text box, a list of files, and preview.
- easy-to-learn key bindings with an always-shown cheat sheet.
- the ability to easily skip replacing content in a file or parts of it.
- easy to install (single binary), with no runtime dependency.

Then I came across [`serpl`](https://github.com/yassinebridi/serpl). On paper, it was almost exactly what I was looking
for! It even supported the [`ast-grep`](https://ast-grep.github.io/) search syntax which uses tree-sitter to match
certain types of code elements. Unfortunately, I quickly noticed a few
[annoying a very obvious bugs](https://github.com/yassinebridi/serpl/issues) which made the experience less than ideal,
and it required [`ripgrep`](https://github.com/burntsushi/ripgrep) and `ast-grep` to be available as separate binaries
at runtime. That is, as far as I understand, the tool shelled out to the command, parsed its output, and generated a
replacement command to be sent to the tool. It seems the project is now looking for a maintainer, which did not give me
the confidence that the bugs I was seeing were gonna be worked on.

## A New Contender

Enter `swpui`! This tool is my take on what a great search-and-replace experience should be in the terminal. I drew a
lot of inspiration from `lazygit` for the user interface (fantastic UX!). I wanted the tool to be intuitive and easy to
use, fast, and support the features I mentioned above: case awareness, instant feedback, great regex support.

This served as very good excuse to get into [`ratatui`](https://ratatui.rs/), a library and framework to create terminal
interfaces, which I had been eying for the better part of a year without really finding a use for it. Until now.

## The Tour

The tool's executable is named `swp` for a nice a short command to type. Once you launch it, you see the following:

<Image
  src={start}
  alt="A screenshot of the startup state of the swpui terminal interface. A column on the left contains two input fields a the top (one for search and one for replacement text) as well as a list of files, currently empty. A larger pane on the right will hold the preview of the search results for the selected file."
  caption="The swpui interface is clearly segmented and self-documenting."
/>

Here are a few details you might have noticed. The current search mode is displayed in the search field's title, and
it's currently focused. There are filters for hidden files and files matching the `.gitignore` rules. A keybinds
cheatsheet is always shown at the bottom. It's also contextual, such that only the relevant keybindings for that state
are shown. Navigation between the panes is done through the <Kbd seq="Tab" /> key or a pane's shortcut number.
Obviously, single-letter shortcuts do not work while a text field is focused, hence why some of the important ones use a
modifier. Since I know the pain of conflicting shortcuts, especially when using a terminal multiplexer, each is provided
with either the <Kbd seq="Ctrl" /> or <Kbd seq="Alt" /> modifier.

### The Inputs

### The File List

### The Preview Pane

## The Technical Stuff

### Worker Architecture

### Case Detection

*[TUI]: Terminal User Interface

*[IDE]: Integrated Development Environment

*[LSP]: Language Server Protocol

*[UI]: User Interface

*[UX]: User Experience
