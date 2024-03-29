import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { deleteUser } from '../redux/userDataSlice';
import { useNavigate } from 'react-router-dom';


const Logout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    useEffect(()=>{
        dispatch(deleteUser())
        localStorage.setItem('authToken','');
        navigate('/')
    })
    return (
        <></>
    )
}

export default Logout