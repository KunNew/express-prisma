import { RequestHandler } from "express";
import { ZodObject, ZodRawShape, z } from "zod";

export const validate = <T extends ZodRawShape>(
  schema: ZodObject<T>
): RequestHandler => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (result.success) {
      req.body = result.data;
      next();
    } else {
      const errors = result.error.flatten().fieldErrors;

      res.status(422).json({ errors });
    }
  };
};

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
  username: z
    .string()
    .min(4, { message: "Please add a name with at least 4 characters" }),
});

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
  code: z.optional(z.string()),
});


export const NewPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters long"),
  token: z.string().nullable().optional(),
})
