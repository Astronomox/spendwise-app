// Utility functions for consistent API responses

// Success response format
export const successResponse = (data, message = "Success", meta = {}) => {
    return {
        success: true,
        message,
        data,
        meta,
    };
};

// Error response format
export const errorResponse = (message = "Error") => {
    return {
        success: false,
        message,
    };
};