export const defaultAdminEmails = ["smily094@gmail.com"] as const;

export function parseAdminEmails(raw?: string | null) {
  const configuredEmails = raw
    ?.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return configuredEmails?.length ? configuredEmails : [...defaultAdminEmails];
}

export function getConfiguredAdminEmails() {
  return parseAdminEmails(process.env.ADMIN_EMAILS);
}

export function isConfiguredAdminEmail(email?: string | null, adminEmails = getConfiguredAdminEmails()) {
  if (!email) {
    return false;
  }

  return adminEmails.includes(email.trim().toLowerCase());
}
