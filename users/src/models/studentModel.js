const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "student must have a name"],
  },
  code: {
    type: String,
    required: [true, "student must have a code"],
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
    required: [true, "student must have an email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "please provide a valid email"],
  },
  photo: {
    type: String,
    default: "default.jpg",
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
  courses: [String],
  passedCourses: [String],
  program: String,
  faculty: String,
  department: String,
  academicYear: String,
});

studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

studentSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) {
    return next();
  }

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

studentSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

studentSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

studentSchema.methods.chagesPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

studentSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(3).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const student = mongoose.model("Student", studentSchema);

module.exports = student;
