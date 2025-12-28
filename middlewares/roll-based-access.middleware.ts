export const authorizeUser = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req?.user) {
      return res.status(403).json({ messsage: "Access Denied" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access Denied" });
    }
    next();
  };
};
