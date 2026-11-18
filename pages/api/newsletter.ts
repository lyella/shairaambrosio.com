import type { NextApiRequest, NextApiResponse } from "next";
import * as yup from "yup";

import { EMAIL_REGEX } from "utils/consts";
import { fetcher } from "utils/fetcher";
import { rateLimit } from "lib/rateLimit";

const emailSchema = yup.string().required().matches(EMAIL_REGEX);

export const subscribeToNewsletter = async (email: string) => {
  await fetcher(`https://api.mailerlite.com/api/v2/groups/${process.env.MAILER_LITE_GROUP_ID as string}/subscribers`, {
    method: "POST",
    headers: { "X-MailerLite-ApiKey": process.env.MAILER_LITE_API_KEY as string },
    body: { email },
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!(await rateLimit(req, res, 3, 60 * 60 * 1000, "newsletter"))) {
    return res.status(429).json({ message: "Too many requests. Please try again later." });
  }

  try {
    const email = await emailSchema.validate(req.body.email);

    await subscribeToNewsletter(email);

    return res.status(200).json({ message: "Subscribed!" });
  } catch (e) {
    // Log the full error server-side only; never leak internals to the client.
    console.error("[newsletter] failed to subscribe:", e);

    const message = e instanceof yup.ValidationError ? "Please provide a valid email address" : "Bad request!";

    return res.status(400).json({ message });
  }
}
