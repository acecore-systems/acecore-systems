---
title: "Practical Lessons from Rolling Out Cloudflare Vectorize Across Multiple Repositories"
description: "Lessons from introducing and testing Cloudflare Vectorize across multiple Astro and Cloudflare Pages sites, covering its division of responsibilities with Pagefind, corpus generation from published HTML, safe incremental synchronization, Preview and Production separation, API safeguards, and verification gates."
date: 2026-07-30T22:50
author: gui
tags: ["Technology", "Cloudflare", "Vectorize", "OpenAI", "Site Search"]
image: /uploads/acecore-generated/blog-cloudflare-pages-security.webp
callout:
  type: tip
  title: Keep search fail-soft, but synchronization and release fail-closed
  text: "For users, Pagefind remains available even when Vectorize fails. For index synchronization and production releases, the process stops unless it can verify the target environment, corpus, deletion rate, published commit, and completed mutations. This asymmetric design proved especially effective when rolling the architecture out across multiple sites."
processFigure:
  eyebrow: Vectorize rollout
  title: From published HTML to the Production index
  description: "Instead of inserting editable source directly, use the HTML that will actually be published and the deployed commit as the basis for synchronization."
  variant: inline
  steps:
    - title: Build the published HTML
      description: "Generate static HTML that reflects canonical URLs, locales, and noindex directives."
      icon: i-lucide-file-code-2
      accent: slate
    - title: Build the corpus deterministically
      description: "Split the body into chunks, then add IDs derived from content hashes and audit metadata."
      icon: i-lucide-boxes
      accent: brand
    - title: Synchronize in Preview
      description: "Upsert with a dedicated index and token, then verify the API, empty results, fallback behavior, and rate limit."
      icon: i-lucide-flask-conical
      accent: amber
    - title: Synchronize the published commit to Production
      description: "Compare the build marker with the corpus version, and enable the feature only after mutations have converged."
      icon: i-lucide-shield-check
      accent: emerald
compareTable:
  title: Search and synchronization need different failure policies
  before:
    label: Depend on Vectorize for everything
    items:
      - "If AI, Vectorize, or D1 stops, all site search becomes unavailable"
      - "Differences between CMS drafts and published pages appear directly in search results"
      - "A synchronization script misconfiguration can modify another environment or a large number of vectors"
      - "It is easy to treat the merge of the code as completion of the rollout"
  after:
    label: Fail-soft search and fail-closed synchronization
    items:
      - "Use Pagefind for ordinary search and make semantic search an auxiliary feature triggered by an explicit action"
      - "Build the corpus from published HTML so it reflects canonical URLs, noindex directives, and locales"
      - "Verify the environment allowlist, deletion rate, published commit, and mutation completion before and after synchronization"
      - "Record implementation, local verification, Preview, and Production operation as separate states"
statBar:
  items:
    - value: "4 repos"
      label: Compared rollout and investigation records
      description: "We compared Production, local verification, Preview, and preliminary investigation without treating them as equivalent states."
      icon: i-lucide-git-branch
    - value: "36 → 250"
      label: Initial Acecore Systems Production synchronization
      description: "We generated 250 vectors from 36 published Japanese pages and synchronized them with 0 deletions."
      icon: i-lucide-database
    - value: "72 → 134"
      label: World Foundation local verification
      description: "We generated 134 vectors from 72 sources, but recorded the work as pre-production."
      icon: i-lucide-test-tube-2
    - value: "37 tests"
      label: Verification of the search contract
      description: "World Foundation passed 37 contract tests for search, the corpus, and synchronization."
      icon: i-lucide-badge-check
