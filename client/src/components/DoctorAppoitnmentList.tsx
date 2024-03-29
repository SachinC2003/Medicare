import { Table } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react' 
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { hideLoading, showLoading } from '../redux/alertSlice';
const DoctorAppointmentList = () => {
  const [appointments,setAppointments] = useState([]);
  const dispatch = useDispatch();
   
  const changeappointmentstatus = async (doctorid:string, clientuserid:string ,appointment_id:string,status:string)=>{
    try {  
      const token = localStorage.getItem('authToken');
      dispatch(showLoading())
      const response = await axios.post('https://medicare-lyart.vercel.app/api/doctor/changeappointmentstatus', {
        doctorid:doctorid,
        appointment_id:appointment_id,
        status:status,
        clientuserid:clientuserid
    },{
      headers: {
        'Authorization':`Bearer ${token}`,
      },
    });
      dispatch(hideLoading())
      if(response.data.success===true)
      {
        toast.success(response.data.message)
        setAppointments(response.data.data?.appointments); 
      }
      else{
        toast.error(response.data.message)
      }
      console.log(response);
    } catch (error:any) {
      console.log(error);
      dispatch(hideLoading())
      if(error.response.data.message)toast.error(error.response.data.message)
      else toast.error("Something went wrong")
    }
  }
   const columns =[
    {
        title:'User',
        dataIndex:'name',
        render:(text:any,record:any)=>
        (
          <div>{record.userInfo.name}</div>
        )
    },
    {
      title:'Date',
      dataIndex:'date'
    },
    {
        title:'Time',
        dataIndex:'time'
    },
    {
      title:'Status',
      dataIndex:'status',
      render:(text:any,record:any)=>
        (
            <div className='d-flex'>
                    {record.status === 'Pending' && <h6 style={{ color: '#dea302' }}>Pending</h6>}
                    {record.status === 'Approved' && <h6 style={{ color: 'green' }}>Approved</h6>}
                    {record.status === 'Disapproved' && <h6 style={{ color: 'red' }}>Disapproved</h6>}
            </div>
        )
    },
    {
        title:'Actions',
        dataIndex:'actions',
        render:(text:any,record:any)=>
        (
            <div className='d-flex'>
                <div className="anchor">
                    {record.status==='Pending' && <h6 style={{ color: 'green' }} onClick={()=>{changeappointmentstatus(record.doctorid,record.userid,record._id,'Approved')}}>Approve</h6>}
                    {record.status==='Approved' && <h6 style={{ color: 'red' }} onClick={()=>{changeappointmentstatus(record.doctorid,record.userid,record._id,'Disapproved')}}>Disapprove</h6>}
                    {record.status==='Disapproved' && <h6 style={{ color: 'green' }} onClick={()=>{changeappointmentstatus(record.doctorid,record.userid,record._id,'Approved')}}>Reapprove</h6>}
                </div>
            </div>
        )
    }
  ] 
  useEffect(() => {
      const getAppointments = async () => {
        try {
          const token = localStorage.getItem('authToken');
          dispatch(showLoading())
          const response = await axios.get('https://medicare-lyart.vercel.app/api/doctor/getallappointments', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if(response.data.success===true)
          {
            dispatch(hideLoading())
            setAppointments(response.data.data?.appointments);
          }
          else{
            dispatch(hideLoading())
            toast.error(response.data.message)
          }
          console.log(response);
        } catch (error:any) {
          dispatch(hideLoading())
          console.log(error);
          if(error.response.data.message)toast.error(error.response.data.message)
          else toast.error("Something went wrong")
        }
      };
      getAppointments();
    },[dispatch]);

   
  return (
      <div>
          <h1 className='page-title'>Your Appointments</h1>
          <Table columns={columns} dataSource={appointments}>

          </Table>
      </div>
  )
}
export default DoctorAppointmentList