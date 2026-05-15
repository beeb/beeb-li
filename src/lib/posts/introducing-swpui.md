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
  import ChatNote from '$lib/components/ChatNote.svelte'
  import overview from './introducing-swpui/overview.cast?url'
  import start from './introducing-swpui/start.png?enhanced&imgSizes=true'
  import capture from './introducing-swpui/capture.png?enhanced&imgSizes=true'
  import files from './introducing-swpui/files.png?enhanced&imgSizes=true'
  import preview from './introducing-swpui/preview.png?enhanced&imgSizes=true'
  import options from './introducing-swpui/options.png?enhanced&imgSizes=true'
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

The input is for the search pattern, which is either a regular expression (in one of the two regex modes) or a literal
expression. To cycle between the search modes, the <Kbd seq="Ctrl-r" /> or <Kbd seq="Alt-r" /> keybind is always
available. In `case-aware` mode, the search in case insensitive, while in all other modes it's case sensitive.

<ChatNote>
While no case-insensitive regex mode exists, that can be toggled directly inline in the regex expression.
<code>(?i:foo)</code> matches <code>foo</code> insensitively while <code>(?-i:foo)</code> is case sensitive.
</ChatNote>

Thanks to the amazing [`rat-widget`](https://docs.rs/rat-widget/latest/rat_widget/index.html) crate, the inputs support
all the bells and whistles you might expect: undo with <Kbd seq="Ctrl-z" />, clipboard support, select all
with&nbsp;<Kbd seq="Ctrl-a" /> or <Kbd seq="Shift-arrow" />, move by word with&nbsp;<Kbd seq="Ctrl-arrow" />, and more.

In regex mode, the replacement pattern supports capture groups interpolation with `$1` up to `$9`. The `$0` group is a
special group that represents the full matched text.

<Image
  src={capture}
  alt="The search input contains the regex `pub fn (.+)\(` and the replacement input contains `fn $1(`."
  caption="Capture groups can be interpolated into the replacement text with a dollar-sign syntax."
/>

### The File List

A list of all files under the working directory which contain a match for the search pattern is listed in the third
pane. The directory is scanned on launch and whenever the options are changed, and the resulting list of files is cached
to be re-used for each search. The pane title shows the total number of files with one or more matches.

The list is scrollable, when focused, with the mouse as well as the up-down arrows and <Kbd seq="j" />/<Kbd seq="k" />.
Next to each path is the number of active matches (_i.e._ those that were not toggled to be skipped) and total matches.

<Image
  src={files}
  alt="A list of file paths is shown with abbreviated path segments such that the file's base name is still visible. On the right, a scrollbar shows that the list was scrolled towards the bottom. One of the file entries is highlighted and bold."
  caption="Paths are abbreviated to retain as much useful information about the file's location as possible within the column's width."
/>

As you can see from the screenshot above, I implement a small path abbreviation algorithm to retain information about
the path depth while also keeping the filename as intact as possible. If the full relative path does not fit, each
directory segment is first abbreviated to 3 letters, then 2 letters, and finally 1 letter. If that still does not fit,
an ellipsis is added inside of the basename of the file, keeping the extension intact. Finally, if that can't be shown
completely, the start of the path is elided on the left, but you'd have to go pretty small for that to kick in.

To move from the file list to the preview pane, the <Kbd seq="Enter" /> or <Kbd seq="l" /> key can be used. Number 4 and
the right arrow key also work, the goal is for you to not have to think about shortcuts too much.

### The Preview Pane

Once a file is selected in the list, a preview of the matches is shown in the larger pane on the right. While the path
was maybe abbreviated in the file list, it's not in preview pane title (unless the pane is too narrow of course, but in
that case we just add an ellipsis at the start and keep the path segments intact).

The matches can be navigated with the up and down arrows as well as <Kbd seq="j" />/<Kbd seq="k" /> when the pane is
focused.

For each match, we see a couple of lines of context with line numbers above and below. The selected match is indicated
by a yellow chevron in the gutter. Each individual match can be toggled to be skipped during replacement
with&nbsp;<Kbd seq="s" />. The match appears in dimmed text if skipped.

A preview of the replacement is shown in a sort of `diff` style, with the matched text struck through and red while the
replacement is green and bold. For multiline matches, you'll even get the familiar `+` and `-` symbols at the start of
the lines.

<Image
  src={preview}
  alt="A screenshot of the preview pane showing the word `worker` being replaced with `executor` for various matches in a file. Each match has a different case (pascal case, uppercase, and snake_case) and the replacement text adapts to each. A couple of lines of code of context is shown before and after each match."
  caption="Here we can see the case-awareness at work, the replacement text is modified to match the original text case."
  maxWidth={700}
