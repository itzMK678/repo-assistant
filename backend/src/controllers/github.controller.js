import crypto from "crypto";

import { env } from "../config/env.js";

import {
  getGithubAuthorizationUrl,
  exchangeCodeForToken,
  getGithubUser,
  saveGithubAccount,
  getRepositories,
} from "../services/github/github.service.js";

import {
  createSession,
  deleteSession,
} from "../services/session.service.js";

import {
  findUserByGithubId,
  createUser,
} from "../services/user.service.js";


function setSessionCookie(
  res,
  token
) {
  res.cookie(
    "repoassistant_session",
    token,
    {
      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite:
        process.env.NODE_ENV ===
        "production"
          ? "none"
          : "lax",

      maxAge:
        7 * 24 * 60 * 60 * 1000,

      path: "/",
    }
  );
}


export async function githubLogin(
  req,
  res,
  next
) {
  try {
    const state =
      crypto.randomBytes(32)
        .toString("hex");

    res.cookie(
      "github_oauth_state",
      state,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite:
          "lax",

        maxAge: 10 * 60 * 1000,

        path: "/",
      }
    );

    const url =
      getGithubAuthorizationUrl(
        state
      );

    res.redirect(url);
  } catch (error) {
    next(error);
  }
}


export async function githubCallback(
  req,
  res,
  next
) {
  try {
    const {
      code,
      state,
      error,
    } = req.query;

    if (error) {
      return res.redirect(
        `${env.frontendUrl}/?github_error=${encodeURIComponent(error)}`
      );
    }

    const savedState =
      req.cookies.github_oauth_state;

    if (
      !state ||
      !savedState ||
      state !== savedState
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid OAuth state.",
      });
    }

    res.clearCookie(
      "github_oauth_state"
    );

    if (!code) {
      return res.status(400).json({
        success: false,
        message:
          "GitHub authorization code missing.",
      });
    }

    const tokenData =
      await exchangeCodeForToken(
        code
      );

    const githubUser =
      await getGithubUser(
        tokenData.access_token
      );

    let user =
      await findUserByGithubId(
        githubUser.id
      );

    if (!user) {
      user = await createUser();
    }

    await saveGithubAccount({
      userId: user.id,

      githubUser,

      tokenData,
    });

    const session =
      await createSession(
        user.id
      );

    setSessionCookie(
      res,
      session.token
    );

    return res.redirect(
      `${env.frontendUrl}/dashboard`
    );
  } catch (error) {
    next(error);
  }
}


export async function githubRepositories(
  req,
  res,
  next
) {
  try {
    const page =
      Number(req.query.page || 1);

    if (
      !Number.isInteger(page) ||
      page < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid page number.",
      });
    }

    const repositories =
      await getRepositories(
        req.user.id,
        page
      );

    res.json({
      success: true,

      data: {
        repositories,
        page,
      },
    });
  } catch (error) {
    next(error);
  }
}


export async function githubLogout(
  req,
  res,
  next
) {
  try {
    const sessionToken =
      req.cookies
        ?.repoassistant_session;

    await deleteSession(
      sessionToken
    );

    res.clearCookie(
      "repoassistant_session"
    );

    res.json({
      success: true,
      message:
        "Logged out successfully.",
    });
  } catch (error) {
    next(error);
  }
}