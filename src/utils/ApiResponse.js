// Custom class `ApiResponse` for creating consistent response structures
class ApiResponse {
    // Constructor method for creating instances of the `ApiResponse` class
    constructor(statusCode, data, message = "Success") {
        // Setting properties specific to the `ApiResponse` class
        this.statusCode = statusCode;               // HTTP status code property
        this.data = data;                           // Data property containing the response data
        this.message = message;                     // Message property describing the result (default is "Success")
        this.success = statusCode < 400;            // Boolean property indicating if the operation was successful
    }
}

// Exporting the `ApiResponse` class for use in other parts of the application
export { ApiResponse };
