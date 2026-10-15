// Additions in a release stay hidden together until their translations are complete.
// Explicit paths prevent an unrelated existing translation from being bypassed.
export const contentReleases = Object.freeze({
  website: {
    route: "/services/website/",
    paths: [
      "/serviceDetails/website",
      "/services/entryPoints/2",
      "/services/services/8",
      "/home/consultationSituations/6",
      "/contact/faqs/3",
      "/pricing/items/27",
      "/pricing/items/28",
      "/pricing/items/29",
      "/pricing/items/30",
      "/pricing/items/31",
      "/pricing/items/32",
    ],
  },
});

export function getContentNode(tree, pointer) {
  return pointer
    .slice(1)
    .split("/")
    .reduce(
      (node, key) =>
        node && typeof node === "object" && Object.hasOwn(node, key)
          ? node[key]
          : undefined,
      tree,
    );
}

export function getAvailableContentRouteLocales(
  route,
  locales,
  pendingContent = {},
) {
  const release = Object.values(contentReleases).find(
    (item) => item.route === route,
  );
  return release
    ? locales.filter(
        (locale) =>
          !release.paths.some((pointer) =>
            pendingContent[pointer]?.locales.includes(locale),
          ),
      )
    : [...locales];
}

export function isContentUnavailable(pointer, locale, pendingContent = {}) {
  if (pendingContent[pointer]?.locales.includes(locale)) return true;
  return Object.values(contentReleases).some(
    (release) =>
      release.paths.includes(pointer) &&
      release.paths.some((path) =>
        pendingContent[path]?.locales.includes(locale),
      ),
  );
}
