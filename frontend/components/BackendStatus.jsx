"use client";

import { useEffect, useState } from "react";
import { getHealth } from "../lib/api";

export default function BackendStatus() {
  const [status, setStatus] = useState("Checking...");
  const [error, setError] = useState("");

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const result = await getHealth();

        if (result.success && result.data?.database?.status === "connected") {
          setStatus("Backend + PostgreSQL connected");
        } else {
          setStatus("Backend is running, but database is unavailable");
        }
      } catch (error) {
        console.error(error);
        setError("Backend is not reachable.");
      }
    };

    checkBackend();
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-green-300 bg-green-50 p-4 text-green-700">
      {status}
    </div>
  );
}
