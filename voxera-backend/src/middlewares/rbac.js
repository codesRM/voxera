const ROLES = {
  USER:      'user',
  MODERATOR: 'moderator',
  ADMIN:     'admin',
};

// Role hierarchy — higher index = more permissions
const ROLE_HIERARCHY = [
  ROLES.USER,
  ROLES.MODERATOR,
  ROLES.ADMIN,
];

// Check if user has required role or higher
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const userRoleIndex     = ROLE_HIERARCHY.indexOf(req.user.role);
    const hasPermission     = allowedRoles.some((role) => {
      const requiredRoleIndex = ROLE_HIERARCHY.indexOf(role);
      return userRoleIndex >= requiredRoleIndex;
    });

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }

    next();
  };
};

module.exports = { authorize, ROLES };