import { Table } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { hideLoading, showLoading } from '../redux/alertSlice';
const DoctorList = () => {
  const [doctors,setDoctors] = useState([]);
  const dispatch = useDispatch();
   
  const changedoctorstatus = async (userid:string,status:string)=>{
    try {  
      const token = localStorage.getItem('authToken');
      dispatch(showLoading())
      const response = await axios.post('https://medicare-lyart.vercel.app/api/admin/changedoctorstatus', {
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
        setDoctors(response.data.data.doctors); 
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
      const getDoctors = async () => {
        try {
          const token = localStorage.getItem('authToken');
          dispatch(showLoading())
          const response = await axios.get('https://medicare-lyart.vercel.app/api/admin/getalldoctors', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if(response.data.success===true)
          {
            dispatch(hideLoading())
            setDoctors(response.data.data.doctors);
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
      getDoctors();
    },[dispatch,setDoctors]);

    const columns =[
      {
          title:'Name',
          dataIndex:'name',
          render:(text:any,record:any)=>
          (
            <div>{record.firstName} {record.lastName}</div>
          )
      },
      {
        title:'Phone',
        dataIndex:'phoneNumber'
      },
      {
        title:'Status',
        dataIndex:'status',
        render:(text:any,record:any)=>
          (
              <div className='d-flex'>
                      {record.status === 'Pending' && <h6 style={{ color: 'yellow' }}>Pending</h6>}
                      {record.status === 'Approved' && <h6 style={{ color: 'green' }}>Approved</h6>}
                      {record.status === 'Disapproved' && <h6 style={{ color: 'red' }}>Disapproved</h6>}
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
                      {record.status==='Pending' && <h6 style={{ color: 'green' }} onClick={()=>{changedoctorstatus(record.userid,'Approved')}}>Approve</h6>}
                      {record.status==='Approved' && <h6 style={{ color: 'red' }} onClick={()=>{changedoctorstatus(record.userid,'Disapproved')}}>Disapprove</h6>}
                      {record.status==='Disapproved' && <h6 style={{ color: 'green' }} onClick={()=>{changedoctorstatus(record.userid,'Approved')}}>Reapprove</h6>}
                  </div>
              </div>
          )
      }
    ]
  return (
      <div>
          <h1 className='page-title'>Doctors List</h1>
          <Table columns={columns} dataSource={doctors}>

          </Table>
      </div>
  )
}
export default DoctorList