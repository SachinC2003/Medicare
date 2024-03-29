import React, { useEffect, useState } from 'react'
import Layout from './Layout'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { hideLoading, showLoading } from '../redux/alertSlice'
import { Doctor } from './ProtectedHome'
import { useSelector } from 'react-redux'
import { Col, Row} from 'antd'


const DoctorDeails = () => {
    const params = useParams()
    const userData = useSelector((state: any) => state.userData);
    const [doctor,setDoctor] = useState<Doctor>();
    const navigate = useNavigate();
    const dispatch = useDispatch()
     
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

export default DoctorDeails