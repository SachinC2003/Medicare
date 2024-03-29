const createDoctorMenu = (userid:string) => [
  {
    name: 'Home',
    path: '/protectedhome',
    icon: 'ri-home-line',
  },
  {
    name: 'Appointments',
    path: '/doctor/appointments',
    icon: 'ri-file-list-line',
  },
  {
    name: 'Profile',
    path: `/doctor/profile`,
    icon: 'ri-user-fill',
  },
  {
    name: 'Logout',
    path: '/logout',
    icon: 'ri-logout-box-line',
  },
];

export default createDoctorMenu;
