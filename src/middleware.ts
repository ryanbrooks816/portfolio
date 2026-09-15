import { defineMiddleware } from "astro/middleware";
import { getProjectById } from "./data/projects";
import { authenticateSession } from "./utils/auth";

const PROJECT_ROUTE = /^\/projects\/([^/]+)\/?$/;
const PRIVATE_PROJECT_API_ROUTE = /^\/api\/private\/projects\/([^/]+)(?:\/|$)/;
const PRIVATE_API_ROUTE = /^\/api\/private(?:\/|$)/;

function applySecurityHeaders(response: Response): Response {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

function applyPrivateHeaders(response: Response): Response {
  response.headers.set("Cache-Control", "private, no-store, no-cache, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");

  return response;
}

function applyResponseHeaders(response: Response, isPrivate: boolean): Response {
  if (isPrivate) {
    applyPrivateHeaders(response);
  }

  return applySecurityHeaders(response);
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  let isPrivate = false;

  // Protect private project pages.
  const projectMatch = pathname.match(PROJECT_ROUTE);

  if (projectMatch) {
    const projectId = decodeURIComponent(projectMatch[1]);
    const project = await getProjectById(projectId);

    if (project?.data.private) {
      isPrivate = true;

      const authResponse = await authenticateSession(context, project.id);

      if (authResponse) {
        return applyResponseHeaders(authResponse, true);
      }
    }
  }

  // Protect APIs belonging to a specific private project.
  const privateApiMatch = pathname.match(PRIVATE_PROJECT_API_ROUTE);

  if (privateApiMatch) {
    isPrivate = true;

    const projectId = decodeURIComponent(privateApiMatch[1]);

    const authResponse = await authenticateSession(context, projectId);

    if (authResponse) {
      return applyResponseHeaders(authResponse, true);
    }
  }

  // Do not allow unrecognized /api/private/* routes through.
  if (PRIVATE_API_ROUTE.test(pathname) && !privateApiMatch) {
    return applyResponseHeaders(
      new Response("Forbidden", {
        status: 403,
      }),
      true,
    );
  }

  // Authentication passed (or wasn't required).
  // Run the actual Astro page/API.
  const response = await next();

  // Add the appropriate headers to its response.
  return applyResponseHeaders(response, isPrivate);
});
