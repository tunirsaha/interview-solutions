import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Job Referral Bulletin API",
    version: "1.0.0",
    description: "API documentation for Job Referral Bulletin backend",
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Local server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          email: { type: "string" },
        },
      },
      JobList: {
        type: "object",
        properties: {
          id: { type: "integer" },
          user_id: { type: "integer" },
          title: { type: "string" },
          public: { type: "boolean" },
          status: { type: "integer" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      PublicListWithJobs: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          created_at: { type: "string", format: "date-time" },
          creator_name: { type: "string" },
          jobs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "integer" },
                title: { type: "string" },
                apply_link: { type: "string", nullable: true },
                created_at: { type: "string", format: "date-time" },
                updated_at: { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
      UserListWithJobs: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          public: { type: "boolean" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
          creator_name: { type: "string" },
          jobs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "integer" },
                title: { type: "string" },
                apply_link: { type: "string", nullable: true },
                created_at: { type: "string", format: "date-time" },
                updated_at: { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
      Job: {
        type: "object",
        properties: {
          id: { type: "integer" },
          job_list_id: { type: "integer" },
          title: { type: "string" },
          apply_link: { type: "string", nullable: true },
          status: { type: "integer" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
          list_name: { type: "string" },
        },
      },
      Invite: {
        type: "object",
        properties: {
          id: { type: "integer" },
          user_id: { type: "integer" },
          token: { type: "string" },
          email: { type: "string" },
          created_at: { type: "string", format: "date-time" },
          accepted_at: { type: "string", format: "date-time", nullable: true },
          accepted: { type: "boolean" },
        },
      },
      SharedListWithJobs: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          public: { type: "boolean" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
          creator_name: { type: "string" },
          share_id: { type: "integer" },
          share_created_at: { type: "string", format: "date-time" },
          shared_by_user_id: { type: "integer" },
          jobs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "integer" },
                title: { type: "string" },
                apply_link: { type: "string", nullable: true },
                created_at: { type: "string", format: "date-time" },
                updated_at: { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
      ListShare: {
        type: "object",
        properties: {
          id: { type: "integer" },
          list_id: { type: "integer" },
          shared_by_user_id: { type: "integer" },
          shared_with_user_id: { type: "integer" },
          created_at: { type: "string", format: "date-time" },
          list_name: { type: "string" },
          list_description: { type: "string", nullable: true },
          shared_by_email: { type: "string" },
          shared_with_email: { type: "string" },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    // ===== GENERIC =====
    "/health": {
      get: {
        tags: ["Generic"],
        summary: "Health check",
        responses: {
          200: {
            description: "API status",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Generic"],
        summary: "Register new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  email: { type: "string" },
                  password: { type: "string" },
                  inviteToken: { type: "string" },
                },
                required: ["name", "email", "password", "inviteToken"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "JWT token and user",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string" },
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          400: { description: "Invalid request or invite token" },
          409: { description: "Email already registered" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Generic"],
        summary: "Login user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                },
                required: ["email", "password"],
              },
            },
          },
        },
        responses: {
          200: { 
            description: "JWT token and user",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string" },
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Generic"],
        summary: "Get authenticated user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { 
            description: "User",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Generic"],
        summary: "Refresh JWT token",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { 
            description: "New JWT token",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/auth/google": {
      post: {
        tags: ["Generic"],
        summary: "Google OAuth login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  idToken: { type: "string" },
                },
                required: ["idToken"],
              },
            },
          },
        },
        responses: {
          200: { 
            description: "JWT token and user",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string" },
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          400: { description: "idToken required" },
          401: { description: "Invalid Google token" },
        },
      },
    },
    "/auth/password": {
      put: {
        tags: ["Generic"],
        summary: "Change password",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  currentPassword: { type: "string" },
                  newPassword: { type: "string" },
                },
                required: ["currentPassword", "newPassword"],
              },
            },
          },
        },
        responses: {
          200: { 
            description: "Password updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: { description: "Current and new password required" },
          401: { description: "Current password incorrect" },
          404: { description: "User not found" },
        },
      },
    },

    // ===== LISTS =====
    "/lists": {
      get: {
        tags: ["Lists"],
        summary: "List my job lists",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Job lists",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    lists: {
                      type: "array",
                      items: { $ref: "#/components/schemas/JobList" }
                    }
                  }
                }
              }
            }
          },
          401: { description: "Unauthorized" },
        }
      },
      post: {
        tags: ["Lists"],
        summary: "Create job list",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  public: { type: "boolean" },
                },
                required: ["title"],
              },
            },
          },
        },
        responses: {
          201: { 
            description: "Created job list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/JobList" }
              }
            }
          },
          400: { description: "title required" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/lists/with-jobs": {
      get: {
        tags: ["Lists"],
        summary: "Get my lists with jobs (for dashboard)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "User lists with jobs",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    lists: {
                      type: "array",
                      items: { $ref: "#/components/schemas/UserListWithJobs" }
                    }
                  }
                }
              }
            }
          },
          401: { description: "Unauthorized" },
          500: { description: "Failed to fetch user lists with jobs" },
        }
      },
    },
    "/lists/shared-with-jobs": {
      get: {
        tags: ["Lists"],
        summary: "Get shared lists with jobs",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Shared lists with jobs",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    lists: {
                      type: "array",
                      items: { $ref: "#/components/schemas/SharedListWithJobs" }
                    }
                  }
                }
              }
            }
          },
          401: { description: "Unauthorized" },
          500: { description: "Failed to fetch shared lists with jobs" },
        }
      },
    },
    "/lists/public": {
      get: {
        tags: ["Lists"],
        summary: "Get public lists with jobs",
        responses: {
          200: {
            description: "Public lists with jobs",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    lists: {
                      type: "array",
                      items: { $ref: "#/components/schemas/PublicListWithJobs" }
                    }
                  }
                }
              }
            }
          },
          500: { description: "Failed to fetch public lists" },
        }
      },
    },
    "/lists/{id}": {
      put: {
        tags: ["Lists"],
        summary: "Update job list",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        requestBody: {
          content: { 
            "application/json": { 
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  public: { type: "boolean" },
                },
              }
            } 
          },
        },
        responses: { 
          200: { 
            description: "Updated job list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/JobList" }
              }
            }
          },
          404: { description: "List not found" },
          401: { description: "Unauthorized" },
        },
      },
      delete: {
        tags: ["Lists"],
        summary: "Delete job list",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: { 
          200: { 
            description: "List deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                  },
                },
              },
            },
          },
          404: { description: "List not found" },
          401: { description: "Unauthorized" },
        },
      },
    },

    // ===== JOBS =====
    "/jobs": {
      get: {
        tags: ["Jobs"],
        summary: "List my jobs",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Jobs list",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Job" }
                }
              }
            }
          },
          401: { description: "Unauthorized" },
        }
      },
      post: {
        tags: ["Jobs"],
        summary: "Create job",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  apply_link: { type: "string" },
                  job_list_id: { type: "integer" },
                },
                required: ["title", "job_list_id"],
              },
            },
          },
        },
        responses: {
          201: { 
            description: "Created job",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Job" }
              }
            }
          },
          400: { description: "title required or job_list_id required or job list not found" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/jobs/public": {
      get: {
        tags: ["Jobs"],
        summary: "List public jobs",
        responses: {
          200: {
            description: "Public jobs list",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Job" }
                }
              }
            }
          },
          500: { description: "Failed to fetch public jobs" },
        }
      },
    },
    "/jobs/{id}": {
      get: {
        tags: ["Jobs"],
        summary: "Get job by ID",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: {
          200: { 
            description: "Job details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Job" }
              }
            }
          },
          404: { description: "Job not found" },
          500: { description: "Failed to fetch job" },
        },
      },
      put: {
        tags: ["Jobs"],
        summary: "Update job",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        requestBody: {
          content: { 
            "application/json": { 
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  apply_link: { type: "string" },
                },
                required: ["title"],
              }
            } 
          },
        },
        responses: { 
          200: { 
            description: "Updated job",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Job" }
              }
            }
          },
          400: { description: "title required" },
          404: { description: "Job not found" },
          403: { description: "Access denied" },
          401: { description: "Unauthorized" },
        },
      },
      delete: {
        tags: ["Jobs"],
        summary: "Delete job",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: { 
          200: { 
            description: "Job deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          404: { description: "Job not found" },
          403: { description: "Access denied" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/jobs/list/{jobListId}": {
      get: {
        tags: ["Jobs"],
        summary: "Get jobs by job list ID",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "jobListId", required: true, schema: { type: "integer" } }],
        responses: {
          200: {
            description: "Jobs in list",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Job" }
                }
              }
            }
          },
          403: { description: "Access denied" },
          401: { description: "Unauthorized" },
        },
      },
    },

    // ===== INVITES =====
    "/invites": {
      get: {
        tags: ["Invites"],
        summary: "List my invites",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Invites list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    invites: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Invite" }
                    }
                  }
                }
              }
            }
          },
          401: { description: "Unauthorized" },
        }
      },
      post: {
        tags: ["Invites"],
        summary: "Create invite",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                },
                required: ["email"],
              },
            },
          },
        },
        responses: {
          200: { 
            description: "Created invite",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string" },
                    registerLink: { type: "string" },
                  },
                },
              },
            },
          },
          400: { description: "Email is required or validation error" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/invites/{id}": {
      delete: {
        tags: ["Invites"],
        summary: "Delete invite",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: {
          200: {
            description: "Invitation deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          404: { description: "Invitation not found or not authorized" },
          401: { description: "Unauthorized" },
          500: { description: "Failed to delete invitation" },
        },
      },
    },

    // ===== LIST SHARES =====
    "/list-shares/{listId}/share": {
      post: {
        tags: ["List Shares"],
        summary: "Share a list with a user by email",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "listId", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                },
                required: ["email"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "List shared successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: { description: "List is already shared with this user" },
          404: { description: "User with this email not found" },
          401: { description: "Unauthorized" },
          500: { description: "Failed to share list" },
        },
      },
    },
    "/list-shares/shared-with-me": {
      get: {
        tags: ["List Shares"],
        summary: "Get all lists shared with the current user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Shared lists",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/ListShare" }
                }
              }
            }
          },
          401: { description: "Unauthorized" },
          500: { description: "Failed to get shared lists" },
        },
      },
    },
    "/list-shares/{listId}/shares": {
      get: {
        tags: ["List Shares"],
        summary: "Get all users a list is shared with",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "listId", required: true, schema: { type: "integer" } }],
        responses: {
          200: {
            description: "List shares",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/ListShare" }
                }
              }
            }
          },
          401: { description: "Unauthorized" },
          500: { description: "Failed to get list shares" },
        },
      },
    },
    "/list-shares/{listId}/share/{userId}": {
      delete: {
        tags: ["List Shares"],
        summary: "Remove a share",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "listId", required: true, schema: { type: "integer" } },
          { in: "path", name: "userId", required: true, schema: { type: "integer" } }
        ],
        responses: {
          200: {
            description: "Share removed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          500: { description: "Failed to remove share" },
        },
      },
    },
  },
};

const swaggerSpec = swaggerJSDoc({ definition: swaggerDefinition, apis: [] });

export default swaggerSpec; 