checklist:
  title: Checks before rolling out to the next repository
  items:
    - text: "Keep the existing keyword search so the search path remains available when Vectorize is down"
      checked: true
    - text: "Compare the embedding model's actual output with the index dimensions and metric"
      checked: true
    - text: "Generate the corpus from published HTML and exclude noindex pages, external canonical pages, and administration screens"
      checked: true
    - text: "Use IDs derived from content hashes so unchanged chunks are not embedded again"
      checked: true
    - text: "Separate the Preview and Production indexes, bindings, tokens, and approval boundaries"
      checked: true
    - text: "Confirm completion of upserts before deleting, and require explicit approval for large deletions"
      checked: true
    - text: "Give the search API body, query, locale, origin, rate limit, and kill-switch safeguards"
      checked: true
    - text: "Synchronize to Production only from a deployment whose published commit matches the corpus version"
      checked: true
    - text: "Record implemented, locally verified, Preview verified, and running in Production as separate states"
      checked: true
linkCards:
  - href: https://developers.cloudflare.com/vectorize/
    title: Official Cloudflare Vectorize documentation
    description: "Check the current specifications for indexes, bindings, queries, and metadata filtering."
    icon: i-lucide-book-open
  - href: https://developers.cloudflare.com/vectorize/platform/limits/
    title: Current Vectorize limits
    description: "Limits for batches, topK, metadata, and vector counts can change, so verify them again during implementation."
    icon: i-lucide-gauge
  - href: /insights/astro-cloudflare-site-architecture/
    title: Overall architecture for an Astro and Cloudflare site
    description: "An overview of which layers should own static HTML, Pages Functions, D1, and search."
    icon: i-lucide-layers-3
faq:
  title: Frequently asked questions
  items:
    - question: Is Pagefind unnecessary after adding Vectorize?
      answer: "We kept it. Pagefind is the low-dependency ordinary search generated from static HTML, while Vectorize is an auxiliary search for paraphrases and related concepts. Ordinary search can remain available even when AI or Vectorize fails."
    - question: Are D1 and R2 required to adopt Vectorize?
      answer: "No. Acecore Systems uses D1 to rate-limit its search API, but it is not required storage for Vectorize itself. The source text can live in published HTML, JSON, D1, R2, or another location selected according to the requirements."
    - question: How should the current embedding model and dimensions be managed?
      answer: "The current Acecore Systems implementation uses OpenAI text-embedding-3-large at 1,536 dimensions with cosine. The legacy BGE-M3 1,024-dimension index remains for rollback, and vectors with different dimensions are never mixed in one index. Because index configuration cannot be changed after creation, check the current official specification and the actual output shape before creating an index."
    - question: At what point is the rollout considered complete?
      answer: "A merge or local test alone is not completion. We record the feature as running in Production only after verifying real Preview requests, agreement between the published commit and corpus, Production index synchronization, mutation convergence, Pagefind fallback, the rate limit, and the shutdown procedure."
---

Introducing and testing Cloudflare Vectorize across multiple repositories showed that simply “creating embeddings and calling `query()`” is not enough.

You must decide how to build the search corpus, how to preserve existing search, how to separate Preview from Production, how to prevent an incorrect synchronization from causing mass deletion, and whether the published pages really match the index. In real operations, the design around the Vectorize API call mattered more than the call itself.

This article brings together rollout and investigation results recorded for Acecore Systems, World Foundation, Acecore Schools, and Aceserver Portal, and reorganizes them into practices that can be reused on other Astro and Cloudflare Pages sites.

## Conclusion: keep search fail-soft, but synchronization and release fail-closed

The most reusable principle was to apply different failure policies to user-facing search and operator-facing synchronization.

| Area                  | Failure policy | Reason                                                                                                           |
| --------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------- |
| Ordinary site search  | fail-soft      | Continue searching with Pagefind even if Vectorize is unavailable                                                |
| Related-search API    | fail-soft      | Fail quickly without disrupting ordinary search results                                                          |
| Corpus generation     | fail-closed    | Do not generate a corpus if target pages, locale, counts, or metadata are invalid                                |
| Index synchronization | fail-closed    | Do not change anything unless the target environment, existing IDs, deletion rate, and mutations can be verified |
| Production enablement | fail-closed    | Enable only after Preview QA and agreement with the published commit                                             |

