require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { connectDB } = require('./config/mongoConnect');
const { connectMySQL } = require('./config/mySqlConnect');

const userRouter = require('./router/userRoute');
const productRoutes = require("./router/productRoute");
const orderRoutes = require('./router/orderRoutes');
const weatherRoutes = require('./router/weatherRoutes')

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/user', userRouter);
app.use('/api/product', productRoutes);
app.use('/api/orders', orderRoutes);
app.use("/api/weather", weatherRoutes);

async function startServer() {
  try {
    // MongoDB Connect
    await connectDB();

    // MySQL Connect
    await connectMySQL();

    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Startup Error:', error);
    process.exit(1);
  }
}

startServer();