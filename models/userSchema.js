const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const accountSchema = new Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      unique: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: false,
      unique: false,
    },
    lastName: {
      type: String,
      required: false,
      unique: false,
    },
    habits: [
      {
        goal: String,
        daily: Boolean,
        weekly: Boolean,
        monthly: Boolean,
        progress: Number,
        date: Date,
        buddies: [{ buddyName: String, buddyPhone: Number }],
      },
    ],
    buddies: [{ name: String, phoneNumber: String }],
  },
  {
    timestamps: true,
  }
);

const Account = mongoose.model("Account", accountSchema);
module.exports = Account;
