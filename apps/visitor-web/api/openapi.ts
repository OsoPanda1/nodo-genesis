const SPEC = {
  openapi: "3.1.0",
  info: {
    title: "RDM Digital Hub API",
    version: "1.0.0",
    description: "API del ecosistema TAMV / Real del Monte Digital Hub",
  },
  servers: [
    { url: "https://visitarealdelmonte.online/api", description: "Production" },
    { url: "http://localhost:3000/api", description: "Development" },
  ],
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        tags: ["System"],
        responses: { "200": { description: "Service status" } },
      },
    },
    "/model-router": {
      post: {
        summary: "Route AI model requests",
        tags: ["AI"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ModelRouterRequest" } } },
        },
        responses: {
          "200": { description: "Model response" },
          "429": { description: "Rate limit exceeded" },
        },
      },
    },
    "/isabella": {
      post: {
        summary: "Isabella AI facade",
        tags: ["AI"],
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "AI response" } },
      },
    },
    "/isabella-chat": {
      post: {
        summary: "Isabella chat (legacy)",
        tags: ["AI"],
        responses: { "200": { description: "Chat response" } },
      },
    },
    "/telemetry": {
      get: { summary: "Telemetry status", tags: ["Observability"] },
      post: { summary: "Submit telemetry", tags: ["Observability"] },
    },
    "/heptafederation": {
      get: { summary: "List federation statuses", tags: ["Federation"] },
      post: { summary: "Execute federation command", tags: ["Federation"] },
    },
    "/connect/token": {
      post: {
        summary: "Exchange fusion token",
        tags: ["Federation"],
        responses: { "200": { description: "Token exchanged" } },
      },
    },
    "/connect/inspect": {
      get: {
        summary: "Inspect federation state",
        tags: ["Federation"],
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Federation state" } },
      },
    },
    "/knowledge-cells": {
      get: { summary: "List knowledge cells", tags: ["Knowledge Cells"] },
    },
    "/knowledge-cells/render-3d": {
      post: { summary: "3D render operation", tags: ["Knowledge Cells"] },
    },
    "/knowledge-cells/render-4d": {
      post: { summary: "4D render operation", tags: ["Knowledge Cells"] },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      ModelRouterRequest: {
        type: "object",
        properties: {
          model: { type: "string" },
          prompt: { type: "string" },
          max_tokens: { type: "integer", default: 512 },
          temperature: { type: "number", default: 0.7 },
        },
        required: ["model", "prompt"],
      },
      Error: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              code: { type: "string" },
              message: { type: "string" },
              ref: { type: "string" },
            },
          },
        },
      },
    },
  },
};

export default SPEC;

export function getOpenApiSpec() {
  return SPEC;
}
