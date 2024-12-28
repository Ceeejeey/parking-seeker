// keeperSeeder.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Keeper = require('./models/keeper'); // Import your Keeper model with correct case

// Database connection
mongoose.connect(process.env.MONGO_URI, {
  // You can remove these deprecated options as per the warning
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error: ', err));

const seedKeepers = async () => {
  try {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash('Psw0530', 10);

    const keepers = [
      {
        KID: 'K01',
        username: 'Shanaka Wijewardhana',
        email: 'ngshanaka0530@gmail.com',
        nic: '200015100520',
        tpno: '0761824607',
        address: '25, Dombagammana, Poojapitiya',
        password: hashedPassword,
      },
      // Add more keeper entries as needed
    ];

    // Insert all keepers into the database
    await Keeper.insertMany(keepers); // Corrected the model name to 'Keeper'
    console.log('Keepers seeded successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding keepers:', error);
    mongoose.connection.close();
  }
};

seedKeepers();
