export const successResponse = (data, message = "Success", meta = {}) => {
    return {
        success: true,
        message,
        data,
        meta,
    };
};

export const errorResponse = (message = "Error") => {
    return {
        success: false,
        message,
    };
};