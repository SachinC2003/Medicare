import React from 'react'
import Layout from './Layout'
import UserAppointmentList from './UserAppointmentList'

const UserAppoinment = () => {
  return (
    <div>
        <Layout>
            <UserAppointmentList></UserAppointmentList>
        </Layout>
    </div>
  )
}

export default UserAppoinment