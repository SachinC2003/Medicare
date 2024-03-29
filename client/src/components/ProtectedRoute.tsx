import axios from 'axios';
import { ReactNode,  useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { storeUser } from '../redux/userDataSlice';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { storeDoctor } from '../redux/doctorDataSlice';
import moment from 'moment';


type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate =useNavigate();
  const userData = useSelector((state: any) => state.userData);
  const [autharized, setAutharized] = useState(false);
  const dispatch = useDispatch();
   
  useEffect(() => {
    const getUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('https://medicare-lyart.vercel.app/api/user/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if(response.data.success===true)
        {
          if(response.data.data.status === 'Blocked')
          {
            toast.error("You have been blocked.")
            navigate('/home')
          }
          setAutharized(true); 
          dispatch(storeUser(
            { 
              id:response.data.data.id,
              name: response.data.data.name, 
              email: response.data.data.email,
              isAdmin: response.data.data.isAdmin, 
              isDoctor: response.data.data.isDoctor,
              notificationCount : response.data.data.notificationCount,
            }));
        }
        else 
        {
          navigate('/home')
        }
        console.log(response);
        
      } catch (error) {
        console.log(error);
        navigate('/home')
      }
    };
    const getDoctorData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('https://medicare-lyart.vercel.app/api/doctor/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if(response.data.success===true)
        {
          if(response.data.status === 'Disapproved')
          {
            toast.error("You have been Disapproved.")
            navigate('/protectedhome')
          }
          dispatch(storeDoctor(
            { 
              userid:response.data.data.userid,
              firstName:response.data.data.firstName,
              lastName:response.data.data.lastName,
              phoneNumber:response.data.data.phoneNumber,
              website:response.data.data.website,
              address:response.data.data.address,
              specialization:response.data.data.specialization,
              experience:response.data.data.experience,
              feePerConsultation:response.data.data.feePerConsultation,
              timings:[ 
                moment(response.data.data.timings[0],"HH:mm"),
                moment(response.data.data.timings[1],"HH:mm"),
              ],
              status:response.data.data.status,
            }));
        }
        else 
        {
          navigate('/protectedhome')
        }
        console.log(response);
        
      } catch (error) {
        console.log(error);
        navigate('/protectedhome')
      }
    };
    getUserData();
    if(userData.isDoctor){
      getDoctorData();
    }
  },[autharized,dispatch,navigate,userData.isDoctor]);
  return (
    <div>
      {autharized === true && children}
    </div>
  );
};
export default ProtectedRoute;