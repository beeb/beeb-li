---
title: Fish Shell Tips & Tricks
date: 2026-01-04T21:34:00Z
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
  A collection of tips and tricks for the fish shell I wish I had known about a long time ago.
---

<script lang="ts">
  import Asciinema from "$lib/components/Asciinema.svelte"
  import ChatNote from '$lib/components/ChatNote.svelte'
  import Kbd from "$lib/components/Kbd.svelte"
  import editBuffer from './fish-shell-tips-and-tricks/edit-buffer.cast?url'
  import lastCommand from './fish-shell-tips-and-tricks/last-command.cast?url'
  import sudo from './fish-shell-tips-and-tricks/sudo.cast?url'
  import open from './fish-shell-tips-and-tricks/open.cast?url'
  import abbr from './fish-shell-tips-and-tricks/abbr.cast?url'
</script>

## Contents

## Introduction

I recently watched a [video by Dreams of Code](https://www.youtube.com/watch?v=3fVAtaGhUyU), which presents nice tips
and tricks that can be used in the popular [`zsh` shell](https://www.zsh.org/). Since I use
[`fish`](https://fishshell.com/) instead, I figured it would be a good opportunity to transfer some of those tips over,
learn a bit myself, and hopefully help you as well.

This article will not describe the `zsh` tips (or only briefly); instead, I invite you to watch the video linked above.
They have all been transposed to `fish` in the sections below (and some more).

## Editing the Command Buffer

Similar to `zsh`'s `edit-command-buffer` widget (which must be bound manually), `fish` allows one to edit the command
buffer in your configured `$VISUAL` or `$EDITOR` tool with the default keybinding <Kbd seq="alt-e" />.

In the cast below, the buffer opens in [helix](https://helix-editor.com/), my modal editor of choice!

<Asciinema url={editBuffer} fallback="https://asciinema.org/a/m7mrUL9LmRoz2AymjVN1DY4LB" cols={110} rows={11} loop={3} />

## Undo and Redo Command Edits

When modifying the command buffer inline with shortcuts such as <Kbd seq="alt-backspace" /> (deleting a whole argument),
it's sometimes convenient to be able to undo the last modification.

`fish` has a default key assignment for this: <Kbd seq="ctrl-z" />. You could have guessed that, right?

The `redo` command is bound to <Kbd seq="ctrl-r" /> by default, but since I use that to open
[`atuin`](https://atuin.sh/) (a really awesome tool, if you don't know!), I changed the binding:

```fish
bind ctrl-shift-Z redo
```

## `!!` for Last Command

In `bash`, there's a convenient alias `!!` to reference the content of the previous command that was run. The same is
available in `zsh`, but there is no equivalent (by default) in `fish`. However, it's trivial to implement it with a
custom function and associated [abbreviation](https://fishshell.com/docs/current/cmds/abbr.html):

```fish
function last_history_item
  echo $history[1]
end
abbr -a !! --position anywhere --function last_history_item
```

<Asciinema url={lastCommand} fallback="https://asciinema.org/a/j124k6CJMKcUp5unlIkx2g5cc" cols={110} rows={11} loop={3} />
&nbsp;

<ChatNote>
The huge advantage of abbreviations is that they automatically expand when you hit the "space" or "enter" key, so they
are not "blind" and allow you to inspect the command before committing.
We'll go into more details about the <code>abbr</code> command in a later section of this article.
</ChatNote>

## Prepend `sudo`

In the video by Dreams of Code, an annoyance mentioned is having to retype a command that was run without `sudo` but
required it. The proposed solution is to type `sudo !!` to invoke the last command with `sudo`.

In `fish`, however, there's a better way! The built-in shortcut <Kbd seq="alt-s" /> prepends the current command with
`sudo`, `doas`, `please`, or `run0`, as available. This can even be combined with the previous tip by typing `!!`
followed by <Kbd seq="alt-s" /> to re-run the last command. Alternatively, bringing up the last history item with the up
arrow before hitting the shortcut also works.

<Asciinema url={sudo} fallback="https://asciinema.org/a/m7REJTArn2v2DHIFGZrUerLzq" cols={110} rows={11} loop={3} />

## Run Hook on Directory Navigation

`zsh` has `chpwd()`, a hook that runs some code any time the current directory is changed. A very similar thing can be
done in `fish` with the following syntax:

```fish
function my_chpwd --on-variable PWD
  echo "Changed to $PWD"
end
```

The function runs any time the special `$PWD` environment variable changes. In general however, I prefer to rely on
[`direnv`](https://direnv.net/) for that purpose. That way, the commands to run are defined in a `.envrc` file which can
be different for each directory.

## Open Files Based on Extension

Another neat trick shown in the video is the ability to enter a filename (without a command before), and `zsh` applies
some replacement template based on the file extension, allowing one to open the file with the desired binary
automatically. The feature in question is called "suffix aliases".

The best way to go about this is to create a function invoked when the entered command cannot be resolved. That's what
the special `fish_command_not_found` function does. Here, I chose to view text files with
[`bat`](https://github.com/sharkdp/bat) and open other files with different editors (those are just examples; in
practice, you might want to add more extensions and programs).

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

First, the file extension is extracted from the filename, and then a different program is chosen depending on the
extension. This works because entering a filename (without a command preceding it) doesn't normally do anything in fish,
resulting in a "command not found" error. We catch this error and add behavior in case we find that we have passed a
valid file.

<Asciinema url={open} fallback="https://asciinema.org/a/zWXcN8MBre7X5g9n7YlumAu3k" cols={110} rows={11} loop={3} />

Unfortunately, I couldn't find an easy way to have arbitrary path autocompletion in first position (command position).
So the full name must be written by hand. Let me know if you find a way to enable completions for files without a
command!

## Abbreviations (for Commands, Arguments, Paths)

[Abbreviations](https://fishshell.com/docs/current/cmds/abbr.html) are one of the best features in `fish`. Unlike
aliases, they expand to show their content, enabling customization of the command, adding parameters and so on.

Aliases can be forced to resolve only when they are in command position (first word, which is the default) or anywhere
in the line as we'll see below.

This enables some cool features inspired by the aforementioned video.

### Pipe Suffixes

Since abbreviations can be usable anywhere in a command with `--position anywhere`, they can be used to add suffixes to
commands to pipe their standard output or errors to `/dev/null`.

```fish
abbr -a NE --position anywhere -- "2>/dev/null"
abbr -a DN --position anywhere -- "> /dev/null"
abbr -a NUL --position anywhere -- ">/dev/null 2>&1"
```

### Long Commands

Of course, long commands can be shortened nicely:

```fish
abbr -a gco -- "git checkout"
abbr -a gaa -- "git add --all"
abbr -a gba -- "git branch -a"
```

### Frequently Used Directories

It can also be useful for bookmarks:

```fish
abbr -a ~pr -- "cd ~/my-projects/best-project"
```

However, much like Dreams of Code, I prefer to use [`zoxide`](https://github.com/ajeetdsouza/zoxide) to navigate
directories, so much so that I have it aliased to `cd`.

### Setting the Cursor Position

Even more powerful, it's possible to indicate where the cursor should be positioned after expansion:

```fish
abbr -a gcam --set-cursor -- 'git add --all && git commit -am "%"'
```

The `%` symbol is the default marker for the cursor position (which is used if we don't specify another marker with
`--set-cursor=MARKER`).

<Asciinema url={abbr} fallback="https://asciinema.org/a/Z3KMXVNhcfh3nNgYztnMlpshs" cols={110} rows={11} loop={3} />

## Clearing the Screen (Keeping the Buffer)

Sometimes it's useful to clear the screen while keeping whatever was already written in the command prompt. The default
binding for this is <Kbd seq="ctrl-l" />. In `zsh`, it seems this requires some widget scripting.

## Copy and Paste

There are many options to copy and paste parts of the command buffer to the system clipboard or `fish`'s pasteboard,
which is ominously called [the Kill Ring](https://fishshell.com/docs/current/interactive.html#killring).

The one I use the most is copying the whole content of the buffer into the system clipboard, which is easy enough with
the <Kbd seq="ctrl-x" /> shortcut. To paste, a simple <Kbd seq="ctrl-v" /> does the trick.

<Kbd seq="ctrl-k" /> puts everything from the cursor position until the end of the line into the Kill Ring, which can
then be pasted with <Kbd seq="ctrl-y" /> (the key stands for "yank", apparently a heritage of the Emacs edition mode).
Since the pasteboard is a ring, we can put multiple things in there and then rotate between them in reverse order,
<strong>after pasting</strong>, with <Kbd seq="alt-y" /> (yank-pop).

## Bonus: Directory History

As a bonus, I just found out about the directory history, which enables navigation to previously visited folders with
the <Kbd seq="alt-←" /> shortcut (when the command line is empty).

Similarly, one can go forward in the history with <Kbd seq="alt-→" />. A game-changer when switching between two
projects frequently!

## Conclusion

I hope you found something useful in this article. Thanks to [Dreams of Code](https://www.youtube.com/@dreamsofcode) for
inspiring this article. Until next time!
