
import React from 'react'
import { Doctor } from './ProtectedHome'
import { useNavigate } from 'react-router-dom'
type DoctorCardProps = {
    doctor:Doctor,
    isUser:boolean
  }
const DoctorCard = ({doctor,isUser}:DoctorCardProps) => {
    const navigate =useNavigate()
  return (
    <div>
      {isUser &&
        <div className='cursor-pointer card p-2' onClick={()=>{navigate(`/bookappointment/${doctor._id}`)}}>
        <h1 className="doctor-card-title">{doctor.firstName} {doctor.lastName}</h1>
        <hr />
        <p className="doctor-card-text"><b>Specialization:</b>{doctor.specialization}</p>
        <p className="doctor-card-text"><b>Experience:</b>{doctor.experience}</p>
        <p className="doctor-card-text"><b>Fee per visit:</b>{doctor.feePerConsultation}</p>
        <p className="doctor-card-text"><b>Timings:</b>{doctor.timings[0]} to {doctor.timings[1]}</p>
        </div>
      }
      {!isUser &&
        <div className='cursor-pointer card p-2' onClick={()=>{navigate(`/doctordetail/${doctor._id}`)}}>
        <h1 className="doctor-card-title">{doctor.firstName} {doctor.lastName}</h1>
        <hr />
        <p className="doctor-card-text"><b>Specialization:</b>{doctor.specialization}</p>
        <p className="doctor-card-text"><b>Experience:</b>{doctor.experience}</p>
        <p className="doctor-card-text"><b>Fee per visit:</b>{doctor.feePerConsultation}</p>
        <p className="doctor-card-text"><b>Timings:</b>{doctor.timings[0]} to {doctor.timings[1]}</p>
        </div>
      }
    </div>
    
    
  )
}

export default DoctorCard