---
title: Optimizing Text Offset Calculations
date: 2025-10-18T19:46:00Z
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

<script lang="ts">
  import shadow from './optimizing-text-offset-calculation/shadow.jpg?enhanced&imgSizes=true'
  import Image from '$lib/components/Image.svelte'
  import ChatNote from '$lib/components/ChatNote.svelte'
</script>

## Contents

## Introduction

Over the past few months, I've been working on a [linter for the Solidity language](/blog/announcing-lintspec).
The tool, written in Rust, initially used [slang](https://nomicfoundation.github.io/slang/) as its parser because that
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

Since there might be duplicate offsets in the spans of all the source items, we'll ideally want to deduplicate them and
sort them to facilitate iteration alongside our source code content.
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
- The first, a pretty short file with 190 lines of code (marked "short" below), which yields 13 `Definition` items and **126 byte offsets** of interest in the file;
- The second "long" file with 1400 lines of code, which contains 42 `Definition` items and **426 byte offsets**.

| Implementation         | Fastest [µs] | Median [µs] | Mean [µs] | Slowest [µs] |
| ---------------------- | ------------ | ----------- | --------- | ------------ |
| Baseline (short)       | 21.42        | 21.69       | 22.27     | 35.39        |
| Baseline (long)        | 138.2        | 140.3       | 146.4     | 255          |

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

This simple change yields a decent speedup versus the baseline already:

| Implementation         | Fastest [µs] | Median [µs] | Mean [µs] | Slowest [µs] | Speedup vs. baseline |
| ---------------------- | ------------ | ----------- | --------- | ------------ | -------------------- |
| Better advance (short) | 16.54        | 16.85       | 17.42     | 43.82        | 1.29x                |
| Better advance (long)  | 100.6        | 102.1       | 104       | 126.9        | 1.37x                |

<Image
  src={shadow}
  maxWidth={800}
  alt="A picture of a sleeping orange and white cat with his face burried in his paws."
  caption="This picture of Shadow, my recently adopted cat, serves solely to break up the continuity of the article."
/>

## `Vec` is All You Need

By inspecting a [flamegraph](https://github.com/flamegraph-rs/flamegraph) of the execution, I noticed there was a
non-negligible amount spent in `BTreeSet::insert` and `HashMap::insert`. This makes sense, those are relatively heavy
operations, requiring to either balance a B-Tree or calculate a hash of the key.

When the parser visits the AST to gather `Definition` items, it encounters each source item in the same order as they
appear in the source code. That is, the start of each span is greater than (or equal to) the span of the previous item.
This means that our `gather_offsets` function yields a mostly-sorted list of offsets with its natural iteration order.
This also means that our cache access pattern in `populate` is hardly random. As such, we can probably ditch those
advanced data structures completely and use a `Vec` instead.

Sorting algorithms are _very_ good nowadays, so I anticipate that sorting the offsets `Vec` will be much faster than
constructing the B-Tree. By trying out `sort` and `sort_unstable`, the unstable variant comes on top, meaning the data
is not pre-sorted enough that the stable algorithm prevails.

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

| Implementation         | Fastest [µs] | Median [µs] | Mean [µs] | Slowest [µs] | Speedup vs. previous | Speedup vs. baseline |
| ---------------------- | ------------ | ----------- | --------- | ------------ | -------------------- | -------------------- |
| Only Vec (short)       | 10.58        | 10.63       | 10.9      | 21.85        | 1.59x                | 2.04x                |
| Only Vec (long)        | 82.65        | 83.08       | 86.94     | 152.9        | 1.23x                | 1.69x                |

## SIMDid You Say ASCII?

<ChatNote>
What's that I hear? Yes, you. You in the back. Sim-who? SIMD? Never heard of him.
</ChatNote>

If you were looking at that hot loop in `gather_text_indices` and shouting "You can parallelize that!" then you'd be
right. Comparing a bunch of bytes is something modern CPUs can parallelize via special "wide" registers of 128-512 bits.
The process of operating on those registers is called SIMD (single instruction, multiple data) and allows to
operate on subsets of those wide register bits (often called "lanes") in parallel via special architecture-dependent
instructions.

In our case, we know we can optimize the advance of the `utf-8`, `utf-16` fields of `TextIndex` if the characters are in
the ASCII range (+1 for each character/byte). Wouldn't it be nice if we could check like 32 of those at a time? Since
the files are mostly ASCII and the interesting indices are sparse, we could check the whole file in no time.

Since this is my first time actually using SIMD, I went for a pretty naive optimization, which only uses these
instructions to find contiguous blocks of ASCII characters until a Unicode character or line break shows up. We still
defer to the old algorithm to account for Unicode characters and newlines, because I couldn't be bothered (yet!) to
handle multi-byte characters spanning across chunks.

### The Helper

The first task is to create a small helper that will use the [`wide`](https://crates.io/crates/wide) crate for portable
SIMD. Specifically, we'll use [`i8x32`](https://docs.rs/wide/latest/wide/struct.i8x32.html) because 256-bit registers
are pretty common on consumer CPUs (AVX2 instruction set), which I target with `lintspec`. What's more, if only SSE2 is
supported, `wide` uses two `i8x16` internally.

<ChatNote>
Remember how each processor architecture have their own instructions? Well that crate abstracts that away and performs
runtime checks to see which of those are available on the machine running the code.
</ChatNote>

This function simply takes a slice of `i8` (many SIMD instructions somehow operate on signed integers, probably because
they are more versatile than their unsigned counterparts would be?) and returns a bit mask (a number where each bit
represents a boolean state, either on or off) indicating which of the first 32 items in the slice match a newline or
Unicode character.

The first thing to do is to load 32 bytes into one of those special registers. Because our bytes are `u8`, but the type
expects `i8`, we had to cast those into signed integers, which maps values greater than 127 (non-ASCII) into the
negative range.
How convenient, to check if the bytes are non-ASCII, we simply need to check if the corresponding `i8` value is
negative!

We thus put all zeroes into another one of those registers and perform a `simd_lt` operation, which will compare each
byte of the first operand with the bytes in the second, and set the corresponding byte in the result to `0xFF` if lower,
or `0x00` if equal or higher. At this point, our result is still a `i8x32`, but we can convert that to a bit mask with
yet another special SIMD instruction. In `wide`, it's as easy as invoking `to_bitmask`. This will map each of the bytes
in the result to a _bit_ in a regular 32-bit integer.

We then do the same to check if some of the input bytes are equal to `\n` or `\r`, and merge all 3 masks with a simple
bit-wise `OR`. The `splat` operation fills a wide register with multiple copies of the same byte, and `simd_eq` puts
`0xFF` in the result if the bytes match.

With this function, it's now trivial to know how many bytes at the start of the slice are contiguous ASCII characters,
we simply call `mask.trailing_zeros()` (the lowest bit in the mask corresponds to the first byte in the slice).

```rust
const SIMD_LANES: usize = i8x32::LANES as usize;

/// Check the first 32 bytes of the input slice for non-ASCII characters and newline characters.
///
/// The function returns a mask with bits flipped to 1 for items which correspond to `\n` or `\r` or non-ASCII
/// characters. The least significant bit in the mask corresponds to the first byte in the input.
///
/// This function uses SIMD to accelerate the checks.
fn find_non_ascii_and_newlines(chunk: &[i8]) -> u32 {
    let bytes = i8x32::new(
        chunk[..SIMD_LANES]
            .try_into()
            .expect("slice to contain enough bytes"),
    );

    // find non-ASCII
    // u8 values from 128 to 255 correspond to i8 values -128 to -1
    let nonascii_mask = bytes.simd_lt(i8x32::ZERO).to_bitmask();
    // find newlines
    let lf_bytes = i8x32::splat(b'\n' as i8);
    let cr_bytes = i8x32::splat(b'\r' as i8);
    let lf_mask = bytes.simd_eq(lf_bytes).to_bitmask();
    let cr_mask = bytes.simd_eq(cr_bytes).to_bitmask();
    // combine masks
    nonascii_mask | lf_mask | cr_mask
}
```

### The Iteration

Armed with our helper function, we now need to iterate on the source code and gather a list of `TextIndex` that
correspond to the offsets of interest.

The process goes something like this:
1. Check if there are 32 bytes remaining in the input;
1. If so, count how many of those are ASCII with the helper;
1. Also check if the next offset of interest is within this chunk;
1. If the next offset comes before the next non-ASCII or newline, advance the current `TextIndex` and save a copy;
1. Otherwise, advance the `TextIndex` to the next non-ASCII or newline;
1. After processing this 32-byte chunk, if we stopped because of non-ASCII or newline character, we process those
   with the default routine (`char` iterator and `TextIndex::advance`), else we go for the next chunk;
1. When we're done processing line endings and Unicode characters (if any), we go back to the SIMD routine.

Are you ready for the Wall of Code™?

```rust
fn gather_text_indices(source: &str, offsets: &[usize]) -> Vec<TextIndex> {
    assert!(!source.is_empty(), "source cannot be empty");
    let mut text_indices = Vec::with_capacity(offsets.len()); // upper bound for the size
    let mut current = TextIndex::ZERO;

    let mut ofs_iter = offsets.iter();
    let mut next_offset = ofs_iter
        .next()
        .expect("there should be one element at least");
    let bytes = source.as_bytes();
    // SAFETY: this is safe as we're re-interpreting a valid slice of u8 as i8.
    // All slice invariants are already upheld by the original slice and we use the same pointer and length as the
    // original slice.
    let bytes: &[i8] = unsafe { slice::from_raw_parts(bytes.as_ptr().cast::<i8>(), bytes.len()) };
    'outer: loop {
        // check whether we can try to process a 32-bytes chunk with SIMD
        while current.utf8 + SIMD_LANES < bytes.len() {
            debug_assert!(next_offset >= &current.utf8);
            let newline_non_ascii_mask = find_non_ascii_and_newlines(&bytes[current.utf8..]);
            let bytes_until_nl_na = newline_non_ascii_mask.trailing_zeros() as usize;
            if bytes_until_nl_na == 0 {
                // we hit a newline or non-ASCII char, need to go into per-char processing routine
                break;
            }
            if next_offset < &(current.utf8 + SIMD_LANES) {
                // a desired offset is present in this chunk
                let bytes_until_target = (*next_offset).saturating_sub(current.utf8);
                if bytes_until_nl_na < bytes_until_target {
                    // we hit a newline or non-ASCII char, need to go into per-char processing routine
                    current.advance_by_ascii(bytes_until_nl_na); // advance because there are ASCII bytes we can process
                    break;
                }
                // else, we reached the target position and it's an ASCII char, store it
                current.advance_by_ascii(bytes_until_target);
                text_indices.push(current);
                // get the next offset of interest, ignoring any duplicates
                next_offset = match ofs_iter.find(|o| o != &next_offset) {
                    Some(o) => o,
                    None => break 'outer, // all interesting offsets have been found
                };
                continue;
            }
            // else, no offset of interest in this chunk
            // fast forward current to before any newline/non-ASCII
            current.advance_by_ascii(bytes_until_nl_na);
            if bytes_until_nl_na < SIMD_LANES {
                // we hit a newline or non-ASCII char, need to go into per-char processing routine
                break;
            }
        }
        if &current.utf8 == next_offset {
            // we reached a target position, store it
            text_indices.push(current);
            // skip duplicates and advance to next offset
            next_offset = match ofs_iter.find(|o| o != &next_offset) {
                Some(o) => o,
                None => break 'outer, // all interesting offsets have been found
            };
        }
        // normally, the next byte is either part of a Unicode char or line ending
        // fall back to character-by-character processing
        let remaining_source = &source[current.utf8..];
        let mut char_iter = remaining_source.chars().peekable();
        let mut found_na_nl = false;
        while let Some(c) = char_iter.next() {
            debug_assert!(
                next_offset >= &current.utf8,
                "next offset {next_offset} is smaller than current {}",
                current.utf8
            );
            current.advance(c, char_iter.peek());
            if !c.is_ascii() || c == '\n' {
                found_na_nl = true;
            }
            if &current.utf8 == next_offset {
                // we reached a target position, store it
                text_indices.push(current);
                // skip duplicates and advance to next offset
                next_offset = match ofs_iter.find(|o| o != &next_offset) {
                    Some(o) => o,
                    None => break 'outer, // all interesting offsets have been found
                };
            }
            if found_na_nl && char_iter.peek().is_some_and(char::is_ascii) {
                // we're done processing the non-ASCII / newline characters, let's go back to SIMD-optimized processing
                break;
            }
        }
        if current.utf8 >= bytes.len() - 1 {
            break; // done with the input
        }
    }
    text_indices
}
```

The numbers are in, and they look great:

| Implementation         | Fastest [µs] | Median [µs] | Mean [µs] | Slowest [µs] | Speedup vs. previous | Speedup vs. baseline |
| ---------------------- | ------------ | ----------- | --------- | ------------ | -------------------- | -------------------- |
| SIMD (short)           | 1.951        | 1.972       | 2.036     | 6.321        | 5.39x                | 11.00x               |
| SIMD (long)            | 12.74        | 12.82       | 13.24     | 26.36        | 6.48x                | 10.94x               |

## Final Performance

Here is the final comparison between the baseline and each of the optimization steps:

| Short file             | Median [µs] | Speedup vs. baseline |
| ---------------------- | ----------- | -------------------- |
| Baseline (short)       | 21.69       | 1.00x                |
| Better advance (short) | 16.85       | 1.29x                |
| Only Vec (short)       | 10.63       | 2.04x                |
| SIMD (short)           | 1.972       | 11.00x               |

| Long file              | Median [µs] | Speedup vs. baseline |
| ---------------------- | ----------- | -------------------- |
| Baseline (long)        | 140.3       | 1.00x                |
| Better advance (long)  | 102.1       | 1.37x                |
| Only Vec (long)        | 83.08       | 1.69x                |
| SIMD (long)            | 12.82       | 10.94x               |

With all these steps, we managed to improve the speed of the algorithm by 11x! 😎

I hope you found this article interesting, it was certainly fun to write.
Having never used SIMD before, this demystified the topic for me and I'm looking forward to putting this new skill to
good use in the near future.

Until next time!

*[LSP]: Language Server Protocol
*[UTF]: Unicode Transformation Format
*[AST]: Abstract Syntax Tree
*[ASCII]: American Standard Code for Information Interchange
*[SIMD]: Single Instruction, Multiple Data