/>

The matched line is abbreviated in a way that retains the matched text and replacement text as much as possible. So you
might see ellipsis characters at the start and/or end of the line and the indentation is not guaranteed to be respected
relative to the context. Multiline matches which are taller than the pane are scrolled line-by-line while selected.

### The Options Menu

Hitting the <Kbd seq="Ctrl-o" /> or <Kbd seq="Alt-o" /> shortcut from anywhere brings up the options pop-up menu. At the
moment, there are only 3 options:

- The search mode (case-aware, literal, regex or regex multiline)
- Whether to include hidden files in the search (enabled by default)
- Whether to include files normally ignored via `.gitignore` or `.ignore` config (disabled by default)

Those are cycled/toggled via the letter shown on the left. I wanted to avoid polluting the modifier key shortcut space
with too many shortcuts so having this menu was a good way to keep things simple to remember and avoid conflicts with
terminal multiplexers.

<Image
  src={options}
  alt="The options pane showing 3 options: the search mode (toggled with `r`), hidden files included or excluded (toggled with `h`) and `.gitignore` included or excluded (toggled with `g`)."
  caption="The options menu uses single-key shortcuts to avoid polluting the global modifier key shortcuts."
/>

At the moment, these options don't persist, but I will probably end up adding some sort of config file support to set
the defaults permanently in the future.

## The Technical Stuff

Since this project was my first proper TUI, it provided a couple of nice challenges to solve when it comes to the
architecture and keeping the UI reactive. Making the search fast enough while keeping the memory footprint relatively
small was also a great exercise.

### Worker Architecture

One of the goals for this application was to not use async Rust. There is very little reason to do async for the type of
work done here, since there aren't many concurrent tasks that can't be handled much more simply with a few threads and
channels. As such, the app is split into 3 main parts:

- The main UI thread: handles all the layout and navigation logic, rendering, keyboard/mouse events etc.
- The search worker: handles directory scanning (file discovery) and searching in the files.
- The preview worker: fetches the preview context for a file on-demand and maintains an internal LRU cache.

These communicate via a few channels, passing messages to trigger work or send back results.

#### Search Worker

