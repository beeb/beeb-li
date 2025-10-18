---
title: Optimizing Text Offset Calculations
date: 2025-10-17T08:00:00Z
categories:
  - rust
  - simd
  - optimization
coverImage: true
coverCredits: Photo by Raymond Kotewicz on Unsplash
coverAlt: An aerial view of a train yard with numerous parallel train tracks.
excerpt: >
  A tale of optimization for an algorithm that turns byte offsets into line and column numbers, and UTF-16 offsets. The
  final implementation leverages SIMD and fixes several inefficiencies in the original solution.
---

## Contents

## Introduction

Over the past few months, I've been working on a [linter for the Solidity language](/blog/announcing-lintspec).
Initially, the tool, written in Rust, used [slang](https://nomicfoundation.github.io/slang/) as its parser because that
was the best option at the time. Slang provides a very useful type to identify a position in the text (like the start
or end of a source item's span):

```rust
#[derive(Debug, Default, Hash, Copy, Clone, PartialEq, Eq)]
pub struct TextIndex {
    pub utf8: usize,
    pub utf16: usize,
    pub line: usize,
    pub column: usize,
}
```

This is because the parser is used by Nomic for their LSP implementation, which
[uses UTF-16 as the default encoding](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocuments)
for exchanging text offsets with the clients (mostly text editors). This is also something I want to support with
`lintspec`, I could well see it integrated into a language server at some point.

However, I have moved towards using [`solar-parse`](https://github.com/paradigmxyz/solar) as the default parser, because it's
very performant and production ready (used in [Foundry](https://github.com/foundry-rs/foundry)). It also doesn't help
that `slang` has not published a release on [crates.io](https://crates.io) in a long while, so I kept it only as a
legacy parser backend just in case. Now `solar` doesn't provide an equivalent of the `TextIndex` we've seen above, only
byte offsets, so I had to make my own.


## The Algorithm

The `solar`-based parser outputs a list of `Definition`, an enum which represents a source item (like a Solidity
contract, function, or struct definition). Contained inside this type is a source span (byte offset range) for the
overall item, as well as the span for each parameter, member, or return value for this item.

The goal is to augment these byte offsets with the other fields in `TextIndex`, that is the **line**, **column** and
**UTF-16 offset** (number of Unicode code units before that position in the text when the text is encoded as UTF-16).
The UTF-8 offset is simply the number of bytes since the start of the text (which is guaranteed to be valid UTF-8 in
Rust), so we have that already from the parser's output.

Here are the steps:
- Gather all byte offsets for the start and end of each item's span(s);
- Iterate over each character in the source code, keeping track of the current UTF-16 position and line/column by
  advancing the `TextIndex` (incrementing by 1 or more each counter);
- If the current position matches one of the gathered offsets, record a copy of the current `TextIndex` somewhere;
- Iterate over the list of `Definition` and update their spans with the indices we saved.

## Naive Implementation

### Gathering All Byte Offsets

Since there might be duplicate offsets in the spans of all the source items, we'll ideally want to deduplicate them.
The original implementation uses a [`BTreeSet`](https://doc.rust-lang.org/std/collections/struct.BTreeSet.html) which
sorts the items and deduplicates them at the same time:

```rust
fn gather_offsets(definitions: &[Definition]) -> BTreeSet<usize> {
    fn register_span(set: &mut BTreeSet<usize>, span: &TextRange) {
        set.insert(span.start.utf8);
        set.insert(span.end.utf8);
    }
    let mut offsets = BTreeSet::new();
    for def in definitions.iter() {
        def.span().inspect(|s| register_span(&mut offsets, s));
        match def {
            Definition::Constructor(ConstructorDefinition { params, .. })
            | Definition::Error(ErrorDefinition { params, .. })
            | Definition::Event(EventDefinition { params, .. }) /* etc */ => {
                for p in params {
                    register_span(&mut offsets, &p.span);
                }
            }
            // ... omitted for brevity, match arms for function return values, struct members, ... */
        }
    }
    offsets
 }
```

### Advancing the `TextIndex`

The naive implementation was taken from `slang` and goes like this:

```rust
impl TextIndex {
    /// Advance the index, accounting for lf/nl/ls/ps characters and combinations.
    /// 
    /// This is *not* derived from the definition of 'newline' in the language definition,
    /// nor is it a complete implementation of the Unicode line breaking algorithm.
    #[inline]
    pub fn advance(&mut self, c: char, next: Option<&char>) {
        self.utf8 += c.len_utf8(); // width of c in bytes
        self.utf16 += c.len_utf16(); // width of c in UTF-16 code units
        match (c, next) {
            ('\r', Some('\n')) => {
                // ignore for now, we will increment the line number when we process the \n
            }
            ('\n' | '\r', '\\u{2028}', '\\u{2029}', _) => {
                self.line += 1;
                self.column = 0;
            }
            _ => {
                self.column += 1;
            }
        }
    }
}
```

### Iterating over the Source

Here's where most the work is (should be) done. We iterate over the source and collect fully-fledged `TextIndex` for
all interesting offsets into a `HashMap` for fast lookups:

```rust
fn gather_text_indices(source: &str, offsets: &BTreeSet<usize>) -> HashMap<usize, TextIndex> {
    let mut text_indices = HashMap::new();
    let mut current = TextIndex::ZERO;

    let mut ofs_iter = offsets.iter();
    let mut char_iter = source.chars().peekable();
    let mut next_offset = ofs_iter
        .next()
        .expect("there should be one element at least");
    while let Some(c) = char_iter.next() {
        if &current.utf8 == next_offset {
            // found an interesting offset, let's record a copy
            text_indices.insert(current.utf8, current);
            next_offset = match ofs_iter.next() {
                Some(o) => o,
                None => break, // no more offsets, we're done
            };
        }
        debug_assert!(next_offset > &current.utf8);
        current.advance(c, char_iter.peek());
    }
    text_indices
}
```

### Populating the Spans

The final step is to edit the `Definition` list in place to add the missing information in the spans:

```rust
fn populate(text_indices: &HashMap<usize, TextIndex>, definitions: &mut Vec<Definition>) {
    fn populate_span(map: &HashMap<usize, TextIndex>, span: &mut TextRange) {
        span.start = map
            .get(&span.start.utf8)
            .expect("utf8 offset should be present in cache")
            .into();
        span.end = map
            .get(&span.end.utf8)
            .expect("utf8 offset should be present in cache")
            .into();
    }
    for def in definitions {
        if let Some(span) = def.span_mut() {
            populate_span(&text_indices, span);
        }
        match def {
            Definition::Constructor(ConstructorDefinition { params, .. })
            | Definition::Error(ErrorDefinition { params, .. })
            | Definition::Event(EventDefinition { params, .. }) /* etc */ => {
                for p in params {
                    populate_span(&text_indices, &mut p.span);
                }
            }
            // ... omitted for brevity, match arms for function return values, struct members, ... */
        }
    }
}
```

## Baseline Performance

These should not be considered absolute numbers but will serve to compare the impact of each improvement.

I tested the algorithm on two different source files:
- The first, a pretty long file with 1400 lines of code (marked "long" below), which yields 42 `Definition` items and **426 byte offsets** of interest in the file;
- The second ("short"), a much shorter file with 190 lines of code, which contains only 13 `Definition` items and **126 byte offsets**.

| Implementation | Fastest | Median | Mean | Slowest |
| --- | --- | --- | --- | --- |
| Baseline (long) | 102.1 µs | 103.2 µs | 105.6 µs | 149.8 µ |
| Baseline (short) | 16.44 μs | 16.83 µs | 17.1 µs | 26.8 µs |

## Optimized `advance`

Because most of a Solidity codebase (or any language, really) consists of ASCII characters, we might be able to add
a fast path to the `TextIndex::advance` function we've seen above. This is because we do not need to call `len_utf8`
or `len_utf16` for those characters (they are always 1 byte/code unit). Instead of having to branch twice for each
character (those functions each have a `match` statement), we only branch once on a very simple condition (whether the
char value is lower than `0xFF`). For the `else` case, we can also skip checking for `\r` and `\n`.

```rust
impl TextIndex {
    /// Advance the index, accounting for lf/nl/ls/ps characters and combinations.
    /// This is *not* derived from the definition of 'newline' in the language definition,
    /// nor is it a complete implementation of the Unicode line breaking algorithm.
    ///
    /// Implementation inspired by [`slang_solidity`].
    #[inline]
    pub fn advance(&mut self, c: char, next: Option<&char>) {
        // fast path for ASCII characters
        if c.is_ascii() {
            self.utf8 += 1;
            self.utf16 += 1;
            match (c, next) {
                ('\r', Some(&'\n')) => {
                    // ignore for now, we will increment the line number when we process the \n
                }
                ('\n' | '\r', _) => {
                    self.line += 1;
                    self.column = 0;
                }
                _ => {
                    self.column += 1;
                }
            }
        } else {
            // slow path for Unicode
            self.utf8 += c.len_utf8();
            self.utf16 += c.len_utf16();
            match c {
                '\\u{2028}' | '\\u{2029}' => {
                    self.line += 1;
                    self.column = 0;
                }
                _ => {
                    self.column += 1;
                }
            }
        }
    }
}
```

This simple change yields a decent speed-up versus the baseline already:


| Implementation | Fastest | Median | Mean | Slowest | Speed-up (median) |
| --- | --- | --- | --- | --- | --- |
| Better Advance (long) | 83.85 µs | 85.16 µs | 86.81 µs | 112.7 µs | 21.2% |
| Better Advance (short) | 14.12 µs | 14.45 µs | 14.69 µs | 21.81 µs | 16.5% |

## `Vec` is All You Need

By inspecting a [flamegraph](https://github.com/flamegraph-rs/flamegraph) of the execution, I noticed there was a
non-negligible amount spent in `BTreeSet::insert` and `HashMap::insert`. This makes sense, those are relatively heavy
operations, requiring to either balance a B-Tree or calculate a hash of the key.

When the parser visits the AST to gather `Definition` items, it encounters each source item in the same order as they
appear in the source code. That is, the start of each span is greater than the span of the previous item. This means
that our `gather_offsets` function yields a mostly-sorted list of offsets with its natural iteration order. This also
means that our cache access pattern in `populate` is hardly random. As such, we can probably ditch those complex
data structures completely and use a `Vec` instead.

Sorting algorithms are _very_ good nowadays, so I anticipate that sorting the offsets `Vec` will be much faster than
constructing the B-Tree. By trying out `sort` and `sort_unstable`, the unstable variant comes on top.

Gathering the text indices is almost the same as with the B-tree, with the exception that we might encounter duplicates.
This is easily fixed by consuming the iterator until it yields a different offset through `find`.

For retrieving the `TextIndex` corresponding to an offset, we made the observations that iterating on spans is monotonic
with respect to the start offset. So we can skip a bunch of items in the list and then perform a quick linear search to
find the next offset of interest.

```rust
fn gather_offsets(definitions: &[Definition]) -> Vec<usize> {
    fn register_span(set: &mut Vec<usize>, span: &TextRange) {
        set.push(span.start.utf8);
        set.push(span.end.utf8);
    }
    // looking at the data, this capacity is a good guess
    // it should almost always be enough to store all the offsets without growing the array
    let mut offsets = Vec::with_capacity(definitions.len() * 10); 
    // ... rest of the function remains untouched ...
    offsets.sort_unstable();
    offsets
}

fn gather_text_indices(source: &str, offsets: &[usize]) -> Vec<TextIndex> {
    // upper bound for the size, we'll have fewer items if there are duplicates
    let mut text_indices = Vec::with_capacity(offsets.len()); 
    let mut current = TextIndex::ZERO;

    let mut ofs_iter = offsets.iter();
    let mut char_iter = source.chars().peekable();
    let mut next_offset = ofs_iter
        .next()
        .expect("there should be one element at least");
    while let Some(c) = char_iter.next() {
        if &current.utf8 == next_offset {
            // found an interesting offset, let's record a copy
            text_indices.push(current);
            // because the list of offsets can contain duplicates (but is sorted), we simply ignore elements
            // which have the same value as the current offset
            next_offset = match ofs_iter.find(|o| o != &next_offset) {
                Some(o) => o,
                None => break, // no more offsets, we're done
            };
        }
        debug_assert!(next_offset > &current.utf8);
        current.advance(c, char_iter.peek());
    }
    text_indices
}

fn populate(text_indices: &[TextIndex], definitions: &mut Vec<Definition>) {
    // linear serach starting at `start_idx` for the span start, and continuing from there for the span end
    fn populate_span(indices: &[TextIndex], start_idx: usize, span: &mut TextRange) -> usize {
        let res;
        (res, span.start) = indices
            .iter()
            .enumerate()
            .skip(start_idx)
            .find_map(|(i, ti)| (ti.utf8 == span.start.utf8).then_some((i, *ti)))
            .expect("utf8 start offset should be present in cache");
        span.end = *indices
            .iter()
            .skip(res + 1)
            .find(|ti| ti.utf8 == span.end.utf8)
            .expect("utf8 end offset should be present in cache");
        // for the next definition or item inside of a definition, we can start after the start of this item
        // because start indices increase monotonically
        res + 1
    }
    let mut idx = 0; // keep track of the search start index
    for def in definitions {
        if let Some(span) = def.span_mut() {
            idx = populate_span(&text_indices, idx, span);
        }
        match def {
            Definition::Constructor(ConstructorDefinition { params, .. })
            | Definition::Error(ErrorDefinition { params, .. })
            | Definition::Event(EventDefinition { params, .. }) /* etc */ => {
                for p in params {
                    idx = populate_span(&text_indices, idx, &mut p.span);
                }
            }
            // ... omitted for brevity, match arms for function return values, struct members, ... */
        }
    }
}
```

This little maneuver further improves the performance, albeit more for the small file. This is probably due to the
overhead of sorting the larger offsets array.

| Implementation | Fastest | Median | Mean | Slowest | Speed-up vs. previous (median) |
| --- | --- | --- | --- | --- | --- |
| Only Vec (long) | 78.4 µs | 78.48 µs | 79.69 µs | 109.5 µs | 8.5% |
| Only Vec (short) | 10.09 µs | 10.12 µs | 10.4 µs | 24.87 µs | 42.8% |


<!-- Raw results:
Timer precision: 10 ns
complete_text_ranges                fastest       │ slowest       │ median        │ mean          │ samples │ iters
├─ a_initial_implementation                       │               │               │               │         │
│  ├─ ./benches/Test2.sol           16.44 µs      │ 26.8 µs       │ 16.83 µs      │ 17.1 µs       │ 100     │ 100
│  ╰─ ./benches/Test.sol            102.1 µs      │ 149.8 µs      │ 103.2 µs      │ 105.6 µs      │ 100     │ 100
├─ b_better_advance_implementation                │               │               │               │         │
│  ├─ ./benches/Test2.sol           14.12 µs      │ 21.81 µs      │ 14.45 µs      │ 14.69 µs      │ 100     │ 100
│  ╰─ ./benches/Test.sol            83.85 µs      │ 112.7 µs      │ 85.16 µs      │ 86.81 µs      │ 100     │ 100
├─ c_only_vec_implementation                      │               │               │               │         │
│  ├─ ./benches/Test2.sol           10.09 µs      │ 24.87 µs      │ 10.12 µs      │ 10.4 µs       │ 100     │ 100
│  ╰─ ./benches/Test.sol            78.4 µs       │ 109.5 µs      │ 78.48 µs      │ 79.69 µs      │ 100     │ 100
├─ d_precise_vec_implementation                   │               │               │               │         │
│  ├─ ./benches/Test2.sol           14.62 µs      │ 23.97 µs      │ 14.65 µs      │ 14.8 µs       │ 100     │ 100
│  ╰─ ./benches/Test.sol            114 µs        │ 139.2 µs      │ 114.1 µs      │ 115.8 µs      │ 100     │ 100
╰─ e_final_implementation                         │               │               │               │         │
   ├─ ./benches/Test2.sol           2.432 µs      │ 9.69 µs       │ 2.452 µs      │ 2.583 µs      │ 100     │ 100
   ╰─ ./benches/Test.sol            16.8 µs       │ 28.96 µs      │ 16.86 µs      │ 17.33 µs      │ 100     │ 100
-->

*[LSP]: Language Server Protocol
*[UTF]: Unicode Transformation Format
*[AST]: Abstract Syntax Tree
