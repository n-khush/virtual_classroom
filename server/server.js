require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const handleSocket = require("./sockets/classroom");
const mongoose = require("mongoose");

const app = require("./app"); // Import the Express app

app.get("/",(req,res)=>{
    res.json({status:200,message:"Hi it's working..."})
})
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:3000" } }); // Allow specific origin for CORS

const PORT = process.env.PORT;

// io.on("connection", handleSocket); // Handle socket connections with custom logic
// io.on('connection', (socket) => {
//   console.log('New connection')
// })
// mongoose.set('debug', true);
mongoose.connect('mongodb://root:password@localhost:27017/virtual_classroom?authSource=admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(error => {
  console.error('Error connecting to MongoDB:', error);
});

handleSocket(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
