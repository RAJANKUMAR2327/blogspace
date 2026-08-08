const AuditLog = require('../models/AuditLog')

// Fire-and-forget admin action logger — call sites don't await this on purpose,
// an audit-log failure should never block the actual admin action.
exports.logAction = ({ actor, action, targetType, targetId, details, req }) => {
  AuditLog.create({
    actor,
    action,
    targetType,
    targetId,
    details,
    ip: req?.ip
  }).catch(() => {})
}
