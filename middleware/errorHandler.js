import { logEvents } from "./logEvents.js";

const errorHandler = (err, req, res, _next) => {
    console.error(err.stack);
    logEvents(`${err.name}: ${err.message}`, 'errorLog.txt');
    res.status(500).json({ error: 'Something went wrong!', timestamp: new Date().toISOString() });

}

export default errorHandler;