<script lang="ts">
  import { siteTitle } from "$lib/config";
</script>

<svelte:head>
  <title>{siteTitle} - Contact</title>
</svelte:head>

<div class="prose sm:prose-lg max-w-none mb-4">
  <h1>Contact 👋</h1>
</div>
<div class="prose prose-lg max-w-none">
  <p>Want to get in touch? Great!</p>

  <p>
    Feel free to shoot me an email at <code>hi@[this_domain]</code> (replace with
    the domain name you see in the URL bar).
  </p>

  <p>Relevant social links:</p>

  <ul>
    <li>
      <a href="https://hachyderm.io/@beeb" rel="external">Mastodon</a> (preferred
      for interaction)
    </li>
    <li>
      <a href="https://github.com/beeb" rel="external">GitHub</a>
    </li>
    <li>
      <a href="https://codeberg.org/beeb" rel="external">Codeberg</a>
    </li>
    <li>
      <a href="https://www.linkedin.com/in/vbersier/" rel="external">LinkedIn</a
      >
    </li>
  </ul>

  <p>
    Accounts I may have on other social networks are seldom checked, don't
    expect a reply.
  </p>

  <p>
    My GPG key ID is <a
      href="https://keyserver.ubuntu.com/pks/lookup?search=0x4592122C5C6B53B1&fingerprint=on&op=index"
      rel="external"><code>0x4592122C5C6B53B1</code></a
    >
    (pubkey also available on <a href="https://github.com/beeb.gpg">GitHub</a>).
  </p>
</div>
