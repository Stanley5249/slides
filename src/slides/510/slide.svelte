<script lang="ts">
  import { Mermaid } from "$lib";

  const diagram = `flowchart TB
		subgraph Author
			Write[Write slides] --> Commit[Commit]
		end
		subgraph CI
			Commit --> Lint[Lint]
			Lint --> Check[Type check]
			Check --> Build[Build]
			Build --> Test{Tests pass?}
		end
		subgraph Release
			Test -->|yes| Deploy[Deploy]
			Test -->|no| Fix[Fix]
			Fix --> Commit
			Deploy --> Announce[Announce]
		end`;
</script>

<p class="text-6xl font-bold drop-shadow-sm">🧜 Big and Complex</p>

<Mermaid
  code={diagram}
  label="Open the pipeline diagram"
  class="mx-auto mt-16 w-5xl max-w-[80vw]"
/>

<p class="mt-8 text-3xl">Subgraphs and branches, still one click away.</p>
