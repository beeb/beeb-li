<script lang="ts">
  import ClipboardIcon from "virtual:icons/lucide/clipboard-copy";
  import ClipboardSuccess from "virtual:icons/lucide/clipboard-check";
  import ClipboardError from "virtual:icons/lucide/clipboard-x";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props {
    content: string;
    class?: HTMLAttributes<HTMLButtonElement>["class"];
  }

  const { content = "", class: additionalClasses = undefined }: Props =
    $props();
  let clipboardIcon = $state<"default" | "success" | "error">("default");

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(
        () => {
          clipboardIcon = "success";
        },
        () => {
          clipboardIcon = "error";
        },
      );
    } else {
      clipboardIcon = "error";
    }
    setTimeout(() => {
      clipboardIcon = "default";
    }, 3000);
  };
</script>

<button
  class={["btn-link btn text-neutral-content", additionalClasses]}
  class:text-success!={clipboardIcon === "success"}
  class:text-error!={clipboardIcon === "error"}
  title="Copy to clipboard"
  aria-label="Copy to clipboard"
  onclick={() => copyToClipboard(content)}
>
  {#if clipboardIcon === "default"}
    <ClipboardIcon />
  {:else if clipboardIcon === "success"}
    <ClipboardSuccess />
  {:else}
    <ClipboardError />
  {/if}
</button>