This simultaneously ensures that “site search remains available even when AI search is down” and that “a suspicious synchronization changes no records at all.”

## States verified across four repositories

When documenting a rollout, it is also important not to group every record under “implemented.” These records mixed Production operation, local verification, prepared Preview resources, and preliminary investigation.

| Repository       | Recorded and verified state                                                                                            | Lesson learned                                                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Acecore Systems  | Production confirmed on the legacy BGE-M3 index; the OpenAI 1,536-dimension index is prepared but not yet synchronized | Coexistence with Pagefind, a published-HTML corpus, D1 rate limiting, safe Production synchronization, and dimension migration |
| Aceserver Portal | Confirmed Production Vectorize search for Acecore information                                                          | Keep the search destination for corporate information separate from WIKI rule search                                           |
| World Foundation | Generated 134 vectors from 72 sources locally and passed 37 tests; not published                                       | Content hashes, fail-closed synchronization, and separation of pre-release gates                                               |
| Acecore Schools  | Existing architecture investigated; index creation and implementation not started                                      | Decide the API, corpus, permissions, and environment architecture before adding a binding                                      |

For Acecore Systems, we split the rollout into three stages: [implementation PR #40](https://github.com/acecore-systems/acecore-systems/pull/40), [Production preparation PR #41](https://github.com/acecore-systems/acecore-systems/pull/41), and [Production enablement PR #42](https://github.com/acecore-systems/acecore-systems/pull/42). The later [OpenAI direct-connection migration PR #43](https://github.com/acecore-systems/acecore-systems/pull/43) prepares a separately named 1,536-dimension index instead of mixing vectors with different dimensions.

During the initial Production synchronization to the legacy BGE-M3 index in this [GitHub Actions run](https://github.com/acecore-systems/acecore-systems/actions/runs/30539728752), the workflow compared the published commit with the corpus version and generated 250 vectors from 36 published Japanese pages. The result was 250 upserts and 0 deletions. Separating the code merge, index preparation, initial synchronization, and search enablement made the stop conditions for each stage explicit.

## Divide responsibilities instead of replacing Pagefind

The purpose of introducing Vectorize was not to discard the existing search.

Pagefind builds a static index from built HTML and searches it in the browser. It works well as ordinary search for explicit terms such as product names, service names, and proper nouns, and it does not depend on the state of an embedding provider or Vectorize.

Vectorize is useful when a search phrase does not exactly match the body text or when a user wants to find a page through a related concept. It does, however, require embedding generation and a Vectorize query, so external-service latency, errors, and usage must also be considered.

We therefore separated the UI behavior as well.

1. Show Pagefind suggestions while the user types
2. Call the API only when the user explicitly runs related search
3. Set a short timeout on the API
4. Do not remove Pagefind results if the API fails
5. Allow the kill switch to disable related search alone

With this architecture, Vectorize broadens the search experience without becoming a single point of failure for all search.

## Build the corpus from published HTML, not CMS drafts

One of the largest differences across sites was the choice of source of truth for search.

If CMS drafts or Markdown files are inserted directly into the corpus, they can diverge from the pages users actually see.

- `draft` or `noindex` content can be included
- Pages with an external canonical URL can remain in the corpus
- Repeated layout text and administration UI can be included
- Titles, descriptions, and URLs that appear only after transformation cannot be reflected
- Locale boundaries can become ambiguous on multilingual sites

We therefore read the HTML generated by the Astro build and applied the publication rules before building the corpus.

Acecore Systems includes only Japanese pages that meet all of the following conditions.

- Has a same-origin canonical URL
- Uses Japanese as its `lang`
- Is not marked `noindex`
- Is not `/admin`, `/api`, a 404 page, or a submission-complete page
- Can exclude non-body elements such as navigation and elements marked `data-vectorize-ignore`
- Has a published root-relative URL and title

We split the body into chunks targeting 850 characters, with a maximum of 1,200 characters and an overlap of 120 characters. These are operating values selected for the page lengths and Japanese body text in this project, not universal answers. For another site, adjust them after evaluating the actual document structure and search results.

## Make incremental synchronization deterministic with content hashes

If vector IDs are sequential numbers or runtime UUIDs, regenerating the same corpus gives every record a different ID. Unchanged content must then be embedded again, and the old IDs must be deleted in bulk.

Instead, we generate a SHA-256 value from the locale, published URL, chunk number, and body text, then derive both the ID and corpus version deterministically.

```js
const identity = [locale, url, String(chunkIndex), text].join("\u001f");
const digest = sha256(identity);

const vector = {
  id: `v1-${digest.slice(0, 48)}`,
  text,
  metadata: {
    locale,
    url,
    chunkIndex,
    contentHash: digest,
  },
};
```

During synchronization, compare the expected IDs with the IDs currently in the index.

- Embed and upsert IDs that exist only in the expected set
- Skip IDs found in both sets because they are unchanged
- Treat IDs found only in the index as deletion candidates
- Stop before any mutation if an ID not managed by the `v1-` namespace is present

This produces the same corpus from the same published content and makes the reason for each difference easier to explain.

## Fix the embedding model and index settings as a contract

The initial implementation record used the Workers AI model [`@cf/baai/bge-m3`](https://developers.cloudflare.com/workers-ai/models/bge-m3/) after checking its actual output shape and standardizing on 1,024 dimensions with cosine. The current Acecore Systems implementation uses [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings) `text-embedding-3-large` at 1,536 dimensions with cosine in a separately named target index. The legacy BGE-M3 index remains for rollback; vectors with different dimensions are never mixed in one index.

The important point is not the model name itself, but keeping the same contract in four places.

| Location               | Fixed values                      |
| ---------------------- | --------------------------------- |
| Corpus metadata        | model, dimensions, metric         |
| Vectorize index        | dimensions, metric                |
| Search API             | model, embedding length           |
| Synchronization script | allowed model, dimensions, metric |

As described in Cloudflare's [Create indexes](https://developers.cloudflare.com/vectorize/best-practices/create-indexes/) guidance, an index's dimensions and metric cannot be changed after creation. If the model documentation is ambiguous, do not create the index from an assumption; check both the current documentation and the actual output.

When using metadata filtering, create the metadata index before inserting vectors. Vectors inserted earlier do not become eligible merely because a metadata index is added later; they must be upserted again.

Product limits also change. As of July 30, 2026, Vectorize V2 has an upsert batch limit of 1,000 for the Workers API and 5,000 for the HTTP API. The ordinary `topK` limit is 100, or 50 when using `returnValues: true` or `returnMetadata: "all"`. Always recheck the [current limits](https://developers.cloudflare.com/vectorize/platform/limits/) and [client API](https://developers.cloudflare.com/vectorize/reference/client-api/) during implementation.

Acecore Systems synchronizes through the HTTP API in batches of 200 and searches with `topK: 15`; it does not use the product maximum as its processing batch size. Decide product limits separately from the batch size that your operation can safely retry and monitor.

## Upsert, wait for convergence, and only then delete

Vectorize insert, upsert, and delete operations are asynchronous. A successful API response does not mean that the change is already reflected in queries.

We use the following order for safe synchronization.

1. Validate the corpus and index settings
2. Retrieve all current vector IDs with pagination
3. Calculate upsert targets and deletion candidates
4. Run upserts in batches
5. Wait until each returned `mutationId` reaches `processedUpToMutation`
6. Delete only after the upserts have converged
7. Confirm convergence of the deletion mutations in the same way

Cloudflare's [Vectorize API](https://developers.cloudflare.com/vectorize/reference/client-api/) documentation also states that mutations are asynchronous. Instead of relying on a fixed-duration sleep, use the mutation ID to verify completion.

We also added the following stop conditions to the synchronization script.

- The destination index name is outside the Preview or Production allowlist
- The script attempts to create the Production index automatically
- The value of `--confirm-production` does not match the destination index name
- The dimensions or metric differs from the contract
- The corpus has an invalid locale, URL, metadata, or content hash
- The source-page or vector count exceeds the expected limit
- An unmanaged ID exists in the current index
- The deletion would exceed 20% of the current vectors
- The retry limit or mutation wait time is exceeded

Only an intentional large deletion can be overridden explicitly in a manual run. Ordinary push and schedule runs do not allow it.

## Separate Preview and Production by permissions, not only by name

Changing only the index name in a binding was not enough to separate environments.

The following elements need to be separated.

- Vectorize index
- Supporting resources such as D1
- Wrangler environment
- API token
- GitHub Environment
- Synchronization-workflow concurrency
- Repository variable used for enablement
- Kill switch

We restrict synchronization tokens to Vectorize Read / Write for the target Cloudflare account and keep them separate from the OpenAI API key. Production runs only from protected `main` and passes through a GitHub Environment reviewer.

This introduces an operational trade-off. If a Production Environment has a required reviewer, scheduled synchronization may also wait for approval. Before adding cron, decide whether only the initial release requires approval, every scheduled synchronization requires it, or scheduled work should be split into another job.

## Synchronize to Production only the corpus for the currently published commit

GitHub's `main` and the commit currently published on Cloudflare Pages are not always the same. Immediately after a push, the build may still be running, or deployment may have failed and left the previous commit online.

For Production synchronization, we therefore place a build marker on the published site and verify all of the following.

- The marker commit is a 40-character Git SHA
- That commit exists in the repository
- It is an ancestor of protected `main`
- Checking out that commit can regenerate the corpus
- The marker's corpus version matches the regenerated result
- The same commit is still published immediately before mutation

Completion means a Cloudflare Pages deployment connected to the GitHub repository. We do not use artifacts temporarily published locally or through Direct Upload as the basis for Production synchronization.

This prevents mismatches such as synchronizing a new corpus to an old site or publishing search results for content from a commit whose deployment failed.

## Put cost and privacy boundaries around the public search API

The search API is a public endpoint that sends user input to an embedding provider. Its design must cover abuse, billing, logs, and returned URLs as well as search quality.

Acecore Systems implements the following boundaries.

| Area              | Example implementation                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------ |
| Method and format | Accept only same-origin JSON POST requests                                                 |
| Body              | Up to 2KiB; stop while reading the stream even without `Content-Length`                    |
| Query             | 2 to 160 characters after NFKC normalization                                               |
| Locale            | `ja` only                                                                                  |
| Rate limit        | D1 fixed windows of 20 requests per minute per client and 300 requests per minute globally |
| Shutdown          | Disable related search alone with `SEARCH_ENABLED`                                         |
| Query handling    | Do not store the raw query in logs, the corpus, or Vectorize metadata                      |
| Result URL        | Allow only published same-origin root-relative URLs                                        |
| Errors            | Return a structured code for each stage without writing the body to logs                   |

A client-side UUID is not a strong billing boundary because the user can change it. Combine a client key derived from Cloudflare connection information, a global limit, and usage monitoring. Depending on scale and threat model, also consider Turnstile, WAF, or Durable Objects.

This architecture uses D1 for rate limiting, but D1 is not a requirement for adopting Vectorize. The same applies to R2. Choose them according to where the source text comes from and where rate-limit state should live.

## Do not mix the responsibilities of search destinations

In Aceserver Portal, we separated the destinations for Acecore service information and Minecraft server rules and procedures.

- Search Vectorize for questions about Acecore
- Search the official WIKI for server rules
- If Vectorize fails, do not fall back to an unrelated WIKI answer
- Link only the WIKI article selected as evidence
- Do not infer a rule that cannot be verified in the WIKI

This also matters in RAG and guidance chat. As the number of searchable sources grows, decide first which questions go to which source and what the system must not answer when no information is found.

## Failures we encountered and what we changed

The records from multiple repos reveal several recurring problems.

| Symptom                                                     | Cause                                                              | What to do next                                                                               |
| ----------------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| A binding was added, but there is no working search feature | The API, corpus, reindexing, permissions, and UI were not designed | Define the search contract and operating flow before creating an index                        |
| Dimensions were guessed when creating an index              | The model name was used without checking actual output             | Inspect the actual embedding length before creation                                           |
| Existing vectors do not appear with a metadata filter       | They were inserted before the metadata index existed               | Create the metadata index first, then upsert the existing vectors again                       |
| Queries are unstable immediately after synchronization      | Mutations are asynchronous                                         | Wait for convergence with `mutationId` and index info                                         |
| Synchronization causes mass re-embedding and deletion       | Vector IDs change on every run                                     | Use deterministic IDs derived from content hashes                                             |
| A scheduled run remains in waiting                          | The Production Environment requires approval                       | Design scheduled synchronization and approval policy together                                 |
| Tests or Git fail on Windows                                | Environmental causes such as `spawn EPERM`, locks, or caches       | Compare with a baseline, pin the Node version, and isolate with a fresh `npm ci`              |
| An API timeout is treated as a code defect                  | A transient failure, wrong payload, or provider latency            | Retest with the correct contract and distinguish a one-off result from a reproducible failure |

It is also important not to misattribute a dependency or execution-environment problem to a Vectorize change. Check whether the same error occurs on the baseline before the change, and separate code defects from environment failures.

## Record “implemented” in four stages

Reports and articles become less ambiguous when they distinguish these states.

| State                 | Example completion criteria                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------ |
| Implemented           | The API, corpus, synchronization script, and UI exist on a branch                                            |
| Locally verified      | The build, type check, contract tests, and dry-run pass                                                      |
| Preview verified      | Preview resources are synchronized, and real requests and fallback behavior are verified                     |
| Running in Production | The published commit is synchronized, and mutation convergence, the API, and shutdown procedure are verified |

World Foundation passed local verification, but its index, secret, deployment, and browser QA remained incomplete, so we did not record it as running in Production. Acecore Schools remains at the investigation stage.

Acecore Systems, in contrast, was verified through staged PRs, the initial Production synchronization, Production enablement, the published marker, and the live search API.

Recording what remains unverified, rather than only the number of successful tests, provides the most useful operational information for the next maintainer.

## Minimum architecture for another rollout

For another Astro and Cloudflare Pages site, the minimum architecture looks like this.

```txt
Astro build
  -> published HTML
  -> Pagefind index
  -> Vectorize corpus (reflecting locale / canonical / noindex)

Cloudflare Pages Function
  -> input validation
  -> OpenAI Embeddings API
  -> Vectorize query
  -> return only published URLs

GitHub Actions
  -> resolve the published commit
  -> regenerate the corpus
  -> separate Preview / Production
  -> delete after upsert convergence
  -> record the corpus version
```

There is no need to add LLM answer generation from the beginning. First build a search feature that safely returns related pages and can be evaluated. If answer generation is added later, define the retrieved source text, citable URLs, and conditions under which the system must not answer as a separate contract.

## Summary

The hard part of adopting Cloudflare Vectorize is not the nearest-neighbor query itself.

The quality of a rollout across multiple repos depends on the operating design: what is indexed as public information, how unchanged chunks are identified, how incorrect synchronization is stopped, how the corpus is matched with the published commit, and how ordinary search remains available during an outage.

Our conclusions are straightforward.

- Keep Pagefind as the primary search
- Use Vectorize as an auxiliary semantic search
- Build the corpus from published HTML
- Derive IDs and versions deterministically from content hashes
- Separate Preview and Production resources and permissions
- Keep search fail-soft, but synchronization and release fail-closed
- Record implementation, verification, Preview, and Production as separate states

Establishing these boundaries first makes it easier to operate Vectorize as a continuously updated search foundation rather than a one-off AI feature.
