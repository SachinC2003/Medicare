import React, { ReactNode, useState } from 'react'
import '../styles/layout.css'
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { adminMenu, createDoctorMenu, userMenu } from '../constants/Role menus';
import { Badge } from 'antd';


type LayoutProps = {
  children: ReactNode;
};
const Layout = ({children}:LayoutProps) => {
  const userData = useSelector((state: any) => state.userData);
  const [collapsed,setCollapsed] = useState(false);
  const location=useLocation();
  const doctorMenu =createDoctorMenu(userData._id)

  const menuToBeRendered = userData.isAdmin? adminMenu : userData.isDoctor? doctorMenu :userMenu;
  return (
    <div className='main'>
      <div className="layout d-flex">
        <div className={`${collapsed ?'collapsed-sidebar':'sidebar'}`}>
          <div className="sidebar-header">
            <h1 className='medicare-logo'>Medicare</h1>
            <h1 className="user-role">{userData.isAdmin? 'admin' : userData.isDoctor? 'doctor' :'user'}</h1>
          </div>
          <div className="menu">
            {menuToBeRendered.map((menu)=>{
              const isActive=location.pathname===menu.path;
              return (
                <div className={`d-flex menu-item ${isActive && 'active-menu-item'}`}>
                  <i className={menu.icon}></i>
                  <Link to={menu.path}>{menu.name}</Link>
                </div>
              )
            })}
          </div>
        </div>
        <div className="content">
          <div className="header">
           {!collapsed &&<i className="ri-close-fill close-icon" onClick={()=>{setCollapsed(true)}}></i>}
           {collapsed &&<i className="ri-menu-fill hamburger-icon" onClick={()=>{setCollapsed(false)}}></i>}
           <div className='d-flex username-notification align-items-centre'>
           <Badge count={userData.notificationCount} >
            <Link to='/notifications' className='notification-icon'>
                <i className="ri-notification-3-fill"></i>
            </Link>
           </Badge>
            {<p className='username'>{userData.name}</p> }
           </div>
          </div>
          <div className="body">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Layout