export const CMS_REPOSITORY = {
  owner: "acecore-systems",
  name: "acecore-systems",
  branch: "main",
} as const;

const CONTENT_RULES: readonly {
  prefix: string;
  extension: string;
  recursive: boolean;
}[] = [];

const CONTENT_FILES = new Set([
  "src/data/site.json",
  "src/data/home.json",
  "src/data/services.json",
  "src/data/pricing.json",
  "src/data/guide.json",
  "src/data/works.json",
  "src/data/contact.json",
  "src/data/privacy.json",
  "src/data/service-details/site-functions.json",
  "src/data/service-details/site-quality.json",
  "src/data/service-details/operations.json",
  "src/data/work-details/acecore-site-platform.json",
]);

const MEDIA_PREFIX = "public/uploads/";
const MAX_CMS_PATH_LENGTH = 240;
const MEDIA_EXTENSIONS = new Set([
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".webp",
]);

export function normalizeCmsPath(path: string | null) {
  if (path === null || /[\u0000-\u001f\u007f]/.test(path)) return null;

  const normalized = path.replace(/\\/g, "/").replace(/^\/+/, "");

  if (normalized === "") return "";
  if (normalized.length > MAX_CMS_PATH_LENGTH) return null;

  const segments = normalized.split("/");

  if (
    segments.some((segment) => !segment || segment === "." || segment === "..")
  ) {
    return null;
  }

  return segments.join("/");
}

export function isAllowedCmsWritePath(path: string) {
  if (normalizeCmsPath(path) !== path) return false;

  if (CONTENT_FILES.has(path)) return true;

  if (
    CONTENT_RULES.some(({ prefix, extension, recursive }) => {
      if (!path.startsWith(prefix) || !path.endsWith(extension)) return false;

      const relativePath = path.slice(prefix.length);

      return (
        relativePath.length > 0 && (recursive || !relativePath.includes("/"))
      );
    })
  ) {
    return true;
  }

  return isAllowedCmsMediaPath(path);
}

export function isAllowedCmsDeletePath(path: string) {
  return normalizeCmsPath(path) === path && isAllowedCmsMediaPath(path);
}

export function isAllowedCmsDirectoryPath(path: string) {
  if (normalizeCmsPath(path) !== path) return false;
  if (path === "") return true;

  if (isDirectoryAllowedByRoot(path, MEDIA_PREFIX.slice(0, -1), true)) {
    return true;
  }

  if (
    CONTENT_RULES.some(({ prefix, recursive }) => {
      return isDirectoryAllowedByRoot(path, prefix.slice(0, -1), recursive);
    })
  ) {
    return true;
  }

  return Array.from(CONTENT_FILES, (filePath) =>
    getDirectoryName(filePath),
  ).some((root) => isDirectoryAllowedByRoot(path, root, false));
}

export function sanitizeCmsBranchPart(path: string) {
  const base = path
    .replace(/\.[^.]+$/, "")
    .replace(/[^A-Za-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return base || "content";
}

export function encodePathSegments(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function getDirectoryName(path: string) {
  return path.split("/").slice(0, -1).join("/");
}

function isDirectoryAllowedByRoot(
  path: string,
  root: string,
  recursive: boolean,
) {
  return (
    path === root ||
    root.startsWith(`${path}/`) ||
    (recursive && path.startsWith(`${root}/`))
  );
}

function getExtension(path: string) {
  const fileName = path.split("/").pop() || "";
  const dot = fileName.lastIndexOf(".");

  return dot === -1 ? "" : fileName.slice(dot).toLowerCase();
}

function isAllowedCmsMediaPath(path: string) {
  return (
    path.startsWith(MEDIA_PREFIX) && MEDIA_EXTENSIONS.has(getExtension(path))
  );
}
