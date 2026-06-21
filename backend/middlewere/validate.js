const { z } = require("zod");

const validate = (schema) => async (req, res, next) => {
  try {
    const validatedData = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    req.body = validatedData.body;
    req.query = validatedData.query;
    req.params = validatedData.params;
    return next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid input data",
        errors: error.errors.map(err => ({ field: err.path.join('.'), message: err.message })),
      });
    }
    return res.status(500).json({ message: "Internal server error during validation" });
  }
};

module.exports = validate;
