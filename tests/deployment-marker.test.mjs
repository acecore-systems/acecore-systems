import assert from "node:assert/strict";
import test from "node:test";

import {
  assertDeployedBuild,
  parseBuildMarker,
  parseBuildMetadata,
  readDeployedBuild,
  waitForDeployment,
} from "../scripts/wait-for-deployment.mjs";

const MARKER_URL = "https://systems.acecore.net/.well-known/acecore-build.json";
const COMMIT = "a".repeat(40);
const CORPUS_VERSION = "b".repeat(20);
const quietLogger = { log() {} };

function markerResponse({
  commit = COMMIT,
  searchCorpusVersion = CORPUS_VERSION,
  status = 200,
} = {}) {
  return new Response(JSON.stringify({ commit, searchCorpusVersion }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

test("validates both the full deployment SHA and corpus version", () => {
  const marker = JSON.stringify({
    commit: COMMIT.toUpperCase(),
    searchCorpusVersion: CORPUS_VERSION.toUpperCase(),
  });

  assert.deepEqual(parseBuildMetadata(marker), {
    commit: COMMIT,
    searchCorpusVersion: CORPUS_VERSION,
  });
  assert.equal(parseBuildMarker(marker), COMMIT);
  assert.throws(
    () => parseBuildMetadata(JSON.stringify({ commit: COMMIT })),
    /search corpus version/u,
  );
  assert.throws(
    () =>
      parseBuildMetadata(
        JSON.stringify({
          commit: "short",
          searchCorpusVersion: CORPUS_VERSION,
        }),
      ),
    /40-character SHA/u,
  );
});

test("requires HTTPS and a successful marker response", async () => {
  await assert.rejects(
    readDeployedBuild(
      "http://systems.acecore.net/.well-known/acecore-build.json",
      { fetchImpl: async () => markerResponse() },
    ),
    /must use HTTPS/u,
  );
  await assert.rejects(
    readDeployedBuild(MARKER_URL, {
      fetchImpl: async () => markerResponse({ status: 503 }),
    }),
    /HTTP 503/u,
  );
});

test("allows production sync only when commit and corpus version still match", async () => {
  const fetchImpl = async () => markerResponse();

  await assert.doesNotReject(
    assertDeployedBuild(MARKER_URL, COMMIT, CORPUS_VERSION, {
      fetchImpl,
      logger: quietLogger,
    }),
  );
  await assert.rejects(
    assertDeployedBuild(MARKER_URL, COMMIT, "c".repeat(20), {
      fetchImpl,
      logger: quietLogger,
    }),
    /search corpus differs/u,
  );
});

test("deployment polling has a bounded timeout", async () => {
  let now = 0;
  let requests = 0;

  await assert.rejects(
    waitForDeployment(MARKER_URL, COMMIT, {
      timeoutMs: 25,
      pollMs: 1,
      fetchImpl: async () => {
        requests += 1;
        return markerResponse({ commit: "d".repeat(40) });
      },
      sleepImpl: async () => {},
      nowImpl: () => {
        now += 10;
        return now;
      },
      logger: quietLogger,
    }),
    /Timed out waiting/u,
  );
  assert.equal(requests, 2);
});
