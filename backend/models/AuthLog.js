const { type } = require("@testing-library/user-event/dist/type");
const mongoose = require("mongoose");

const AuthLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  rollNo: {
    type: String,
    required: true,
  },
  dateTime: {
    type: Date,
    required: true,
  },
});

const AuthenticationLog = mongoose.model("AuthenticationLog", AuthLogSchema);

module.exports = AuthenticationLog;

