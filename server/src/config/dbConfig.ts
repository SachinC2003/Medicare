import mongoose from 'mongoose';

mongoose.connect(process.env.MONGO_URL!);

mongoose.connection.on('connected', () => {
  console.log('Connected to the database successfully');
});

mongoose.connection.on('error', (err) => {
  console.error(`Database connection error: ${err}`);
});

export default mongoose.connection;
