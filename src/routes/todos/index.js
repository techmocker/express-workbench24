const { Router } = require("express");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const todoSequelize = require("../../database/setup/database");
const TodoModel = require("../../database/models/TodoModel");

const TodosRouter = Router();

let todos = [
  {
    id: 1,
    userId: 1,
    task: "Wäsche waschen",
    isDone: true,
    dueDate: new Date("2024-03-03"),
  },
  {
    id: 2,
    userId: 1,
    task: "Müll rausbrigen",
    isDone: false,
    dueDate: new Date("2024-03-03"),
  },
  {
    id: 3,
    userId: 2,
    task: "Tanzen",
    isDone: false,
    dueDate: new Date("2024-03-03"),
  },
  {
    id: 4,
    userId: 2,
    task: "Auto fahren",
    isDone: true,
    dueDate: new Date("2024-03-03"),
  },
];

// GET REQUESTS
// /v1/todos/bytodoid
TodosRouter.get("/byid", async (req, res) => {
  const todoId = req.query.todoId;
  if (!todoId) {
    res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
    return;
  }
  try {
    const todo = await TodoModel.findOne({ where: { id: todoId } });
    res.status(StatusCodes.OK).json({ todo: todo });
  } catch (error) {
    console.error("userID konnte nicht ermittelt werden:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR);
  }
});

// Alle Todos von einer UserId
TodosRouter.get("/byuserid", async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send(ReasonPhrases.BAD_REQUEST + " Keine userID");
    return;
  }

  try {
    const userTodos = await TodoModel.findAll({ where: { userId: userId } });
    res.status(StatusCodes.OK).json(userTodos);
  } catch (error) {
    console.error("userID konnte nicht ermittelt werden:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR);
  }
});

TodosRouter.get("/all", async (req, res) => {
  const todos = await TodoModel.findAll();
  res.status(StatusCodes.OK).send(todos);
});

// PUT REQUESTS
TodosRouter.put("/mark", async (req, res) => {
  const { id, newIsDone } = req.body;

  try {
    const updatedTodo = await TodoModel.update(
      { isDone: newIsDone },
      { where: { id: id }, returning: true }
    );

    if (updatedTodo[0] === 0) {
      res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND + " Todo nicht gefunden");
      return;
    }

    res.status(StatusCodes.OK).json({ updatedTodo: updatedTodo[1][0] });
  } catch (error) {
    console.error("Fehler beim Update:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR);
  }
});

TodosRouter.put("/update", async (req, res) => {
  const { todoId, newTask, newIsDone, newDueDate } = req.body;

  await TodoModel.update(
    {
      task: newTask,
      isDone: newIsDone,
      dueDate: newDueDate,
    },
    { where: { id: todoId } }
  );

  const todo = await TodoModel.findByPk(todoId);

  res.status(StatusCodes.OK).json({ updatedTodo: todo });
});

// POST REQUESTS
TodosRouter.post("/create", async (req, res) => {
  const { newTask, newIsDone, newDueDate, newUserId } = req.body;

  const newTodo = {
    task: newTask,
    isDone: newIsDone,
    dueDate: new Date(newDueDate),
    userId: newUserId,
  };

  const todo = await TodoModel.create(newTodo);

  res.status(StatusCodes.OK).json({ todo: todo });
});

// DELETE REQUEST
TodosRouter.delete("/delete", async (req, res) => {
  const { todoId } = req.body; //req.body.todoId

  await TodoModel.destroy({ where: { id: todoId } });

  res.status(StatusCodes.OK).json({ deletedTodosId: todoId });
});

module.exports = { TodosRouter };
