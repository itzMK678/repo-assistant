import axios from "axios";

import { env } from "../../../config/env.js";
import { ModelProvider } from "./model.provider.js";

export class NebiusProvider extends ModelProvider {
    constructor() {
        super();
        this.client = null;
    }

    getClient() {
        if (!this.client) {
            if (!env.NEBIUS_BASE_URL) {
                throw new Error("NEBIUS_BASE_URL is not configured");
            }

            if (!env.NEBIUS_API_KEY) {
                throw new Error("NEBIUS_API_KEY is not configured");
            }

            if (!env.NEBIUS_MODEL) {
                throw new Error("NEBIUS_MODEL is not configured");
            }

            this.client = axios.create({
                baseURL: env.NEBIUS_BASE_URL,
                timeout: 120000,
                headers: {
                    Authorization: `Bearer ${env.NEBIUS_API_KEY}`,
                    "Content-Type": "application/json",
                },
            });
        }

        return this.client;
    }

    async generate({
        messages,
        tools = [],
    }) {
        const client = this.getClient();

        const body = {
            model: env.NEBIUS_MODEL,
            messages,
            temperature: 0.2,
            tool_choice:
                tools.length > 0
                    ? "auto"
                    : undefined,
            tools:
                tools.length > 0
                    ? tools
                    : undefined,
        };

        const response =
            await client.post(
                "/chat/completions",
                body
            );

        return response.data;
    }
}

export const nebiusProvider =
    new NebiusProvider();
