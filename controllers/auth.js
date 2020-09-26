const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Profile = require('../models/profile');
const Session = require('../models/sessionjwt');
const Role = require('../models/role');
const menus = require('../data/menus');

exports.login = async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  try {
    const user = await User.findOne({
      where: { username: username },
      include: [Profile],
    });
    if (!user) {
      const error = new Error('Username atau password salah!');
      error.statusCode = 401;
      return next(error);
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Username atau password salah!');
      error.statusCode = 401;
      return next(error);
    }
    const token = jwt.sign(
      {
        username: user.username,
        userId: user.id,
      },
      'thisisalongsecretpasswordjwt',
      { expiresIn: '3h' }
    );
    const getRoles = await Role.findAll({
      attributes: ['id', 'roleName', 'arrAuthorities'],
    });
    let aS;
    let userRoles = [];
    let menu = [];
    let subm = [];
    if (user.arrRoles === 'SA') {
      userRoles = ['SA'];
      let newObj0 = {};
      let newObj1 = {};
      let newObj2 = {};
      menus.forEach((m) => {
        if (m.subm.length > 0) {
          newObj0 = {
            id: m.id,
            v: true,
            c: false,
            u: false,
            d: false,
          };
          menu.push(newObj0);
          m.subm.forEach((item) => {
            newObj1 = {
              id: item.id,
              v: true,
              c: true,
              u: true,
              d: true,
            };
            subm.push(newObj1);
          });
        } else {
          newObj2 = {
            id: m.id,
            v: true,
            c: true,
            u: true,
            d: true,
          };
          menu.push(newObj2);
        }
      });
      aS = JSON.stringify([...menu, ...subm]);
    } else if (user.arrRoles === null || user.arrRoles.length < 1) {
      aS = JSON.stringify([...menu, ...subm]);
    } else {
      userRoles = user.arrRoles.split(',');
      const arrDetails = getRoles;
      const setAuth = [];
      arrDetails.forEach((auth) => {
        for (let i = 0; i < userRoles.length; i++) {
          if (auth.id + '' === userRoles[i] + '') {
            setAuth[setAuth.length] = {
              detail: JSON.parse(auth.arrAuthorities),
            };
          }
        }
      });
      const detail = [];
      setAuth.forEach((auth) => {
        const newObj = auth.detail;
        detail.push(newObj);
      });
      const detailMenu = [];
      const detailSubm = [];
      detail.forEach((detail) => {
        detailMenu.push(detail[0]);
        detailSubm.push(detail[1]);
      });
      if (detailMenu.length > 0) {
        for (let i = 0; i < detailMenu.length; i++) {
          if (i === 0) {
            menu = detailMenu[0];
          } else {
            for (let j = 0; j < detailMenu[i].length; j++) {
              let v = false;
              let c = false;
              let u = false;
              let d = false;
              if (menu[j].v === true || detailMenu[i][j].v === true) {
                v = true;
              }
              if (menu[j].c === true || detailMenu[i][j].c === true) {
                c = true;
              }
              if (menu[j].u === true || detailMenu[i][j].u === true) {
                u = true;
              }
              if (menu[j].d === true || detailMenu[i][j].d === true) {
                d = true;
              }
              menu[j].v = v;
              menu[j].c = c;
              menu[j].u = u;
              menu[j].d = d;
            }
          }
        }
      }
      if (detailSubm.length > 0) {
        for (let i = 0; i < detailSubm.length; i++) {
          if (i === 0) {
            subm = [...detailSubm[0]];
          } else {
            let newObj1;
            let newObj2;
            if (detailSubm[i].length > subm.length) {
              newObj1 = detailSubm[i];
              newObj2 = subm;
            } else {
              newObj1 = subm;
              newObj2 = detailSubm[i];
            }
            for (let j = 0; j < newObj1.length; j++) {
              let checkNewObj2 = newObj2.filter((obj) => {
                return obj.id + '' === newObj1[j].id + '';
              })[0];
              let v = false;
              let c = false;
              let u = false;
              let d = false;
              if(checkNewObj2) {
                id = checkNewObj2.id;
                v = checkNewObj2.v;
                c = checkNewObj2.c;
                u = checkNewObj2.u;
                d = checkNewObj2.d;
                if(newObj1[j].v === true) {
                  v = true;
                }
                if(newObj1[j].c === true) {
                  v = true;
                }
                if(newObj1[j].u === true) {
                  v = true;
                }
                if(newObj1[j].d === true) {
                  v = true;
                }
                let newSubm = subm.filter((sub) => {
                  return sub.id !== id;
                });
                subm = [...newSubm, ...[{id: id, v: v, c: c, u: u, d: d}]];
              } else {
                id = newObj1[j].id;
                v = newObj1[j].v;
                c = newObj1[j].c;
                u = newObj1[j].u;
                d = newObj1[j].d;
                subm = [...subm, ...[{id: id, v: v, c: c, u: u, d: d}]];
              }
            }
          }
        }
      }
      aS = JSON.stringify([...menu, ...subm]);
    }
    const userSession = await Session.findOne({
      where: { userId: user.id },
    });
    if (!userSession) {
      const newUserSession = new Session({
        token: token,
        userId: user.id,
        aS: aS,
      });
      newUserSession.save();
    }
    const authScope = await Session.update(
      { token: token, aS: aS },
      { where: { userId: user.id } }
    );
    if (!authScope) {
      const error = new Error('Set authority failed!');
      error.statusCode = 404;
      return next(error);
    }
    const setUser = {
      token: token,
      userId: user.id,
      arrRoles: user.arrRoles,
      arrAuth: { arrRoles: userRoles, detail: { m: menu, subm: subm } },
      name: user.profile.name,
      mainPhoto: user.profile.mainPhoto,
      username: user.username,
    };
    res.status(200).json({
      user: setUser,
      menus: menus,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
