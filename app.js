const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./util/database');
const Account = require('./models/account');
const User = require('./models/user');
const Role = require('./models/role');
const Profile = require('./models/profile');
const Sessionjwt = require('./models/sessionjwt');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const accountRoutes = require('./routes/account');
const memberRoutes = require('./routes/member');
const userRoutes = require('./routes/user');
const roleRoutes = require('./routes/role');
const recyclebinRoutes = require('./routes/recyclebin');

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
app.use('/api/accounts', accountRoutes);
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

Profile.belongsTo(User);
User.hasOne(Profile, { foreignKey: 'userId' });
User.hasMany(Account, { foreignKey: 'userId' });
Account.belongsTo(User);
Role.belongsTo(User);
User.hasMany(Role, { foreignKey: 'userId' });
Sessionjwt.belongsTo(User);
User.hasOne(Sessionjwt, { foreignKey: 'userId' });

sequelize
  .sync()
  .then((result) => {
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      bcrypt
        .hash('secret', 12)
        .then((hashPass) => {
          const user = new User({
            username: 'arief.widiatmoko',
            password: hashPass,
            arrRoles: 'SA',
            createdBy: 'system',
          });
          return user.save();
        })
        .then((user) => {
          const profile = new Profile({
            code: 'SUPER-ADMIN',
            profileType: 'Administrator',
            name: 'Arief',
            fullname: 'Arief widiatmoko',
            gender: 'male',
            pob: 'Kebumen',
            dob: '1984-07-10',
            phone: '08974743477',
            email: 'ariefwidiatmoko@gmail.com',
            address: 'Bojonggede Bogor Jawa Barat',
            occupation: 'Worker',
            joinDate: new Date().toISOString(),
            activeStatus: true,
            maritalStatus: 'Menikah',
            religion: 'Islam',
            activeStatus: true,
            arrHobbies: 'Movie,Gaming,Vacation',
            about: `Coding is my second nature, and it's natural`,
            userId: user.id,
            createdBy: 'system',
          });
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
