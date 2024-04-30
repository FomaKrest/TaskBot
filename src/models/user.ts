import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
    id: {
        type: String,
        required: true,
    },
    settings: {
      notificationsIntervalMinutes: {
        type: String,
        required: true,
        default: 30
      }
    },
})

const User = mongoose.model("User", userSchema);

export default User;