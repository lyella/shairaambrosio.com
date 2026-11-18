import sgMail from "@sendgrid/mail";
import type { NextApiRequest, NextApiResponse } from "next";
import * as yup from "yup";

import { EMAIL_REGEX } from "utils/consts";
import { rateLimit } from "lib/rateLimit";

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

interface Email {
  readonly name: string;
  readonly email: string;
  readonly message: string;
}

const schema = yup.object().shape({
  name: yup.string().required(),
  message: yup.string().required(),
  email: yup.string().required().matches(EMAIL_REGEX),
});

export const sendEmail = async ({ email, name, message }: Email) => {
  const msg = {
    to: process.env.EMAIL,
    from: process.env.EMAIL as string,
    name,
    subject: email,
    text: `Sender's name: ${name}\n\n${message}`,
  };
  

  await sgMail.send(msg);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!(await rateLimit(req, res, 5, 10 * 60 * 1000, "contact"))) {
    return res.status(429).json({ message: "Too many requests. Please try again later." });
  }

  try {
    const { name, message, email } = req.body;

    await schema.validate({ name, message, email });

    await sendEmail({ name, message, email });

    return res.status(200).json({ message: "Email has been sent!" });
  } catch (e) {
    // Log the full error server-side only; never leak internals to the client.
    console.error("[contact] failed to send email:", e);

    const message = e instanceof yup.ValidationError
      ? e.path === "email"
        ? "Please provide a valid email address"
        : e.message
      : "Something went wrong. Please try again later.";

    return res.status(400).json({ message });
  }
}
