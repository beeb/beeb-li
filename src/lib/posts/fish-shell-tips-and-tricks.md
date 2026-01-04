---
title: Fish Tips & Tricks
date: 2026-01-04T12:00:00Z
categories:
  - fish
  - shell
  - linux
  - tutorial
  - tips
coverImage: true
coverCredits: Photo by Pratik Patel on Unsplash
coverAlt: A picture of an orange shell from some marine animal, on a black sand beach. The sea can be seen in the background, blurry and desaturated, with some rocks delimiting the other side of a creek.
excerpt: >
  A collection of tips and tricks for fish shell I wished I knew about a long time ago.
---

<script lang="ts">
  import Asciinema from "$lib/components/Asciinema.svelte"
  import Image from '$lib/components/Image.svelte'
  import ChatNote from '$lib/components/ChatNote.svelte'
  import editBuffer from './fish-shell-tips-and-tricks/edit-buffer.cast?url'
  import lastCommand from './fish-shell-tips-and-tricks/last-command.cast?url'
  import sudo from './fish-shell-tips-and-tricks/sudo.cast?url'
  import open from './fish-shell-tips-and-tricks/open.cast?url'
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

## `!!` for Last Command

In `bash`, there's a convenient alias `!!` to reference the content of the previous command that was run. The same is
available in `zsh` but there is no equivalent (by default) in `fish`. However, it's trivial to implement it with a
custom function and associated [abbreviation](https://fishshell.com/docs/current/cmds/abbr.html):

```fish
function last_history_item
  echo $history[1]
end
abbr -a !! --position anywhere --function last_history_item
```

<Asciinema url={lastCommand} fallback="https://asciinema.org/a/j124k6CJMKcUp5unlIkx2g5cc" cols={110} rows={11} loop={3} />
<ChatNote>
The huge advantage of abbreviations is that they automatically expand when you hit the space key, so they are not
"blind" and allow you to inspect the command before committing.
We'll go into more details about the <code>abbr</code> command in a later section of this article.
</ChatNote>

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

Another neat trick shown in the video is the ability to enter a filename (without a command before), and `zsh` applies
some replacement template based on the file extension, allowing one to open the file with the desired binary
automatically. The feature in question is called "suffix aliases".

The best way to go about this is to create a function which is invoked when the entered command cannot be resolved.
That's what the special `fish_command_not_found` function does. Here, I chose to view text files with
[`bat`](https://github.com/sharkdp/bat) and open other files with different editors (those are just examples, in
practice one might want to add more extensions and programs).

```fish
function fish_command_not_found
  set -l filename $argv[1]
  if test -f $filename
    set -l ext (string split -r -m1 '.' -- $filename)[-1]
    switch $ext
      case rs js ts go py md txt
        bat $filename
      case json
        cat $filename | jaq
      case pdf
        open $filename
      case mp4 mkv avi
        vlc $filename
      case jpg png gif
        feh $filename
      case '*'
        __fish_default_command_not_found_handler $argv
    end
  else
    __fish_default_command_not_found_handler $argv
  end
end
```

First, the file extension is extracted out of the filename, and then a different program is chosen depending on the
extension. This works because entering a filename (without a command preceding it) doesn't normally do anything in fish,
resulting in a "command not found" error. We catch this error and add behavior in case we find that we have passed a
valid file.

<Asciinema url={open} fallback="https://asciinema.org/a/zWXcN8MBre7X5g9n7YlumAu3k" cols={110} rows={11} loop={3} />

Unfortunately, I couldn't find an easy way to have arbitrary path autocompletion in first position (command position).
So the full name must be written by hand. Let me know if you find a way to enable completions for files without a
command!

## Abbreviations (for Commands, Arguments, Paths)

### Setting the Cursor Position

## Batch Moving Files (not with `fish`)

## Clearing the Screen (Keeping the Buffer)

## Copy and Paste

## Bonus: Navigation History
