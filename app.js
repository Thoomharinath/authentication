const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");

const databasePath = path.join(__dirname, "userData.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const validatePassword = (password) => {
  return password.length > 4;
};

//api 1
app.post("/register", async (request, response) => {
  const { username, password, name, gender, location } = request.body;
  const hashedpassword = await bcrypt.hash(password, 10);

  const postquery = `SELECT * 
                        FROM user
                        WHERE username='${username}';`;
  const result = await db.get(postquery);
  if (result === undefined) {
    const postquery1 = `INSERT INTO user(username,name,password,gender,location)
                            VALUES ('${username}',
                            '${name}',
                            '${hashedpassword}',
                            '${gender}',
                            '${location}');`;

    if (validatePassword(password)) {
      await db.run(postquery1);
      response.send("User created successfully");
    } else {
      response.status(400);
      response.send("Password is too short");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});
//login

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const query = `SELECT * FROM user 
                    WHERE username='${username};`;
  const logresult = await db.get(query);

  if (logresult === undefined) {
    response.Status(400);
    response.send("Invalid user");
  } else {
    const wordmatched = await bcrypt.compare(password, logres.password);

    if (wordmatched === true) {
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

//change word

app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const query = `SELECT * FROM user 
                    WHERE username='${username};`;
  const logresult = await db.get(query);
  const wordcheck = bcrypt.compare(oldPassword, logres.password);

  if (logresult === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    if (wordcheck !== true) {
      response.status(400);
      response.send("Invalid current password");
    } else {
      if (validatePassword(newPassword)) {
        const hashedpassword = await bcrypt.hash(newPassword, 10);
        const query = `UPDATE user
                    set password='${hashedpassword}'
                    where username='${username};`;
        await db.run(query);
        response.send("Password updated");
      } else {
        response.status(400);
        response.send("Password is too short");
      }
    }
  }
});
module.exports = app;
