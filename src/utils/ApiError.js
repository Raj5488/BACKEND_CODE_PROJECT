// Custom class `ApiError` extending the built-in JavaScript `Error` class
class ApiError extends Error {
    // Constructor method for creating instances of the `ApiError` class
    constructor(
        statusCode,        // HTTP status code for the error
        message = "Something went wrong",  // Default error message
        errors = [],       // Array to store additional error details or validation errors
        stack = ""          // Stack trace for the error
    ) {
        // Calling the constructor of the parent `Error` class with the provided message
        super(message);

        // Setting properties specific to the `ApiError` class
        this.statusCode = statusCode;   // HTTP status code property
        this.data = null;               // Additional data (can be used to attach more information to the error)
        this.message = message;         // Error message property
        this.success = false;           // Indicating that the operation was not successful
        this.errors = errors;           // Array to store errors or validation details

        // Checking if a stack trace is provided
        if (stack) {
            this.stack = stack;         // If provided, set the stack trace for the error
        } else {
            // If not provided, capture the stack trace using the `Error.captureStackTrace` method
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

// Exporting the `ApiError` class for use in other parts of the application
export { ApiError };
