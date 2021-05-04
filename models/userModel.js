const crypto = require('crypto');
const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: [18, 'a user name must have an equal or less 18 characters'],
    minlength: [3, 'a user name must have an equal or more 3 characters'],
  },
  email: {
    type: String,
    required: [true, 'User must have email'],
    unique: true,
    lowercase: true,
    validate: [isEmail, 'Email field must be a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  password: {
    type: String,
    required: true,
    maxlength: [14, 'a user password must have an equal or less 14 characters'],
    minlength: [8, 'a user password must have an equal or more 8 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: true,
    maxlength: [14, 'a user password must have an equal or less 14 characters'],
    minlength: [8, 'a user password must have an equal or more 8 characters'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  // Only run if password was modified
  if (!this.isModified('password')) return next();
  // Hash with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  // because sometimes happens that token creating with delay
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function(next) {
  this.find({active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return bcrypt.compare(candidatePassword,userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  let changedTimestamp;
  console.log( this.passwordChangedAt);
  if ( this.passwordChangedAt, JWTTimestamp ){
    changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000);
  }
  // false means not changed
  return JWTTimestamp < changedTimestamp;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
}

const User = mongoose.model('User', userSchema);
module.exports = User;
