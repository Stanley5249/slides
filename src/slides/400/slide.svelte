<script lang="ts">
  import BookOpen from "lucide-svelte/icons/book-open";
  import { Link } from "$lib";
</script>

<h2>Mark a word by what it does</h2>

<div class="row">
  <p>
    Bold is the word the speaker leans on: the room <strong>cannot</strong> read and
    listen at once.
  </p>
  <p>Italics shift the voice, for a <em>term</em> or a title.</p>
  <p>An identifier such as <code>show(step)</code> keeps a face of its own.</p>
  <p>
    A link sits in the sentence, like the
    <Link
      href="https://github.com/Stanley5249/slides/blob/main/docs/design.md"
      icon={BookOpen}
    >
      design notes
    </Link>, and its icon marks it.
  </p>
</div>
