const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User must have a name"],
  },

  password: {
    type: String,
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "passwords are not the same",
    },
  },
  passwordChangedAt: Date,
  email: {
    type: String,
    required: [true, "User must have an email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "please provide a valid email"],
  },
  photo: {
    type: String,
    default: "1681661549091-default image.png",
  },
  roles: {
    type: [String],
    enum: [
      "instructor",
      "quality coordinator",
      "program coordinator",
      "dean",
      "teaching assistant",
      "system admin",
      "faculty admin",
      "program admin",
      "department admin",
      "department head",
    ],
  },
  role: {
    type: String,
    enum: [
      "instructor",
      "quality coordinator",
      "program coordinator",
      "dean",
      "teaching assistant",
      "system admin",
      "faculty admin",
      "program admin",
      "department admin",
      "department head",
    ],
  },

  passwordResetToken: String,
  passwordResetExpires: Date,

  active: {
    type: Boolean,
    default: true,
    select: false,
  },

  about: {
    type: String,
  },
  courses: [mongoose.Schema.ObjectId],
  program: mongoose.Schema.ObjectId,
  faculty: mongoose.Schema.ObjectId,
  department: mongoose.Schema.ObjectId,
  phoneNumber: String,
});

staffSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

staffSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) {
    return next();
  }

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

staffSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

staffSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

staffSchema.methods.chagesPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

staffSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(3).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const staff = mongoose.model("Staff", staffSchema);

module.exports = staff;