This worker scans the current directory to find all files and stores the resulting paths in its state. This is done with
the amazing [`ignore`](https://docs.rs/ignore/latest/ignore/) crate which I've used many times in the past. It provides
a parallel walker which makes this operation very, very fast.

Whenever one of the options related to file filtering is changed, a new scan is triggered.

As the name implies, this worker is also responsible for searching in the files it knows about. To this effect, the
infamous [`memchr`](https://docs.rs/memchr/latest/memchr/) and [`regex`](https://docs.rs/regex/latest/regex/) crates are
used. These are so good that I didn't have much work to do to implement the core of this logic. The work is trivially
parallelized using the very popular [`rayon`](https://docs.rs/rayon/latest/rayon/) crate. Of course, we only compile the
regex once at the beginning.

For each file that has at least a match, we return a `FileMatches` struct:

```rust
pub struct FileMatches {
    pub path: PathBuf,
    pub responsive_path: Option<ResponsivePath>,
    pub matches: Vec<MatchInfo>,
    pub hash: FileHash,
}

pub struct MatchInfo {
    pub byte_offset_start: usize,
    pub byte_offset_end: usize,
    pub skip: bool,
    pub captures: Box<[Box<str>]>,
}
```

The `ResponsivePath` is a pre-sliced and canonicalized version of the path which will be used during render to show the
abbreviated path I described earlier. It has an internal cache to avoid doing the work during each render (in an
immediate mode UI like `ratatui`, this happens many times per second), such that up to 4 different widths can be stored
in memory before needing computing again.

The `MatchInfo` struct holds the matches' byte offsets in the file as well as any capture group content we might have.

Finally, a `FileHash` is computed (a simple `sha256` hash) which will be used during preview generation to check whether
the contents changed and we need to search that file again, or just before doing the actual replacement, to avoid
messing things up in case it was modified.

It's worth noting that an atomic boolean can be used by the UI to signal the worker to cancel any ongoing search and
move to the next one immediately.

#### Preview Worker

Each time the user scrolls the file list to select a different file, a request is made to the preview worker to fetch
the contents that will be shown in the preview pane. The UI makes a request via the `PreviewRequest` message:

```rust
pub struct PreviewRequest {
    pub path: PathBuf,
    pub byte_ranges: Box<[(usize, usize)]>,
    pub hash: FileHash,
    pub pattern: String,
    pub mode: MatchMode,
    pub generation: u64,
}
```

Notably, it passes the byte ranges of interest, the hash of the file calculated during the search, the search pattern
itself, with its match mode, and an incremental generation number. This generation number (a similar one is used in the
search worker) is used to invalidate outdated in-flight responses sent to the UI.

The search pattern and match mode is sent again in this message because, in case the file was modified between when it
was searched and when the preview is requested, we will trigger a new search just before processing it. This ensures
that each time we request a preview, the result matches the actual file contents.

The response from the worker is as follows:

```rust
pub enum PreviewResult {
    Ready {
        path: PathBuf,
        generation: u64,
        data: Arc<PreviewData>,
    }
    // other variants to handle re-search, errors, etc.
}

pub struct PreviewData {
    /// The preview information for matches in a file.
    pub matches: Box<[PreviewMatch]>,

    /// Object size in bytes, used to limit the quantity of data in the LRU cache.
    pub size: usize,
}

pub struct PreviewMatch {
    pub match_col_start: usize,
    pub match_col_end: usize,
    pub context_before: Box<[ContextLine]>,
    pub context_after: Box<[ContextLine]>,
    pub kind: PreviewMatchKind,
}

pub struct ContextLine {
    pub line_number: usize,
    pub content: Box<str>,
}

pub enum PreviewMatchKind {
    SingleLine {
        line_number: usize,
        line_content: Box<str>,
    },
    MultiLine {
        line_number_start: usize,
        matched_lines: Box<[Box<str>]>,
    },
}
```

A few things to note: since the data is immutable here, we can spare a few bytes of memory per match by using `Box<str>`
and `Box<[T]>` instead of `String` and `Vec`. We also compute an object size for the preview data so that we can limit
the LRU cache by size as well as number of elements. This avoids that we get a huge memory usage suddenly because of a
few files with many results with long lines. We also truncate the line contents because we anyway can't show all of it
in the preview pane.

Just like for search, the work can be interrupted if the user moves to another file in the list and we don't need the
preview anymore. We read files in chunks to be able to stop mid-read as well (could be meaningful for very large files).

To make the navigation a bit snappier, the worker pre-fetches preview data for the file before and after the currently
selected file in the list. Although in practice on an SSD this does not make a perceptible difference for most files.
This means that we also spawn 3 threads internally to handle these 3 operations in parallel if needed.

### Case Detection

At the heart of case-aware search and replace is a very good case conversion library called
[`convert_case`](https://docs.rs/convert_case/0.11.0/convert_case/). The process is quite simple: detect the case of the
search result, adjust the case of the replacement text to match.

There are a couple of subtleties however, and the first one is that there is no "detect case" function in that library.
So to detect the case, we have to iterate through all the supported cases (we don't support exotic ones like
[Cobol case](https://docs.rs/convert_case/0.11.0/convert_case/enum.Case.html#variant.Cobol) at the moment), convert the
search result to that case, and check whether the result is identical to the original text. This means that we have to
check the variants in the order from least specific to most specific (at least for the lowercase ones), lest we might
end up detecting `foo` as being `snake_case` or `kebab-case` instead of simply lowercase (`Cast::Flat` below).

```rust
/// Cases to detect, ordered from least specific to most specific.
const CASES: [Case<'static>; 6] = [
    Case::Flat,
    Case::Snake,
    Case::Camel,
    Case::Kebab,
    Case::Pascal,
    Case::UpperSnake,
];
```

Another detail that needs attention is that we ideally want to grow the match (search result) to the identifier's
boundaries, such that we maximize the context for case detection. As such, if we match `Simple` in `mySimpleThing`, by
expanding the match to the full identifier before detection, we can correctly infer it as being `Case::Camel` instead of
`Case::Pascal`.

Once we know the case of the match, we detect the replacement case and convert it to the target case via
[`.to_case(case)`](https://docs.rs/convert_case/0.11.0/convert_case/trait.Casing.html#tymethod.to_case) function
provided by the library.

Finally, the last thing we need to take care of can be see in the example above. If we need to replace `Simple` in
`mySimpleThing` with `very complex`, and we are in the middle of an identifier (the match was extended to the left),
then that means we must not convert that to camel case (`veryComplex`), but to Pascal case (`VeryComplex`).

While this approach is certainly not flawless and there will certainly be false positives, it covers most cases I came
across. I'm sure we can improve the heuristics once I can gather some feedback from users.

## Future Work

*[TUI]: Terminal User Interface

*[IDE]: Integrated Development Environment

*[LSP]: Language Server Protocol

*[UI]: User Interface

*[UX]: User Experience

*[LRU]: Least Recently Used
