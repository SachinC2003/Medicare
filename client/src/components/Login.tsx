import React from 'react';
import { Button, Form, Input } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { hideLoading, showLoading } from '../redux/alertSlice';


const Login = () => {
  const dispatch=useDispatch();
  const navigate=useNavigate();
   
  const onFinish = async (values:{email: string,password:string})=>{
    try{
      dispatch(showLoading())
      const response = await axios.post('https://medicare-lyart.vercel.app/api/user/login',values);
      dispatch(hideLoading())
      console.log(response);
      if(response?.data.success)
      {
        toast.success(response?.data.message)
        localStorage.setItem('authToken', response?.data.authToken);
        navigate('/protectedhome')
      }
      else 
      {
        console.log(response?.data.message)
        toast.error(response?.data.message)
      }
    }catch(err:any){
      dispatch(hideLoading())
      if(err.response?.data.message)toast.error(err.response?.data.message)
      else toast.error("Something went wrong!")
      console.log(err)
    }
  }
  return (
    <div className='authentication'>
      <div className='authentication-form card p-3' >
        <h1 className='card-title'>Welcome back...</h1>
        <Form layout='vertical' onFinish={onFinish}>
          <Form.Item label="Email" name="email">
            <Input placeholder='Email' />
          </Form.Item>
          <Form.Item label="Password" name="password">
            <Input.Password placeholder='Password' />
          </Form.Item>
          <Button className='primary-button mt-3' htmlType='submit' >
            LOG IN
          </Button>
          <div style={{ fontSize:'16px' ,textAlign: 'center', marginTop: '10px' }}>
            <span>Don't have an account?</span>{' '}
            <Link to="/register" style={{ color: '#0072B5' }}>register here</Link> 
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;
