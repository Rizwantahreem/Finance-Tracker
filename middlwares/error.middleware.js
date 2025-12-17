export const errorLogger = (error, req, res, next) => {
    return res.status(error.status || 500).json({"message": error.msg || "Interal server error"});
}