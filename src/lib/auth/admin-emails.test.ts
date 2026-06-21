import { describe, expect, it } from "vitest";

import { isConfiguredAdminEmail, parseAdminEmails } from "./admin-emails";

describe("admin email allowlist", () => {
  it("uses the ITNA super admin email as the default", () => {
    expect(parseAdminEmails()).toEqual(["smily094@gmail.com"]);
  });

  it("normalizes configured emails", () => {
    expect(parseAdminEmails(" Admin@Example.com, smily094@gmail.com ")).toEqual([
      "admin@example.com",
      "smily094@gmail.com",
    ]);
  });

  it("matches emails case-insensitively", () => {
    expect(isConfiguredAdminEmail("SMILY094@gmail.com", ["smily094@gmail.com"])).toBe(true);
    expect(isConfiguredAdminEmail("user@example.com", ["smily094@gmail.com"])).toBe(false);
  });
});
