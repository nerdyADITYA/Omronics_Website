import morgan from 'morgan';

// Custom morgan logging format
export const httpLogger = morgan(':method :url :status :res[content-length] - :response-time ms');
