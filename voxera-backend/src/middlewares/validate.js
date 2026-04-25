const validate = (schema) => {
  return (req, res, next) => {
    // If request has a file and no body text at all, skip validation
    // This allows image-only submissions (comment or post with just a photo)
    if (req.file && (!req.body || Object.keys(req.body).length === 0)) {
      return next();
    }

    const { error } = schema.validate(req.body, {
      abortEarly:   false,
      allowUnknown: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors:  error.details.map((d) => d.message),
      });
    }

    next();
  };
};

module.exports = validate;