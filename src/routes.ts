import { z } from "zod";
import { config } from "./config.js";
import type { IncomingMessage } from "http";

const createUrl = (host: string, url: string): URL => {
  return new URL(url, "http://" + host);
};

type Validator = {
  matcher: (arg: { method: string; pathname: string }) => boolean;
  handler: (arg: {
    req: IncomingMessage;
    pathname: string;
    searchParamsObject: { [k: string]: string };
  }) => URL | undefined;
};

export const routes: Validator[] = [
  {
    matcher: ({ method, pathname }) => {
      return method === "GET" && pathname === "/api/3/discover/movie";
    },
    handler: ({ req, searchParamsObject }) => {
      const searchParamsSchema = z
        .object({
          language: z.string().optional(),
          page: z.coerce.number().int().optional(),
          primary_release_year: z.coerce.number().int().optional(),
          sort_by: z.string().optional(),
          "vote_average.gte": z.coerce.number().optional(),
          "vote_average.lte": z.coerce.number().optional(),
          with_genres: z.string().optional(),
        })
        .strict();

      if (searchParamsSchema.safeParse(searchParamsObject).success) {
        return createUrl(config.API_HOST, (req.url as string).slice(4));
      }
    },
  },
  {
    matcher: ({ method, pathname }) => {
      return method === "GET" && pathname === "/api/3/genre/movie/list";
    },
    handler: ({ req, searchParamsObject }) => {
      const searchParamsSchema = z
        .object({
          language: z.string().optional(),
        })
        .strict();

      if (searchParamsSchema.safeParse(searchParamsObject).success) {
        return createUrl(config.API_HOST, (req.url as string).slice(4));
      }
    },
  },
  (() => {
    const staticPathPart = "/api/3/movie/";
    return {
      matcher: ({ method, pathname }) => {
        return method === "GET" && pathname.startsWith(staticPathPart);
      },
      handler: ({ req, pathname, searchParamsObject }) => {
        const pathSchema = z.coerce.number();
        const pathArg = pathname.slice(staticPathPart.length);
        const searchParamsSchema = z
          .object({
            append_to_response: z.string().optional(),
            language: z.string().optional(),
          })
          .strict();

        if (
          pathSchema.safeParse(pathArg).success &&
          searchParamsSchema.safeParse(searchParamsObject).success
        ) {
          return createUrl(config.API_HOST, (req.url as string).slice(4));
        }
      },
    };
  })(),
  (() => {
    const staticPathPart = "/image/t/p/";
    const pathSchema = z.tuple([
      z.string(),
      z.string().regex(new RegExp("\\.(jpg|png|svg)$")),
    ]);
    return {
      matcher: ({ method, pathname }) => {
        return method === "GET" && pathname.startsWith(staticPathPart);
      },
      handler: ({ req, pathname }) => {
        if (
          pathSchema.safeParse(pathname.slice(staticPathPart.length).split("/"))
            .success
        ) {
          return createUrl(config.IMAGES_HOST, (req.url as string).slice(6));
        }
      },
    };
  })(),
];
