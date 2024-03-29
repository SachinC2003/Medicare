import React, { useEffect, useState } from 'react'
import Layout from './Layout'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { hideLoading, showLoading } from '../redux/alertSlice'
import { Doctor } from './ProtectedHome'
import { useSelector } from 'react-redux'
import { Button, Col, DatePicker, Row, TimePicker } from 'antd'
import toast from 'react-hot-toast'

const DoctorBooking = () => {
    const params = useParams()
    const userData = useSelector((state: any) => state.userData);
    const [doctor,setDoctor] = useState<Doctor>();
    const [date , setDate] = useState<string>()
    const [time , setTime] = useState<any>()
    const navigate = useNavigate();
    const dispatch = useDispatch();
     
    const bookAppointment = async () => {
      try {
        const token = localStorage.getItem('authToken');
        dispatch(showLoading())
        const response = await axios.post('https://medicare-lyart.vercel.app/api/doctor/bookappointment',{
            doctorid:params.doctorid,
            userid:userData.id,
            doctorInfo:doctor,
            userInfo:userData,
            date:date,
            time:time
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if(response.data.success===true)
        {
            
            dispatch(hideLoading())
            toast.success(response.data.message)
        }
        else 
        {
            dispatch(hideLoading())
            toast.error(response.data.message)
        }
        console.log(response);
      } catch (err:any) {
        console.log(err);
        dispatch(hideLoading())
        if(err.response.data.message)toast.error(err.response.data.message)
        else toast.error("Something went wrong")
      }
    };
    
    useEffect(() => {
        
        const getDoctorData = async () => {
          try {
            const token = localStorage.getItem('authToken');
            dispatch(showLoading())
            const response = await axios.post('https://medicare-lyart.vercel.app/api/doctor/getbyid',{
                doctorid:params.doctorid
            }, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            if(response.data.success===true)
            {
                setDoctor(response.data.data)
                dispatch(hideLoading())
            }
            else 
            {
                dispatch(hideLoading())
                navigate('/protectedhome')
            }
            console.log(response);
          } catch (error) {
            console.log(error);
            dispatch(hideLoading())
            navigate('/protectedhome')
          }
        };
        getDoctorData();
      },[dispatch,navigate,params.doctorid]);
    return (
        <Layout>
            {doctor &&
            <div>
                 <Row gutter={10}>
                  <Col className='p-2' span={12} lg={12} xs={24} sm={24}>
                  <h1 className="page-title">{doctor?.firstName} {doctor?.lastName}</h1>
                    <hr />
                    <h5>Timings</h5>
                    
                    <p className="doctor-card-text">{doctor.timings[0]} to {doctor.timings[1]}</p>

                    <div className="d-flex flex-column">
                      <DatePicker format={'DD-MM-YYYY'} onChange={(value)=>{setDate(value?.format("DD-MM-YYYY"))}}/>
                      <TimePicker format={'HH:mm'} className='mt-3' onChange={(value)=>{setTime(value?.format("HH:mm"))}}/>
                      
                      <Button className='primary-button mt-3' onClick={bookAppointment}>Book appointment</Button>
                    </div>
                  </Col>
                  <Col span={12} lg={12} xs={24} sm={24}>
                    <div className='flex-d p-2 doctor-detailed-info'>
                      <h5 className='page-title'>Detailed Information</h5>
                      <hr />
                      <p className="doctor-card-text"><h6>Specialization:</h6> {doctor.specialization}</p>
                      <p className="doctor-card-text"><h6>Experience:</h6> {doctor.experience} years</p>
                      <p className="doctor-card-text"><h6>Fee per visit:</h6> {doctor.feePerConsultation}</p>
                      <p className="doctor-card-text"><h6>Address:</h6> {doctor.address}</p>
                      <p className="doctor-card-text"><h6>Phone:</h6> {doctor.phoneNumber}</p>
                      <p className="doctor-card-text"><h6>Website:</h6> {doctor.website}</p>
                    </div>
                  </Col>
                </Row>
            </div>     
            }
        </Layout>
    )
}

export default DoctorBooking