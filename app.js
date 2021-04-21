const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./util/database');
const Saving = require('./models/saving');
const Loan = require('./models/loan');
const Installment = require('./models/installment');
const Reception = require('./models/reception');
const Transaction = require('./models/transaction');
const Account = require('./models/account');
const Autojournal = require('./models/autojournal');
const User = require('./models/user');
const Role = require('./models/role');
const Profile = require('./models/profile');
const Sessionjwt = require('./models/sessionjwt');
const Recyclebin = require('./models/recyclebin');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const savingRoutes = require('./routes/saving');
const loanRoutes = require('./routes/loan');
const installmentRoutes = require('./routes/installment');
const receptionRoutes = require('./routes/reception');
const journalRoutes = require('./routes/journal');
const accountRoutes = require('./routes/account');
const autoJournalRoutes = require('./routes/autojournal');
const memberRoutes = require('./routes/member');
const staffRoutes = require('./routes/staff');
const supervisorRoutes = require('./routes/supervisor');
const managerRoutes = require('./routes/manager');
const userRoutes = require('./routes/user');
const roleRoutes = require('./routes/role');
const recyclebinRoutes = require('./routes/recyclebin');

const dataUsers = require('./data/users');

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '');
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.json());
app.use(
  multer({
    storage: fileStorage,
    fileFilter: fileFilter,
  }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/staffs', staffRoutes);
app.use('/api/supervisors', supervisorRoutes);
app.use('/api/managers', managerRoutes);
app.use('/api/savings', savingRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/installments', installmentRoutes);
app.use('/api/receptions', receptionRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/auto-journals', autoJournalRoutes);
app.use('/api/users', userRoutes);
app.use('/api/recyclebins', recyclebinRoutes);
app.use('/api/roles', roleRoutes);

app.use(helmet());

app.use((err, req, res, next) => {
  console.log('Error middleware => ' + err);
  const status = err.statusCode || 500;
  const message = err.message;
  res.status(status).json({ message: message });
});

// User has 1 Profile
Profile.belongsTo(User);
User.hasOne(Profile);
// Member has M Saving
Profile.hasMany(Saving);
Saving.belongsTo(Profile);
// Saving has 1 Transaction
Saving.belongsTo(Transaction);
Transaction.hasOne(Saving);
// Member has M Loan
Profile.hasMany(Loan);
Loan.belongsTo(Profile);
// Loan has 1 Transaction
Loan.belongsTo(Transaction);
Transaction.hasOne(Loan);
// Loan has M Installment
Installment.belongsTo(Loan);
Loan.hasMany(Installment);
// Transaction has 1 Reception
Reception.belongsTo(Transaction);
Transaction.hasOne(Reception);
// User has 1 Sesionjwt
Sessionjwt.belongsTo(User);
User.hasOne(Sessionjwt);

sequelize
  // reset database if sync > force : true
  // .sync({ force: true }) 
  .sync()
  .then((result) => {
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      bcrypt
        .hash('secret', 12)
        .then((hashPass) => {
          let newUser = dataUsers[0];
          newUser.password = hashPass;
          const user = new User(newUser);
          return user.save();
        })
        .then((user) => {
          const profile = new Profile(dataUsers[0].profile);
          return profile.save();
        })
        .catch((err) => console.log(err));
    }
    return user;
  })
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
