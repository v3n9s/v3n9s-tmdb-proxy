import { ZodError, z } from "zod";

const configSchema = z
  .object({
    PORT: z.coerce.number(),
    HOST: z.string(),
    API_HOST: z.string(),
    IMAGES_HOST: z.string(),
    API_TOKEN: z.string(),
  })
  .readonly();

let config: z.infer<typeof configSchema>;
try {
  config = configSchema.parse(process.env);
} catch (e) {
  if (e instanceof ZodError) {
    console.error("wrong config, please specify required env vars");
    console.error(e.issues);
    process.exit(1);
  } else {
    throw e;
  }
}

export { config };
