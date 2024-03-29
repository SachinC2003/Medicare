import React, { useEffect, useState } from 'react'
import Layout from './Layout'
import { useDispatch } from 'react-redux';
import { hideLoading, showLoading } from '../redux/alertSlice';
import axios from 'axios';
import toast from 'react-hot-toast';
import DoctorCard from './DoctorCard';
import { Col, Row } from 'antd';
import { useSelector } from 'react-redux';


export type Doctor ={
  address: string,
  createdAt: string,
  experience: number,
  feePerConsultation:number,
  firstName:string
  lastName:string
  phoneNumber:string
  specialization:string
  status:string
  timings:Array<string>
  updatedAt:string
  userid:string
  website:string
  __v:number
  _id:string
} 
const ProtectedHome = () => {
  const [approvedDoctors,setApprovedDoctors] = useState<Doctor[]>([]);
  const userData = useSelector((state: any) => state.userData);
  const dispatch = useDispatch();
   
  useEffect(() => {
    const getDoctors = async () => {
      try {
        const token = localStorage.getItem('authToken');
        dispatch(showLoading())
        const response = await axios.get('https://medicare-lyart.vercel.app/api/user/getallapproveddoctors', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if(response.data.success===true)
        {
          dispatch(hideLoading())
          setApprovedDoctors(response.data.data.approvedDoctors);
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
  },[dispatch]);
  return (
    <Layout>
      <h1 className="page-title">Our Doctors</h1>
      <hr />
      <Row gutter={20}>
        {approvedDoctors.map((doctor)=>(
          <Col span={8} xs={24} sm={24} lg={8}>
            <DoctorCard doctor={doctor} isUser={!(userData.isAdmin || userData.isDoctor)}/>
          </Col>)
        )}
      </Row>
      
    </Layout>
  )
}

export default ProtectedHome