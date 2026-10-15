import {
  getUserFromSession,
} from "../services/session.service.js";

export async function requireAuth(
  req,
  res,
  next
) {
  try {
    const sessionToken =
      req.cookies?.repoassistant_session;

    const user =
      await getUserFromSession(sessionToken);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuth(
  req,
  res,
  next
) {
  try {
    const sessionToken =
      req.cookies?.repoassistant_session;

    if (sessionToken) {
      const user =
        await getUserFromSession(sessionToken);

      if (user) {
        req.user = user;
      }
    }

    next();
  } catch {
    next();
  }
}