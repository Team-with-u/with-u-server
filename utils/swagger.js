const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "WITH-U API",
    version: "1.0.0",
    description: "WITH-U backend REST API",
  },
  servers: [
    {
      url: process.env.PUBLIC_BASE_URL || "http://localhost:8000",
    },
  ],
  tags: [
    { name: "Workers" },
    { name: "Incidents" },
  ],
  components: {
    schemas: {
      ApiSuccess: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { type: "object" },
        },
      },
      ApiError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Error message" },
        },
      },
      Worker: {
        type: "object",
        properties: {
          workerId: { type: "number", example: 1 },
          workerName: { type: "string", example: "Kim" },
          status: {
            type: "string",
            enum: ["normal", "warning", "danger"],
            example: "normal",
          },
          location: { type: "string", example: "A-zone" },
          lastMovement: { type: "string", example: "just now" },
          incidentCount: { type: "number", example: 0 },
        },
      },
      Incident: {
        type: "object",
        properties: {
          incidentId: { type: "string", example: "6647f7b7e2d4e0a6c3a2b9f1" },
          workerId: { type: "number", example: 1 },
          workerName: { type: "string", example: "Kim" },
          location: { type: "string", example: "B-zone" },
          currentStatus: {
            type: "string",
            enum: ["active", "processing", "resolved"],
            example: "processing",
          },
          dangerLevel: {
            type: "string",
            enum: ["normal", "warning", "danger"],
            example: "danger",
          },
          startedAt: { type: "string", format: "date-time" },
          resolvedAt: { type: "string", format: "date-time", nullable: true },
        },
      },
      IncidentTimelineItem: {
        type: "object",
        properties: {
          incidentId: { type: "string", example: "6647f7b7e2d4e0a6c3a2b9f1" },
          workerId: { type: "number", example: 1 },
          workerName: { type: "string", example: "Kim" },
          step: {
            type: "string",
            enum: ["detected", "acknowledged", "calling_worker", "worker_responded", "dispatching_team", "resolved"],
            example: "detected",
          },
          message: { type: "string", example: "Fall detected" },
          time: { type: "string", example: "14:21" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      IncidentTimeline: {
        type: "object",
        properties: {
          incidentId: { type: "string", example: "6647f7b7e2d4e0a6c3a2b9f1" },
          timeline: {
            type: "array",
            items: { $ref: "#/components/schemas/IncidentTimelineItem" },
          },
        },
      },
      WorkerIncidentLog: {
        type: "object",
        properties: {
          step: {
            type: "string",
            enum: ["detected", "acknowledged", "calling_worker", "worker_responded", "dispatching_team", "resolved"],
            example: "detected",
          },
          message: { type: "string", example: "B구역 쓰러짐 감지" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      WorkerIncidentHistory: {
        type: "object",
        properties: {
          workerId: { type: "number", example: 1 },
          workerName: { type: "string", example: "김철수" },
          totalCount: { type: "number", example: 2 },
          incidents: {
            type: "array",
            items: {
              type: "object",
              properties: {
                incidentId: { type: "string", example: "INC001" },
                status: {
                  type: "string",
                  enum: ["active", "processing", "resolved"],
                  example: "resolved",
                },
                location: { type: "string", example: "B구역" },
                createdAt: { type: "string", format: "date-time" },
                resolvedAt: { type: "string", format: "date-time", nullable: true },
                duration: { type: "number", example: 180 },
                logs: {
                  type: "array",
                  items: { $ref: "#/components/schemas/WorkerIncidentLog" },
                },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    "/api/workers": {
      get: {
        tags: ["Workers"],
        summary: "작업자 상태 목록 조회",
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiSuccess" },
                    {
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Worker" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/api/workers/{workerId}/incidents": {
      get: {
        tags: ["Workers"],
        summary: "작업자별 사고 이력 상세 조회",
        parameters: [
          {
            name: "workerId",
            in: "path",
            required: true,
            schema: { type: "number" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiSuccess" },
                    {
                      properties: {
                        data: { $ref: "#/components/schemas/WorkerIncidentHistory" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/api/incidents": {
      get: {
        tags: ["Incidents"],
        summary: "활성 사고 목록 조회",
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiSuccess" },
                    {
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Incident" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/api/incidents/active": {
      get: {
        tags: ["Incidents"],
        summary: "활성 사고 목록 조회 (별칭)",
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiSuccess" },
                    {
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Incident" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/api/incidents/{incidentId}/timeline": {
      get: {
        tags: ["Incidents"],
        summary: "사고 타임라인 조회",
        parameters: [
          {
            name: "incidentId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiSuccess" },
                    {
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/IncidentTimelineItem" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/api/incidents/{incidentId}/ack": {
      post: {
        tags: ["Incidents"],
        summary: "관리자 확인 완료",
        parameters: [
          {
            name: "incidentId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiSuccess" },
              },
            },
          },
        },
      },
    },
    "/api/incidents/{incidentId}/dispatch": {
      post: {
        tags: ["Incidents"],
        summary: "현장 대응 처리",
        parameters: [
          {
            name: "incidentId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiSuccess" },
              },
            },
          },
        },
      },
    },
    "/api/incidents/{incidentId}/resolve": {
      post: {
        tags: ["Incidents"],
        summary: "상황 종료 처리",
        parameters: [
          {
            name: "incidentId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiSuccess" },
              },
            },
          },
        },
      },
    },
    "/api/incidents/{incidentId}/call": {
      post: {
        tags: ["Incidents"],
        summary: "작업자 호출",
        parameters: [
          {
            name: "incidentId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiSuccess" },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = swaggerSpec;
