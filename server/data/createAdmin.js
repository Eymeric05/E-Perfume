const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const createAdmin = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/e-parfume';
    
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');

    // Vérifier si l'admin existe déjà
    let adminUser = await User.findOne({ email: 'admin@eparfume.com' });
    
    if (adminUser) {
      if (adminUser.isAdmin) {
        console.log('✅ Admin user already exists:');
        console.log(`   Email: ${adminUser.email}`);
        console.log(`   Name: ${adminUser.name}`);
        console.log(`   Is Admin: ${adminUser.isAdmin}`);
      } else {
        // Mettre à jour l'utilisateur pour le rendre admin
        adminUser.isAdmin = true;
        await adminUser.save();
        console.log('✅ User updated to admin');
      }
    } else {
      // Créer l'admin
      adminUser = await User.create({
        name: 'Admin',
        email: 'admin@eparfume.com',
        password: 'admin123',
        isAdmin: true,
      });
      console.log('✅ Admin user created:');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Password: admin123`);
      console.log(`   Is Admin: ${adminUser.isAdmin}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();










