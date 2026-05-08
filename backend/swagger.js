import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SpendWise API',
            version: '1.0.0',
            description: 'API for SpendWise application, allowing users to register, login, and manage their spending habits with analytics',
            contact: {
                name: 'API Support',
                email: 'support@spendwise.com',
            },
            license: {
                name: 'MIT',
            },
        },
        servers: [
            {
                url: 'http://localhost:5002',
                description: 'Development server',
            },
            {
                url: 'https://spendwise-app-39vv.onrender.com',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT token received from login or signup',
                },
            },
            schemas: {
                // Auth Schemas
                SignUpInput: {
                    type: 'object',
                    required: ['fullName', 'email', 'password'],
                    properties: {
                        fullName: {
                            type: 'string',
                            example: 'John Doe',
                            minLength: 1,
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'user@example.com',
                        },
                        password: {
                            type: 'string',
                            example: 'strongPassword123',
                            minLength: 6,
                        },
                    },
                },
                LoginInput: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'user@example.com',
                        },
                        password: {
                            type: 'string',
                            example: 'strongPassword123',
                        },
                    },
                },
                GoogleAuthInput: {
                    type: 'object',
                    required: ['idToken'],
                    properties: {
                        idToken: {
                            type: 'string',
                            description: 'Google ID token from authentication',
                        },
                    },
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        email: { type: 'string', format: 'email' },
                        fullName: { type: 'string' },
                        token: { type: 'string', description: 'JWT authentication token' },
                        success: { type: 'boolean' },
                    },
                },
                // Transaction Schemas
                TransactionInput: {
                    type: 'object',
                    required: ['amount', 'type'],
                    properties: {
                        amount: {
                            type: 'number',
                            format: 'double',
                            example: 50.50,
                            description: 'Amount in Naira',
                        },
                        categoryId: {
                            type: 'string',
                            format: 'uuid',
                            description: 'Optional category ID. If not provided, category will be auto-detected',
                        },
                        description: {
                            type: 'string',
                            example: 'Grocery shopping at Shoprite',
                            description: 'Transaction description (used for auto-categorization)',
                        },
                        type: {
                            type: 'string',
                            enum: ['EXPENSE', 'INCOME'],
                            example: 'EXPENSE',
                        },
                    },
                },
                Transaction: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        userId: { type: 'string', format: 'uuid' },
                        amountKobo: {
                            type: 'integer',
                            description: 'Amount in Kobo (1 Naira = 100 Kobo)',
                        },
                        amountNaira: {
                            type: 'number',
                            format: 'double',
                            example: 50.50,
                        },
                        type: { type: 'string', enum: ['EXPENSE', 'INCOME'] },
                        description: { type: 'string' },
                        categoryId: { type: 'string', format: 'uuid' },
                        categoryName: { type: 'string', example: 'Groceries' },
                        transactionDate: { type: 'string', format: 'date-time' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                TransactionList: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Transaction' },
                        },
                        pagination: {
                            type: 'object',
                            properties: {
                                page: { type: 'integer' },
                                limit: { type: 'integer' },
                                total: { type: 'integer' },
                            },
                        },
                    },
                },
                // Analytics Schemas
                CategoryAnalytics: {
                    type: 'object',
                    properties: {
                        categoryName: { type: 'string' },
                        totalSpent: { type: 'number', format: 'double' },
                        percentage: { type: 'number', format: 'double' },
                        transactionCount: { type: 'integer' },
                    },
                },
                AnalyticsResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: {
                            type: 'object',
                            properties: {
                                totalIncome: { type: 'number', format: 'double' },
                                totalExpenses: { type: 'number', format: 'double' },
                                netBalance: { type: 'number', format: 'double' },
                                byCategory: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/CategoryAnalytics' },
                                },
                                transactionCount: { type: 'integer' },
                            },
                        },
                    },
                },
                BurnRateResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: {
                            type: 'object',
                            properties: {
                                dailyBurnRate: { type: 'number', format: 'double' },
                                projectedMonthlyBurn: { type: 'number', format: 'double' },
                                daysAnalyzed: { type: 'integer' },
                                totalExpenses: { type: 'number', format: 'double' },
                            },
                        },
                    },
                },
                // Error Response
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        success: { type: 'boolean', example: false },
                    },
                },
                ValidationError: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Validation failed' },
                    },
                },
                SMSIngestInput: {
                    type: 'object',
                    required: ['message'],
                    properties: {
                        message: {
                            type: 'string',
                            example: 'Credit alert: N5000 received from XYZ',
                            description: 'Raw SMS message text for parsing amount, type, category',
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        swaggerOptions: {
            persistAuthorization: true,
            displayOperationId: true,
        },
    }));
};
