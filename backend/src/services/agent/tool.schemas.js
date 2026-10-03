import { z } from "zod";

export const listFilesSchema = z.object({
    path: z.string().optional().default(""),
});

export const readFileSchema = z.object({
    path: z.string().min(1),
    startLine: z.number().int().positive().optional(),
    endLine: z.number().int().positive().optional(),
});

export const searchCodeSchema = z.object({
    query: z.string().min(1),
    path: z.string().optional().default(""),
});

export const findFileSchema = z.object({
    name: z.string().min(1),
});

export const writeFileSchema = z.object({
    path: z.string().min(1),
    content: z.string(),
});

export const createFileSchema = z.object({
    path: z.string().min(1),
    content: z.string(),
});

export const deleteFileSchema = z.object({
    path: z.string().min(1),
});

export const runCommandSchema = z.object({
    command: z.string().min(1),
});

export const runTestsSchema = z.object({
    command: z.string().optional().default("npm test"),
});

export const runBuildSchema = z.object({
    command: z.string().optional().default("npm run build"),
});
