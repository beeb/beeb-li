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
The original implementation uses a `BTreeSet` which sorts the items and deduplicates them at the same time:

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
            /* elided for brevity, here we also gather offsets for function return values, struct members, ... */
        }
    }
    offsets
 }
```

### Advancing the `TextIndex`

The native implementation was taken from `slang` and goes like this:

```rust
impl TextIndex {
    /// Advance the index, accounting for lf/nl/ls/ps characters and combinations.
    /// This is *not* derived from the definition of 'newline' in the language definition,
    /// nor is it a complete implementation of the Unicode line breaking algorithm.
    pub fn advance(&mut self, c: char, next: Option<&char>) {
        self.utf8 += c.len_utf8(); // width of c in bytes
        self.utf16 += c.len_utf16(); // width of c in UTF-16 code units
        match (c, next) {
            ('\r', Some('\n')) => {
                // Ignore for now, we will increment the line number when we process the \n
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
fn gather_text_indices(source: &str, offsets: &[usize]) -> HashMap<usize, TextIndex> {
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
            /* elided for brevity, here we also populate offsets for function return values, struct members, ... */
        }
    }
}
```

## First Optimization



*[LSP]: Language Server Protocol
*[UTF]: Unicode Transformation Format
