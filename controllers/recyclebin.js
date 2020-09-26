const Recyclebin = require('../models/recyclebin');
const authScope = require('../middleware/auth-scope');
// url: /localhost:3000/api/recyclebins method: 'GET'
exports.recyclebinsIndex = async (req, res, next) => {
  try {
    const checkErr = await authScope(req.userId, 'recyclebin', 'v');
    if (checkErr) {
      return next(checkErr);
    }
    let fetchData = await Recyclebin.findAndCountAll();
    if (!fetchData) {
      const error = new Error('Items could not be found!');
      error.statusCode = 404;
      return next(error);
    }
    let fetchCount = fetchData.count;
    let fetchRow = fetchData.rows;
    res.status(200).json({
      message: 'ok',
      result: fetchCount,
      recyclebins: fetchRow,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
