const Session = require('../models/sessionjwt');

module.exports = async (authId, key, scope) => {
  const checkSession = await Session.findOne({ where: { userId: authId } });
  if (!checkSession) {
    const error = new Error('Bad Request!');
    error.statusCode = 400;
    return error;
  }
  const aS = JSON.parse(checkSession.aS);
  if (aS[0].length < 1) {
    const error = new Error(`Anda tidak memiliki otoritas!`);
    error.statusCode = 401;
    return error;
  }
  const checAuthScope = aS.filter((auth) => {
    return auth.id === key;
  })[0];
  if (checAuthScope[scope] !== true) {
    const error = new Error(`Anda tidak memiliki otoritas!`);
    error.statusCode = 401;
    return error;
  }
};
