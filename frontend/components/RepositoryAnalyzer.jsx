"use client";

import { useState, useEffect } from "react";

import {
    analyzeRepository,
    getRepositoryFiles
} from "../lib/api";

export default function RepositoryAnalyzer({
    owner,
    repo
}) {
    const [analysis, setAnalysis] = useState(null);
    const [files, setFiles] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setAnalysis(null);
        setFiles([]);
        setError("");
    }, [owner, repo]);

    async function handleAnalyze() {
        try {
            setLoading(true);
            setError("");

            const result = await analyzeRepository(
                owner,
                repo
            );

            setAnalysis(result.data);

            const fileResult = await getRepositoryFiles(
                owner,
                repo
            );

            setFiles(fileResult.data);
        } catch (err) {
            setError(
                err.message ||
                "Failed to analyze repository."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="mt-8 rounded-xl border p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">
                        Repository Analyzer
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        {owner}/{repo}
                    </p>
                </div>

                <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
                >
                    {loading
                        ? "Analyzing..."
                        : "Analyze Repository"}
                </button>
            </div>

            {error && (
                <div className="mt-4 rounded-lg border border-red-300 p-3 text-red-600">
                    {error}
                </div>
            )}

            {analysis && (
                <div className="mt-6 space-y-6">

                    <div>
                        <h3 className="font-semibold">
                            Repository
                        </h3>

                        <p className="mt-2 text-sm">
                            Branch:{" "}
                            {analysis.repository.defaultBranch}
                        </p>

                        <p className="text-sm">
                            Language:{" "}
                            {analysis.repository.language ||
                                "Unknown"}
                        </p>
                    </div>


                    <div>
                        <h3 className="font-semibold">
                            Statistics
                        </h3>

                        <div className="mt-3 grid grid-cols-3 gap-4">
                            <div className="rounded-lg border p-4">
                                <p className="text-sm text-gray-500">
                                    Files
                                </p>

                                <p className="text-2xl font-bold">
                                    {analysis.statistics.totalFiles}
                                </p>
                            </div>

                            <div className="rounded-lg border p-4">
                                <p className="text-sm text-gray-500">
                                    Directories
                                </p>

                                <p className="text-2xl font-bold">
                                    {analysis.statistics.totalDirectories}
                                </p>
                            </div>

                            <div className="rounded-lg border p-4">
                                <p className="text-sm text-gray-500">
                                    Code Files
                                </p>

                                <p className="text-2xl font-bold">
                                    {analysis.statistics.totalCodeFiles}
                                </p>
                            </div>
                        </div>
                    </div>


                    <div>
                        <h3 className="font-semibold">
                            Important Files
                        </h3>

                        <ul className="mt-3 space-y-2">
                            {analysis.importantFiles.map(
                                (file) => (
                                    <li
                                        key={file.path}
                                        className="rounded-lg border p-3 text-sm"
                                    >
                                        {file.path}
                                    </li>
                                )
                            )}
                        </ul>
                    </div>


                    <div>
                        <h3 className="font-semibold">
                            Repository Files
                        </h3>

                        <div className="mt-3 max-h-96 overflow-auto rounded-lg border">
                            {files.map((file) => (
                                <div
                                    key={file.path}
                                    className="border-b p-3 text-sm last:border-b-0"
                                >
                                    {file.path}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            )}
        </section>
    );
}