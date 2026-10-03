<script lang="ts">
  import BookOpen from "lucide-svelte/icons/book-open";
  import { Link } from "$lib";
</script>

<h2>Mark a word by what it does</h2>

<div class="row">
  <p>
    Bold marks the one word the speaker stresses, such as <strong>never</strong> in
    a warning.
  </p>
  <p>Italics mark a <em>term</em> or a title.</p>
  <p>Code such as <code>show(step)</code> uses a monospace font.</p>
  <p>
    A link stays inside the sentence, like the
    <Link
      href="https://github.com/Stanley5249/slides/blob/main/docs/design.md"
      icon={BookOpen}
    >
      design notes
    </Link>, and its icon marks it.
  </p>
</div>
