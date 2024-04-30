import mongoose from "mongoose";

const Schema = mongoose.Schema;

const taskSchema = new Schema({
    ownerId: {
        type: String,
        required: true,
    },

    task: {
      text: {
        type: String,
        required: true,
      },

      isFinished: {
        type: Boolean,
        required: true,
        default: false,
      },
    },
})

const Task = mongoose.model("Task", taskSchema);

export default Task;