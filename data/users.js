const dataUsers = [
  {
    id: 1,
    username: 'arief.widiatmoko',
    roles: 'SA',
    logs: JSON.stringify([
      {
        action: 'create',
        user: { id: 0, username: 'System' },
        time: new Date().toISOString(),
      },
    ]),
    profile: {
      code: 'SUPER-ADMIN',
      type: 'Administrator',
      name: 'Arief',
      fullname: 'Arief widiatmoko',
      gender: 'male',
      pob: 'Kebumen',
      dob: '1984-07-10',
      phone: '08974743477',
      email: 'ariefwidiatmoko@gmail.com',
      address: 'Bojonggede, Bogor Jawa Barat',
      occupation: 'Worker',
      joinDate: new Date().toISOString(),
      memberStatus: false,
      activeStatus: false,
      maritalStatus: 'Menikah',
      religion: 'Islam',
      hobbies: 'Film,Game,Liburan',
      about: `Coding is my second nature, and it's natural`,
      userId: 1,
      logs: JSON.stringify([
        {
          action: 'create',
          user: { id: 0, username: 'System' },
          time: new Date().toISOString(),
        },
      ]),
    },
  },
];

module.exports = dataUsers;
