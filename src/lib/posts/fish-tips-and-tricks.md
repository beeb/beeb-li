---
title: Fish Tips & Tricks
date: 2026-01-04T12:00:00Z
categories:
  - fish
  - shell
  - tutorial
  - tips
coverImage: false
coverCredits: Photo by .. on Unsplash
coverAlt: Alt
excerpt: >
  A collection of tips and tricks for fish shell I wished I knew about a long time ago.
---

<script lang="ts">
  import Asciinema from "$lib/components/Asciinema.svelte"
  import Image from '$lib/components/Image.svelte'
  import ChatNote from '$lib/components/ChatNote.svelte'
  import editBuffer from './fish-tips-and-tricks/edit-buffer.cast?url'
</script>

## Contents

## Introduction

I recently watched a [video by Dreams of Code](https://www.youtube.com/watch?v=3fVAtaGhUyU) which explains nice tips and
tricks that can be used in the popular [`zsh` shell](https://www.zsh.org/). Since I use [`fish`](https://fishshell.com/)
instead, I figured it would be a good opportunity to transfer some of those tips over, learn a bit myself, and hopefully
help you as well.

This article will not describe the `zsh` tips (or only briefly), instead I invite you to watch the video linked above.
They have all been transposed to `fish` in the sections below (and some more).

## Editing the Command Buffer

Similar to `zsh`'s `edit-command-buffer` widget (which must be bound manually), `fish` allows to edit the command buffer
in your configured `$VISUAL` or `$EDITOR` tool with the default keybinding <kbd class="kbd">alt-e</kbd>.

In the cast below, the buffer gets opened in [helix](https://helix-editor.com/), my modal editor of choice!

<Asciinema url={editBuffer} fallback="https://asciinema.org/a/m7mrUL9LmRoz2AymjVN1DY4LB" cols={110} rows={11} loop={3} />

## Undo and Redo Command Edits

When modifying the command buffer inline, with shortcuts such as <kbd class="kbd">alt-backspace</kbd> (deleting a whole
argument), it's sometimes convenient to be able to undo the last modification.

`fish` has a default key assignment for this: <kbd class="kbd">ctrl-z</kbd>. You could have guessed that, right?

The `redo` command is bound to <kbd class="kbd">ctrl-r</kbd> by default, but since I use that to open
[`atuin`](https://atuin.sh/) (a really awesome tool, if you don't know!), I changed the binding:

```fish
bind ctrl-shift-Z redo
```

## Bash's `!!` for Last Command

## Prepend `sudo` (or `doas`)

## Run Hook on Directory Navigation

## Open Files Based on Extension

## Abbreviations (for Commands, Arguments, Paths)

### Setting the Cursor Position

## Batch Moving Files (not with `fish`)

## Clearing the Screen (Keeping the Buffer)

## Copy and Paste

## Bonus: Navigation History
