export const coursePaths = {
    '/api/courses': {
        post: {
            tags: ['Courses'],
            summary: 'Create a new course',
            description: 'Creates a new course (instructors only)',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/CreateCourseRequest' }
                    }
                }
            },
            responses: {
                201: {
                    description: 'Course created',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: { $ref: '#/components/schemas/Course' },
                                    message: { type: 'string', example: 'Course created successfully' }
                                }
                            }
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
                403: {
                    description: 'Forbidden',
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
    '/api/courses/search': {
        get: {
            tags: ['Courses'],
            summary: 'Search courses',
            description: 'Searches for courses with optional filters',
            parameters: [
                {
                    name: 'search',
                    in: 'query',
                    schema: { type: 'string' },
                    description: 'Search term'
                },
                {
                    name: 'categoryId',
                    in: 'query',
                    schema: { type: 'string' },
                    description: 'Category ID'
                },
                {
                    name: 'level',
                    in: 'query',
                    schema: { type: 'string', enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] },
                    description: 'Course level'
                },
                {
                    name: 'instructorId',
                    in: 'query',
                    schema: { type: 'string' },
                    description: 'Instructor ID'
                },
                {
                    name: 'minPrice',
                    in: 'query',
                    schema: { type: 'number' },
                    description: 'Minimum price'
                },
                {
                    name: 'maxPrice',
                    in: 'query',
                    schema: { type: 'number' },
                    description: 'Maximum price'
                },
                {
                    name: 'limit',
                    in: 'query',
                    schema: { type: 'integer', default: 20 },
                    description: 'Number of results'
                },
                {
                    name: 'offset',
                    in: 'query',
                    schema: { type: 'integer', default: 0 },
                    description: 'Offset for pagination'
                },
                {
                    name: 'orderBy',
                    in: 'query',
                    schema: { type: 'string', enum: ['createdAt', 'price', 'title'] },
                    description: 'Order by field'
                },
                {
                    name: 'orderDirection',
                    in: 'query',
                    schema: { type: 'string', enum: ['ASC', 'DESC'] },
                    description: 'Order direction'
                }
            ],
            responses: {
                200: {
                    description: 'Courses found',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: { $ref: '#/components/schemas/PaginatedCourses' }
                                }
                            }
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
    '/api/courses/my-courses': {
        get: {
            tags: ['Courses'],
            summary: 'Get instructor courses',
            description: 'Retrieves courses created by the authenticated instructor',
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: 'Courses retrieved',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/Course' }
                                    }
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
    '/api/courses/{id}': {
        get: {
            tags: ['Courses'],
            summary: 'Get course by ID',
            description: 'Retrieves a specific course by its ID',
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'string' },
                    description: 'Course ID'
                }
            ],
            responses: {
                200: {
                    description: 'Course retrieved',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: { $ref: '#/components/schemas/Course' }
                                }
                            }
                        }
                    }
                },
                404: {
                    description: 'Course not found',
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
        },
        put: {
            tags: ['Courses'],
            summary: 'Update course',
            description: 'Updates a course (instructor only)',
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'string' },
                    description: 'Course ID'
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/UpdateCourseRequest' }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Course updated',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: { $ref: '#/components/schemas/Course' },
                                    message: { type: 'string', example: 'Course updated successfully' }
                                }
                            }
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
                403: {
                    description: 'Forbidden',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                404: {
                    description: 'Course not found',
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
    '/api/courses/{id}/publish': {
        post: {
            tags: ['Courses'],
            summary: 'Publish course',
            description: 'Publishes a draft course (instructor only)',
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'string' },
                    description: 'Course ID'
                }
            ],
            responses: {
                200: {
                    description: 'Course published',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: { $ref: '#/components/schemas/Course' },
                                    message: { type: 'string', example: 'Course published successfully' }
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
                403: {
                    description: 'Forbidden',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                404: {
                    description: 'Course not found',
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
    '/api/courses/{id}/archive': {
        post: {
            tags: ['Courses'],
            summary: 'Archive course',
            description: 'Archives a published course (instructor only)',
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'string' },
                    description: 'Course ID'
                }
            ],
            responses: {
                200: {
                    description: 'Course archived',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: { $ref: '#/components/schemas/Course' },
                                    message: { type: 'string', example: 'Course archived successfully' }
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
                403: {
                    description: 'Forbidden',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                404: {
                    description: 'Course not found',
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
