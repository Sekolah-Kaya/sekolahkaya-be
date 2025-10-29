export const authPaths = {
    '/api/auth/register': {
        post: {
            tags: ['Authentication'],
            summary: 'Register a new user',
            description: 'Creates a new user account and logs them in',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/RegisterRequest' }
                    }
                }
            },
            responses: {
                201: {
                    description: 'Registration successful',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AuthResponse' }
                        }
                    }
                },
                400: {
                    description: 'Bad request',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                500: {
                    description: 'Internal server error',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        }
    },
    '/api/auth/login': {
        post: {
            tags: ['Authentication'],
            summary: 'User login',
            description: 'Authenticates a user and returns access and refresh tokens',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/LoginRequest' }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Login successful',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AuthResponse' }
                        }
                    }
                },
                400: {
                    description: 'Bad request',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                401: {
                    description: 'Unauthorized',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                500: {
                    description: 'Internal server error',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        }
    },
    '/api/auth/logout': {
        post: {
            tags: ['Authentication'],
            summary: 'Logout user',
            description: 'Logs out the current user session',
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: 'Logout successful',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Logout successful' }
                                }
                            }
                        }
                    }
                },
                401: {
                    description: 'Unauthorized',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                500: {
                    description: 'Internal server error',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        }
    },
    '/api/auth/logout-all': {
        post: {
            tags: ['Authentication'],
            summary: 'Logout all sessions',
            description: 'Logs out all sessions for the current user',
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: 'All sessions logged out',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            sessionsRevoked: { type: 'integer', example: 3 }
                                        }
                                    },
                                    message: { type: 'string', example: 'All sessions logged out' }
                                }
                            }
                        }
                    }
                },
                401: {
                    description: 'Unauthorized',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                500: {
                    description: 'Internal server error',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        }
    },
    '/api/auth/refresh-token': {
        post: {
            tags: ['Authentication'],
            summary: 'Refresh access token',
            description: 'Refreshes the access token using a refresh token',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/RefreshTokenRequest' }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Token refreshed',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AuthResponse' }
                        }
                    }
                },
                400: {
                    description: 'Bad request',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                401: {
                    description: 'Unauthorized',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                500: {
                    description: 'Internal server error',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        }
    },
    '/api/auth/me': {
        get: {
            tags: ['Authentication'],
            summary: 'Get current user info',
            description: 'Retrieves information about the currently authenticated user',
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: 'User info retrieved',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: { $ref: '#/components/schemas/User' }
                                }
                            }
                        }
                    }
                },
                401: {
                    description: 'Unauthorized',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                404: {
                    description: 'User not found',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                500: {
                    description: 'Internal server error',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        }
    }
};
