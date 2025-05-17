const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
   try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
     const user = new User({
        username: req.body.username,
         password: hashedPassword,
         email: req.body.email,
      });
     await user.save();
     res.status(201).json({ message: 'User registered successfully!' });
   } catch (error) {
     res.status(500).json({ message: error.message });
   }
};

exports.login = async (req, res) => {
   try {
      const user = await User.findOne({ username: req.body.username });
     if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
         res.status(401).json({ message: 'Invalid credentials' });
         return;
     }
     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
     res.json({ message: 'Login successful!', token });
   } catch (error) {
     res.status(500).json({ message: error.message });
   }
};