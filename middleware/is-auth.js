const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error = new Error(`Anda tidak memiliki otoritas!`);
    error.statusCode = 401;
    throw error;
  }
  const token = req.get('Authorization').split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, 'thisisalongsecretpasswordjwt');
  } catch (error) {
    let statusCode;
    if (error.message === "jwt expired") {
      statusCode = 401;
    }
    error.statusCode = statusCode || 500;
    throw error;
  }
  if (!decodedToken) {
    const error = new Error(`Anda tidak memiliki otoritas!`);
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
};
