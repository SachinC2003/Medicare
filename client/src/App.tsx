import { BrowserRouter, Route , Routes } from "react-router-dom";
import React from 'react';
import { Notifications,ApplyDoctor, Home, Login, Logout, ProtectedHome, ProtectedRoute, Register, AdminUsers, AdminDoctors, DoctorProfile, DoctorBooking, DoctorAppointments, DoctorDeails } from "./components";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import UserAppoinment from "./components/UserAppoinment";



function App() {
  const {loading}= useSelector((state:any)=>state.alerts)
  return (
    <div >
      <BrowserRouter>
      {loading && <div className="spinner-parent">
        <div className="spinner-border text-primary" role="status"/>
      </div>}
        <Toaster position="top-center" reverseOrder={false}/>
        <Routes> 
          <Route path="/" element={<Home/>}></Route>
          <Route path="/home" element={<Home/>}></Route>
          <Route path="/login" element={<Login/>}></Route>
          <Route path="/register" element={<Register/>}></Route>
          <Route path="/protectedhome" element={<ProtectedRoute ><ProtectedHome/></ProtectedRoute>} />
          <Route path="/applydoctor" element={<ProtectedRoute ><ApplyDoctor/></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute ><Notifications/></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute ><AdminUsers/></ProtectedRoute>} />
          <Route path="/admin/doctors" element={<ProtectedRoute ><AdminDoctors/></ProtectedRoute>} />
          <Route path="/doctor/profile" element={<ProtectedRoute ><DoctorProfile /></ProtectedRoute>} />
          <Route path="/bookappointment/:doctorid" element={<ProtectedRoute ><DoctorBooking /></ProtectedRoute>} />
          <Route path="/doctordetail/:doctorid" element={<ProtectedRoute ><DoctorDeails/></ProtectedRoute>} />
          <Route path="/doctor/appointments" element={<ProtectedRoute ><DoctorAppointments /></ProtectedRoute>} />
          <Route path="/user/appointments" element={<ProtectedRoute ><UserAppoinment /></ProtectedRoute>} />
          <Route path="/logout" element={<Logout/>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
