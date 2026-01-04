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
  import lastCommand from './fish-tips-and-tricks/last-command.cast?url'
  import sudo from './fish-tips-and-tricks/sudo.cast?url'
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

In `bash`, there's a convenient alias `!!` to reference the content of the previous command that was run. The same is
available in `zsh` but there is no equivalent (by default) in `fish`. However, it's trivial to implement it with a
custom function and associated [abbreviation](https://fishshell.com/docs/current/cmds/abbr.html):

```fish
function last_history_item
  echo $history[1]
end
abbr -a !! --position anywhere --function last_history_item
```

The huge advantage of abbreviations is that they automatically expand when you hit the space key, so they are not
"blind" and allow you to inspect the command before committing.

<Asciinema url={lastCommand} fallback="https://asciinema.org/a/j124k6CJMKcUp5unlIkx2g5cc" cols={110} rows={11} loop={3} />

We'll go into more details about the `abbr` command in a later section of this article.

## Prepend `sudo`

In the video by Dreams of Code, an annoyance that is mentioned is having to re-type a command which was run without
`sudo` but required it. The proposed solution is to type `sudo !!` to invoke the last command with `sudo`.

In `fish` however, there's a better way! The built-in shortcut <kbd class="kbd">alt-s</kbd> preprends the current
command with `sudo`, `doas`, `please` or `run0` as available. This can even be combined with the previous tip, by typing
`!!` followed by <kbd class="kbd">alt-s</kbd> to re-run the last command. Alternatively, bringing up the last history's
item with the up arrow before hitting the shortcut also works.

<Asciinema url={sudo} fallback="https://asciinema.org/a/m7REJTArn2v2DHIFGZrUerLzq" cols={110} rows={11} loop={3} />

## Run Hook on Directory Navigation

`zsh` has `chpwd()`, a hook which runs some code any time the current directory is changed. A very similar thing can be
done in `fish` with the following syntax:

```fish
function my_chpwd --on-variable PWD
  echo "Changed to $PWD"
end
```

The function gets run any time the special `$PWD` environment variable changes.

## Open Files Based on Extension

## Abbreviations (for Commands, Arguments, Paths)

### Setting the Cursor Position

## Batch Moving Files (not with `fish`)

## Clearing the Screen (Keeping the Buffer)

## Copy and Paste

## Bonus: Navigation History
