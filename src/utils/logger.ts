export function logError(error: unknown, context?: string) {
  const timestamp = new Date().toISOString();
  let message = "";

  if (error instanceof Error) {
    message = error.stack || error.message;
  } else if (typeof error === "string") {
    message = error;
  } else {
    message = JSON.stringify(error);
  }

  const logEntry = {
    timestamp,
    context: context || "unknown",
    message,
  };

  console.error("[ErrorLog]", logEntry);
}
