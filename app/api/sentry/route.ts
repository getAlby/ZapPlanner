import { captureException } from "@sentry/nextjs";

// TODO: REMOVE after testing
export async function POST(request: Request) {
  try {
    throw new Error("Next13 app directory test");
  } catch (error) {
    captureException(error);
  }
}
