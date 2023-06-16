import fs from "node:fs/promises";
import users from "../db/users.json" assert { type: "json" };

const DB_PATH = "./db/users.json";

export const signUp = async (req, res) => {
  const { username, email, password } = req.body;
  const user = { email, password };

  if (users[username]) {
    res.status(200).send({
      data: {},
      error: true,
      message: "user already exists",
    });
    return;
  }
  users[username] = user;

  await fs.writeFile(DB_PATH, JSON.stringify(users, null, "  "));
  res.status(201).send({
    message: "user created",
  });
};

export const signIn = async (req, res) => {
  const { username, password } = req.body;
  const user = users[username];

  if (user && user.password === password) {
    req.session.user = username;
    res.status(200).send({
      message: "user logged in",
    });
  } else {
    res.status(200).send({
      data: {},
      error: true,
      message: "user not found",
    });
  }
};

export const signOut = (req, res, next) => {
  req.session.user = null;
  req.session.save(function (err) {
    if (err) next(err);
    req.session.regenerate(function (err) {
      if (err) next(err);
      res.status(200).end();
    });
  });
};
