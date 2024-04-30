import { Markup, Telegraf, session, type Context } from 'telegraf';
import type { Update } from "telegraf/types";
import mongoose from "mongoose";
import cron from 'node-cron';

import { addTask, finishTask, getUnfinishedTasks, getTasksAmount, getAllTasks } from './controllers/tasks-controller.js';
import { addUser} from "./controllers/users-controller.js";
import { ObjectId } from 'mongodb';


const MONGODB_URL = "mongodb://localhost:27017/TaskManager";
let BOT_TOKEN = "6836286484:AAG7lS5yMHcPKVwiCTqCQIibHWbKcii_B6I"

mongoose
    .connect(MONGODB_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log(`DB connection failed: ${err}`));



interface UserContext <U extends Update = Update> extends Context<U> {
  session: {
    reply_to_message: string,
    tasks_to_show: {task: {text: string, isFinished: boolean}, _id: ObjectId, ownerId: string}[],
    last_showed_task_id: ObjectId
  },
};

const bot = new Telegraf<UserContext>(BOT_TOKEN);

bot.use(session({ defaultSession: () => ({ reply_to_message: "" , tasks_to_show: [], last_showed_task_id: new ObjectId()})}));

async function notifyAboutTasks(ctx: any) {
  console.log("Shedule")
  getUnfinishedTasks(ctx.message.from.id, (tasks: [{task: {text: string, isFinished: boolean}, ownerId: string, _id: ObjectId}]) => {
    console.log(tasks)
    if (tasks.length > 0) {
      tasks.reverse();
      ctx.session.tasks_to_show = tasks
      ctx.session.reply_to_message = "tasks_notification"
      let current_task = tasks.pop();
      ctx.session.last_showed_task_id = current_task?._id;
      bot.telegram.sendMessage(ctx.message.from.id, `Проверка выполнения задач! \n\nВы выполнили задачу "${current_task?.task.text}"?`, Markup
        .keyboard(["Да", "Нет"])
        .oneTime()
        .resize()
      )
    } else if (ctx.message.text == "🎟 Включить напоминания") {
      ctx.reply("Сейчас у вас нет задач. Хотите создать новую?")
      ctx.session.reply_to_message = "start";
    }
  }); 
}

function homePage(ctx: any) {
  addUser(ctx.message.from.id.toString())
  ctx.session.reply_to_message = "start";
  getTasksAmount(ctx.message.from.id, (finishedTasksLength: number, activeTasksLength: number) => {
    ctx.reply(`Привет, ${ctx.message!.from.username}!\nЯ бот для отслеживания заданий. Сейчас у тебя ${activeTasksLength} активных и ${finishedTasksLength} выполненных заданий. Нажми на кнопку ниже, чтобы создать задание`,
      Markup
        .keyboard(["🎟 Создать новое задание", "🎟 Личный кабинет", "🎟 Включить напоминания", "🎟 Мои задачи"])
        .resize()
      )
    cron.schedule('* * * * *', () => {
      notifyAboutTasks(ctx)
    });
  })
}


bot.start((ctx) => {
  homePage(ctx);
});

 
bot.hears("🎟 Создать новое задание", ctx => {
  ctx.session.reply_to_message = "create_task";
  ctx.reply("Введите текст нового задания");
});

bot.hears("🎟 Включить напоминания", ctx => {
  ctx.session.reply_to_message = "start";
  notifyAboutTasks(ctx);
});

bot.hears("🎟 Мои задачи", ctx => {
  ctx.session.reply_to_message = "start";
  getAllTasks((tasks: {task: {text: string, isFinished: boolean}}[]) => {
    let message = "";
    for (let task of tasks) {
      message += task["task"]["text"] + " - " + (task["task"]["isFinished"] ? "Выполнено" : "Не выполнено") + "\n";
    }
    ctx.reply(message);
  })
});

bot.hears("🎟 Личный кабинет", ctx => {
  ctx.session.reply_to_message = "start";
  homePage(ctx);
});


bot.on("text", (ctx) => {
  if (ctx.session.reply_to_message == "create_task") {
    addTask(ctx.update.message.from.id.toString(), ctx.message.text);
    ctx.reply(`Создана задача "${ctx.message.text}" успешно создана`);
    ctx.session.reply_to_message = "start";
  } else if (ctx.session.reply_to_message == "tasks_notification") {
    if (ctx.message.text == "Да") {
      finishTask(ctx.session.last_showed_task_id);
    }
    if (ctx.session.tasks_to_show.length != 0) {
      let current_task = ctx.session.tasks_to_show.pop();
      ctx.session.last_showed_task_id = current_task!._id;
      ctx.reply( `Вы выполнили задачу "${current_task?.task.text}"?`, Markup
        .keyboard(["Да", "Нет"])
        .oneTime()
        .resize());
    } else {
      ctx.session.reply_to_message = "start";
      ctx.reply( `Пока что это все задачи. Хотите добавить что-то ещё?`, Markup
        .keyboard(["🎟 Создать новое задание", "🎟 Личный кабинет", "🎟 Включить напоминания", "🎟 Мои задачи"])
        //.oneTime()
        .resize())
    }
    }
})


//bot.on ('message',(ctx) => {
//  console.log(ctx.message);
//} )


bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));