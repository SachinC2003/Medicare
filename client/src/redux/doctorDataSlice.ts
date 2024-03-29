import {createSlice} from '@reduxjs/toolkit'
export const doctorDataSlice = createSlice(
    {
        name:"doctorData",
        initialState:{
          userid:"",
          firstName:"",
          lastName:"",
          phoneNumber:"",
          website:"",
          address:"",
          specialization:"",
          experience:0,
          feePerConsultation:0,
          timings:[],
          status:""
        },
        reducers: {
            storeDoctor: (state, action) => {
              state.userid=action.payload.userid;
              state.firstName = action.payload.firstName;
              state.lastName = action.payload.lastName;
              state.phoneNumber = action.payload.phoneNumber;
              state.website = action.payload.website;
              state.address = action.payload.address;
              state.specialization = action.payload.specialization;
              state.experience = action.payload.experience;
              state.feePerConsultation = action.payload.feePerConsultation;
              state.timings = action.payload.timings;
              state.status = action.payload.status;
            },
            deleteDoctor: (state) => {
              state.userid="";
              state.firstName="";
              state.lastName="";
              state.phoneNumber="";
              state.website="";
              state.address="";
              state.specialization="";
              state.experience=0;
              state.feePerConsultation=0;
              state.timings=[];
              state.status="";
            },
          },
        
    }
)

export const {storeDoctor,deleteDoctor} =doctorDataSlice.actions