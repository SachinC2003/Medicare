import { Table } from 'antd';
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { hideLoading, showLoading } from '../redux/alertSlice';

const UserList = () => {
   
  const changeuserstatus = async (userid:string,status:string)=>{
    try {  
      const token = localStorage.getItem('authToken');
      dispatch(showLoading())
      const response = await axios.post('https://medicare-lyart.vercel.app/api/admin/changeuserstatus', {
      userid:userid,
      status:status
    },{
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
      dispatch(hideLoading())
      if(response.data.success===true)
      {
        toast.success(response.data.message)
        setUsers(response.data.data.users); 
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
  
    const [users,setUsers] = useState([]);
    const dispatch = useDispatch();
    useEffect(() => {
        const getUsers = async () => {
          try {
            const token = localStorage.getItem('authToken');
            dispatch(showLoading())
            const response = await axios.get('https://medicare-lyart.vercel.app/api/admin/getallusers', {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            if(response.data.success===true)
            {
              dispatch(hideLoading())
              setUsers(response.data.data.users);
              
            }
            else{
              dispatch(hideLoading())
                toast.error(response.data.message)
                
            }
            console.log(response);
          } catch (error) {
            dispatch(hideLoading())
            console.log(error);
            toast.error("Something went wrong")
          }
        };
        getUsers();
      },[dispatch]);

      const columns =[
        {
            title:'Name',
            dataIndex:'name'
        },
        {
            title:'Email',
            dataIndex:'email'
        },
        {
          title:'Status',
          dataIndex:'status',
          render:(text:any,record:any)=>
            (
                <div className='d-flex'>
                        {record.status === 'Ok' && <h6 style={{ color: 'green' }}>Ok</h6>}
                        {record.status === 'Blocked' && <h6 style={{ color: 'red' }}>Blocked</h6>}
                </div>
            )
        },
        {
            title:'Created at',
            dataIndex:'createdAt'
        },
        {
            title:'Actions',
            dataIndex:'actions',
            render:(text:any,record:any)=>
            (
                <div className='d-flex'>
                    <div className="anchor">
                    {record.status==='Blocked' && <h6 style={{ color: 'green' }} onClick={()=>{changeuserstatus(record._id,'Ok')}}>Unblock</h6>}
                    {record.status==='Ok' && <h6 style={{ color: 'red' }} onClick={()=>{changeuserstatus(record._id,'Blocked')}}>Block</h6>}
                    </div>
                </div>
            )
        }
      ]
    return (
        <div>
            <h1 className='page-title'>Users List</h1>
            <Table columns={columns} dataSource={users}>

            </Table>
        </div>
    )
}

export default UserList