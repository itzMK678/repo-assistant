import {
    analyzeRepository,
    listRepositoryFiles,
    readRepositoryFile,
    searchRepository,
    detectProjectType
} from "../services/repository/repository-analyzer.service.js";

import { getGithubAccessToken } from "../services/github/github.service.js";


async function getGitHubToken(req) {
    if (!req.user?.id) {
        const error = new Error(
            "GitHub authentication is required."
        );

        error.statusCode = 401;

        throw error;
    }

    return await getGithubAccessToken(req.user.id);
}


/**
 * GET /api/repositories/:owner/:repo/analyze
 */
export async function analyzeRepositoryController(req, res, next) {
    try {
        const { owner, repo } = req.params;

        const accessToken = await getGitHubToken(req);

        const result = await analyzeRepository({
            accessToken,
            owner,
            repo
        });

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}


/**
 * GET /api/repositories/:owner/:repo/files
 */
export async function listRepositoryFilesController(
    req,
    res,
    next
) {
    try {
        const { owner, repo } = req.params;

        const accessToken = await getGitHubToken(req);

        const files = await listRepositoryFiles({
            accessToken,
            owner,
            repo
        });

        res.json({
            success: true,
            data: files
        });
    } catch (error) {
        next(error);
    }
}


/**
 * GET /api/repositories/:owner/:repo/file
 */
export async function readRepositoryFileController(
    req,
    res,
    next
) {
    try {
        const { owner, repo } = req.params;
        const { path } = req.query;

        if (!path) {
            const error = new Error(
                "File path is required."
            );

            error.statusCode = 400;

            throw error;
        }

        const accessToken = await getGitHubToken(req);

        const file = await readRepositoryFile({
            accessToken,
            owner,
            repo,
            path
        });

        res.json({
            success: true,
            data: file
        });
    } catch (error) {
        next(error);
    }
}


/**
 * GET /api/repositories/:owner/:repo/search
 */
export async function searchRepositoryController(
    req,
    res,
    next
) {
    try {
        const { owner, repo } = req.params;
        const { q } = req.query;

        if (!q) {
            const error = new Error(
                "Search query is required."
            );

            error.statusCode = 400;

            throw error;
        }

        const accessToken = await getGitHubToken(req);

        const result = await searchRepository({
            accessToken,
            owner,
            repo,
            query: q
        });

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}


/**
 * GET /api/repositories/:owner/:repo/project-type
 */
export async function detectProjectTypeController(
    req,
    res,
    next
) {
    try {
        const { owner, repo } = req.params;

        const accessToken = await getGitHubToken(req);

        const result = await detectProjectType({
            accessToken,
            owner,
            repo
        });

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}