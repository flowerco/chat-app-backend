const mongoose = require('./index').default;
const bcrypt = require('bcrypt');

const SALT_WORK_FACTOR = 10;

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true},
  password: { type: String, required: true },
  userImg: String,
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});


userSchema.pre('save', function(next) { 
  let user = this;
  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();
  
  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
      if (err) return next(err);
  
      // hash the password along with our new salt
      bcrypt.hash(user.password, salt, function(err, hash) {
          if (err) return next(err);
  
          // override the cleartext password with the hashed one
          user.password = hash;
          next();
      });
    }
  )
});


userSchema.methods.comparePassword = function(candidatePassword, cb) {
  const actualPassword = this.password;
  bcrypt.compare(candidatePassword, actualPassword, function(err, isMatch) {
      if (err) return cb(err);
      cb(null, isMatch);
  });
};


const User = mongoose.model('User', userSchema);
  
module.exports = { User };