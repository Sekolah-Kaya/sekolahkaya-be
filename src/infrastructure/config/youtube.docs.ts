export const youtubePaths = {
    '/api/youtube/fetch': {
        post: {
            tags: ['YouTube'],
            summary: 'Fetch YouTube video or playlist data',
            description: 'Fetches data from a YouTube video or playlist URL',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['url'],
                            properties: {
                                url: {
                                    type: 'string',
                                    format: 'uri',
                                    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                                    description: 'YouTube video or playlist URL'
                                },
                                maxPlaylistVideos: {
                                    type: 'integer',
                                    minimum: 1,
                                    maximum: 50,
                                    default: 50,
                                    example: 10,
                                    description: 'Maximum number of videos to fetch from playlist'
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Successful response',
                    content: {
                        'application/json': {
                            schema: {
                                oneOf: [
                                    { $ref: '#/components/schemas/YouTubeVideoResponse' },
                                    { $ref: '#/components/schemas/YouTubePlaylistResponse' }
                                ]
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
                404: {
                    description: 'YouTube content not found',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                429: {
                    description: 'YouTube API quota exceeded',
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
    '/api/youtube/validate': {
        post: {
            tags: ['YouTube'],
            summary: 'Validate YouTube URL',
            description: 'Validates if a URL is a valid YouTube video or playlist URL',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['url'],
                            properties: {
                                url: {
                                    type: 'string',
                                    format: 'uri',
                                    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                                    description: 'YouTube URL to validate'
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Validation result',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    data: {
                                        type: 'object',
                                        properties: {
                                            isValid: { type: 'boolean', example: true }
                                        }
                                    }
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
    '/api/youtube/cache/video/{videoId}': {
        delete: {
            tags: ['YouTube'],
            summary: 'Invalidate video cache',
            description: 'Clears the cache for a specific YouTube video',
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'videoId',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string',
                        example: 'dQw4w9WgXcQ'
                    },
                    description: 'YouTube video ID'
                }
            ],
            responses: {
                200: {
                    description: 'Cache invalidated successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Video cache invalidated successfully' }
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
    '/api/youtube/cache/playlist/{playlistId}': {
        delete: {
            tags: ['YouTube'],
            summary: 'Invalidate playlist cache',
            description: 'Clears the cache for a specific YouTube playlist',
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    name: 'playlistId',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string',
                        example: 'PLxxx'
                    },
                    description: 'YouTube playlist ID'
                }
            ],
            responses: {
                200: {
                    description: 'Cache invalidated successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    message: { type: 'string', example: 'Playlist cache invalidated successfully' }
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
}