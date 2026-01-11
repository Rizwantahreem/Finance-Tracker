export const notFound = (req, res, next) => {
  return res.status(404).type("application/problem+json").json({
    title: "Not Found",
    status: 404,
    detail: "The requested resource does not exist",
  });
};
