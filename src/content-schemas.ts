import { z } from "astro/zod";

const BLOG_TIMEZONE_OFFSET = "+09:00";
const LOCAL_DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/;
const CONTENT_DATETIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2})?$/;

function parseContentDate(value: string): Date {
  const raw = value.trim();
  const normalized = LOCAL_DATETIME_PATTERN.test(raw)
    ? `${raw}${BLOG_TIMEZONE_OFFSET}`
    : raw;
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date value in content frontmatter: ${raw}`);
  }

  return date;
}

const contentDate = z
  .string()
  .refine((value) => CONTENT_DATETIME_PATTERN.test(value.trim()), {
    message:
      "Content date must include time as YYYY-MM-DDTHH:mm, optionally with timezone",
  })
  .transform(parseContentDate);

const localizedAuthorSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

export const insightSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    date: contentDate,
    lastUpdated: contentDate.optional(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    uploadedImage: z.string().optional(),
    author: z.string(),
    callout: z
      .object({
        type: z.enum(["info", "warning", "tip", "note"]).default("info"),
        title: z.string().optional(),
        text: z.string(),
      })
      .optional(),
    faq: z
      .object({
        title: z.string().optional(),
        items: z.array(z.object({ question: z.string(), answer: z.string() })),
      })
      .optional(),
    linkCards: z
      .array(
        z.object({
          href: z.string(),
          title: z.string(),
          description: z.string().optional(),
          icon: z.string().optional(),
        }),
      )
      .optional(),
    processFigure: z
      .object({
        eyebrow: z.string().optional(),
        title: z.string(),
        description: z.string().optional(),
        variant: z.enum(["card", "inline"]).optional(),
        steps: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
            icon: z.string(),
            accent: z.enum(["brand", "emerald", "amber", "slate"]).optional(),
          }),
        ),
      })
      .optional(),
    compareTable: z
      .object({
        title: z.string().optional(),
        before: z.object({
          label: z.string(),
          items: z.array(z.string()),
        }),
        after: z.object({
          label: z.string(),
          items: z.array(z.string()),
        }),
      })
      .optional(),
    checklist: z
      .object({
        title: z.string().optional(),
        items: z.array(
          z.object({ text: z.string(), checked: z.boolean().optional() }),
        ),
      })
      .optional(),
    insightGrid: z
      .object({
        eyebrow: z.string().optional(),
        title: z.string(),
        description: z.string().optional(),
        variant: z.enum(["card", "inline"]).optional(),
        items: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
            icon: z.string(),
            tone: z.enum(["brand", "emerald", "amber", "slate"]).optional(),
          }),
        ),
      })
      .optional(),
    statBar: z
      .object({
        items: z.array(
          z.object({
            value: z.string(),
            label: z.string(),
            description: z.string().optional(),
            icon: z.string().optional(),
          }),
        ),
      })
      .optional(),
  })
  .passthrough();

export const authorSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().optional(),
    avatarImage: z.string().optional(),
    bio: z.string().optional(),
    url: z.string().optional(),
    github: z.string().optional(),
    twitter: z.string().optional(),
    skills: z.array(z.string()).optional(),
    i18n: z.record(z.string(), localizedAuthorSchema).optional(),
  })
  .passthrough();
