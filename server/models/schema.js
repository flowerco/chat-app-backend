const mongoose = require('./index').default;
const bcrypt = require('bcrypt');

const SALT_WORK_FACTOR = 10;

const chatSchema = new mongoose.Schema({
  userList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] 
})

chatSchema.post('findOneAndDelete', async function(chat, next) {
  // After deleting a chat, remove the chat ID from any users in that chat.
  const userList = chat.userList.map(user => user._id);
  await User.updateMany({ _id: { $in: userList }}, {
    $pull: {
      chats: chat._id
    }
  });
  next();
})

const Chat = mongoose.model('Chat', chatSchema);

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true},
  password: { type: String, required: true },
  userImg: { type: String, default: '' },
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  chats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
  currentChat: { type: String, default: '' },
  keepTime: {type: Number, default: 10},
  isSearchable: {type: Boolean, default: true}
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

module.exports = { User, Chat };