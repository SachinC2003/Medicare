import {createSlice} from '@reduxjs/toolkit'
export const userDataSlice = createSlice(
    {
        name:"userData",
        initialState:{
            id:"",
            name:"",
            email:"",
            isAdmin:false,
            isDoctor:false,
            notificationCount:0
        },
        reducers: {
            storeUser: (state, action) => {
              state.id=action.payload.id;
              state.name = action.payload.name;
              state.email = action.payload.email;
              state.isAdmin = action.payload.isAdmin;
              state.isDoctor = action.payload.isDoctor;
              state.notificationCount = action.payload.notificationCount;
            },
            updateUserNotificationCount :(state, action) => {
              return {
                ...state,
                notificationCount: action.payload.notificationCount,
              };
            },
            deleteUser: (state) => {
              state.id="";
              state.name = '';
              state.email = '';
              state.isAdmin = false;
              state.isDoctor = false;  
              state.notificationCount = 0;
            },
          },
        
    }
)

export const {storeUser,deleteUser,updateUserNotificationCount} =userDataSlice.actions