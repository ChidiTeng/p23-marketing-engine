import { http, HttpResponse } from "msw";
import { getCurrentUser, getDb } from "../db/store";
import { withLatency } from "../utils/latency";

export const authHandlers = [
  http.post("*/auth/login", async ({ request }) => {
    await withLatency();
    const body = (await request.json().catch(() => ({}))) as Record<string, string>;
    const user = getCurrentUser();

    // Set auth token cookie for Next.js server-side layout guard
    document.cookie = `auth_token=mock-p23-token-${user.id}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `factory_auth_token=mock-p23-token-${user.id}; path=/; max-age=86400; SameSite=Lax`;

    return HttpResponse.json({
      success: true,
      message: "Signed in successfully.",
      data: {
        token: `mock-p23-token-${user.id}`,
        token_type: "Bearer",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar_url: user.avatar_url,
        },
        organization: getDb().organization,
      },
    });
  }),

  http.get("*/auth/me", async () => {
    await withLatency(50);
    const user = getCurrentUser();
    const org = getDb().organization;
    return HttpResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        current_organization: org,
        organizations: [org],
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        organization_role: user.role,
      },
      current_organization: org,
      organizations: [org],
    });
  }),

  http.get("*/organizations/current", async () => {
    await withLatency(50);
    return HttpResponse.json({
      success: true,
      data: getDb().organization,
    });
  }),

  http.get("*/usage", async () => {
    await withLatency(50);
    return HttpResponse.json({
      success: true,
      data: {
        leads_used: 120,
        leads_limit: 1000,
        searches_used: 45,
        searches_limit: 500,
      },
    });
  }),

  http.post("*/auth/logout", async () => {
    document.cookie = "auth_token=; path=/; max-age=0";
    return HttpResponse.json({ success: true, message: "Logged out." });
  }),
];
