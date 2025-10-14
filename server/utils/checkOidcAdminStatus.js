/**
 * Determines if user should have admin privileges
 * Checks multiple OIDC provider patterns (case-insensitive):
 * - Direct flags: is_admin, is_superuser
 * - Groups array: any group containing "admin" or "superuser"
 * - Roles array: any role containing "admin" or "superuser"
 * @param {Object} userinfo - User info from OIDC provider
 * @returns {boolean} True if user should be admin
 */

const checkOidcAdminStatus = (userinfo) => {
  // Direct boolean flags
  if (userinfo.is_superuser || userinfo.is_admin) return true;

  // Check groups (case-insensitive, matches "admins", "Admins", "authentik Admins", etc.)
  if (userinfo.groups && Array.isArray(userinfo.groups)) {
    const hasAdminGroup = userinfo.groups.some((group) => {
      const groupLower = String(group).toLowerCase();
      return groupLower.includes('admin') || groupLower.includes('superuser');
    });
    if (hasAdminGroup) return true;
  }

  // Check roles (case-insensitive)
  if (userinfo.roles && Array.isArray(userinfo.roles)) {
    const hasAdminRole = userinfo.roles.some((role) => {
      const roleLower = String(role).toLowerCase();
      return roleLower.includes('admin') || roleLower.includes('superuser');
    });
    if (hasAdminRole) return true;
  }

  return false;
};

module.exports = {
  checkOidcAdminStatus,
};
