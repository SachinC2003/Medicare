import React, { useEffect, useState } from 'react'
import Layout from './Layout'
import axios from 'axios';
import {Tabs} from 'antd';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { hideLoading, showLoading } from '../redux/alertSlice';
import { useDispatch } from 'react-redux';
import { updateUserNotificationCount } from '../redux/userDataSlice';
type NotificationType ={
    type: string,
    message: string,
    data: {
      doctorId: {
        $oid: string
      },
      name: string
    },
    onClickPath: string
}
const Notifications = () => {
  
    
    const dispatch=useDispatch();
    const navigate = useNavigate();
     
    const [unseenNotifications,setUnseenNotifications] = useState([]);
    const [seenNotifications,setSeenNotifications] = useState([]);
    const markAllRead=async()=>{
      try {  
        const token = localStorage.getItem('authToken');
        dispatch(showLoading())
        const response = await axios.get('https://medicare-lyart.vercel.app/api/user/notifications/markallread', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        dispatch(hideLoading())
        if(response.data.success===true)
        {
          toast.success(response.data.message)
          setSeenNotifications(response.data.data.seenNotifications); 
          setUnseenNotifications(response.data.data.unseenNotifications)
          dispatch(updateUserNotificationCount(
            { 
              notificationCount : response.data.data.unseenNotifications.length,
            }));
        }
        else{
          toast.error(response.data.message)
        }
        console.log(response);
      } catch (error) {
        console.log(error);
        dispatch(hideLoading())
        toast.error("Something went wrong")
      }
    }
    const markOneRead=async(message:string)=>{
      try {  
        const token = localStorage.getItem('authToken');
        console.log(message)
        dispatch(showLoading())
        const response = await axios.post('https://medicare-lyart.vercel.app/api/user/notifications/markoneread', {
        notification_message: message,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
        dispatch(hideLoading())
        if(response.data.success===true)
        {
          toast.success(response.data.message)
          setSeenNotifications(response.data.data.seenNotifications); 
          setUnseenNotifications(response.data.data.unseenNotifications)
          dispatch(updateUserNotificationCount(
            { 
              notificationCount : response.data.data.unseenNotifications.length,
            }));
        }
        else{
          toast.error(response.data.message)
        }
        console.log(response);
      } catch (error) {
        console.log(error);
        dispatch(hideLoading())
        toast.error("Something went wrong")
      }
    }
    const deleteAll=async()=>{
      try {  
        const token = localStorage.getItem('authToken');
        dispatch(showLoading())
        const response = await axios.get('https://medicare-lyart.vercel.app/api/user/notifications/deleteall', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        dispatch(hideLoading())
        if(response.data.success===true)
        {
          toast.success(response.data.message)
          setSeenNotifications(response.data.data.seenNotifications); 
        }
        else{
          toast.error(response.data.message)
        }
        console.log(response);
      } catch (error) {
        console.log(error);
        dispatch(hideLoading())
        toast.error("Something went wrong")
      }
    }
    const deleteOne=async(message:string)=>{
      try {  
        const token = localStorage.getItem('authToken');
        dispatch(showLoading())
        const response = await axios.post('https://medicare-lyart.vercel.app/api/user/notifications/deleteone',{
          notification_message: message,
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        dispatch(hideLoading())
        if(response.data.success===true)
        {
          toast.success(response.data.message)
          setSeenNotifications(response.data.data.seenNotifications); 
        }
        else{
          toast.error(response.data.message)
        }
        console.log(response);
      } catch (error) {
        console.log(error);
        dispatch(hideLoading())
        toast.error("Something went wrong")
      }
    }
    useEffect(() => {
        const getUserNotifications = async () => {
          try {  
            const token = localStorage.getItem('authToken');
            dispatch(showLoading())
            const response = await axios.get('https://medicare-lyart.vercel.app/api/user/notifications', {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            dispatch(hideLoading())
            if(response.data.success===true)
            {
             setSeenNotifications(response.data.data.seenNotifications); 
             setUnseenNotifications(response.data.data.unseenNotifications)
            }
            console.log(response);
          } catch (error) {
            dispatch(hideLoading())
            console.log(error);
          }
        };
        getUserNotifications();
      },[dispatch]);
  return (
    <Layout>
        <h1 className="page-title">Notifications</h1>
        <Tabs>
            <Tabs.TabPane tab={'Unseen'} key={0}>
                <div className="d-flex justify-content-end">
                    <h1 className='notification-global-buttons' onClick={markAllRead}>Mark all as read</h1>
                </div>
                <div className="notifications-list">
                  {unseenNotifications.map((notification:NotificationType)=>{
                    return(<div className='p-2  justify-content-between notification-card' >
                      <div className="notification-message" onClick={()=>{navigate(`${notification.onClickPath}`)}}>{notification?.message}</div>
                      <div className="notification-mark-read" onClick={()=>{markOneRead(notification.message)}}><i className="ri-check-double-fill"></i></div>                
                    </div>)
                  })}
                </div>
            </Tabs.TabPane>
            <Tabs.TabPane tab={'Seen'} key={1}>
                <div className="d-flex justify-content-end ">
                    <h1 className='notification-global-buttons' onClick={deleteAll}>Delete all</h1>
                </div>
                <div className="notifications-list">
                  {seenNotifications.map((notification:NotificationType)=>{
                    return(<div className='p-2 notification-card justify-content-between ' >
                      <div className="notification-message" onClick={()=>{navigate(`${notification.onClickPath}`)}}>{notification?.message}</div>
                      <div className="notification-delete" onClick={()=>{deleteOne(notification.message)}}><i className="ri-delete-bin-fill"></i></div>                
                    </div>)
                  })}
                </div>
            </Tabs.TabPane>
        </Tabs>
    </Layout>
  )
}

export default Notifications