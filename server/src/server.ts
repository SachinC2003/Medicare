import express from 'express';
import cors, { CorsOptions } from 'cors'; // Import CorsOptions for type checking
import dotenv from 'dotenv';
dotenv.config();
import './config/dbConfig';
import { router as userRouter } from './routes/userRoutes';
import { router as adminRouter } from './routes/adminRoutes';
import { router as doctorRouter } from './routes/doctorRoutes';
import { router as testRouter } from './routes/testRoute';



const app = express();
const port = process.env.PORT || 7000;

// CORS configuration options
const corsOptions: CorsOptions = {
  origin: '*', // Allow requests from any origin
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE'],
  credentials: true,
};


app.use(cors(corsOptions));


app.use(express.json());
app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.get('/', testRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
