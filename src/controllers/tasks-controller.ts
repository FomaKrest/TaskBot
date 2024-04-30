import { ObjectId } from "mongodb";
import Task from "../models/task.js";

const addTask = (userId: number, taskText: string) => {
    const task = new Task({
      ownerId: userId,
      task: {
        text: taskText,
      }
    });
    task
        .save()
        .then((result) => {
            return result
        })
        .catch( (err) => { return err } );
}

const getAllTasks = (userId: number, callback: Function) => {
  Task
    .find({ownerId: userId})
    .then((result) => {callback(result)})
    .catch( (err) => { callback(err) } );
}

const getUnfinishedTasks = (userId: number, callback: Function) => {
  Task
    .find({ownerId: userId, "task.isFinished": false})
    .then( (result) => {console.log(result); callback(result)})
    .catch( (err) => { callback([err]) } );
}

const getTasksAmount = (userId: number, callback: Function) => {
  Task
    .countDocuments({ownerId: userId, "task.isFinished": true})
    .then( (finishedTasks) => { 
      Task
        .countDocuments({ownerId: userId, "task.isFinished": false})
        .then( (activeTasks) => {
          console.log(finishedTasks, activeTasks, userId);
          callback(finishedTasks, activeTasks)
        })
    })
    .catch( (err) => { callback([err]) } );
}

const finishTask = (taskId: ObjectId) => {
  console.log(taskId.toString());
  Task
    .findByIdAndUpdate(taskId.toString(), {"task.isFinished": true})
    .then( (result) => {console.log(result); return result})
    .catch( (err) => { console.log(err) } );
}


export {
    addTask,
    finishTask,
    getUnfinishedTasks,
    getTasksAmount,
    getAllTasks,
}