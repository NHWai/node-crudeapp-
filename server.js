const fs = require("fs");
const http = require("http");
const qs = require("querystring");
const port = 3000;
const users = require("./db.json");

const validateEmail = (email) => {
  const emailPattern = String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
    );

  return emailPattern ? true : false;
};

const validateForm = (formData) => {
  const { fName, email, pwd } = formData;
  const emailUnique = !users.some((usr) => usr.email === email);
  if (
    typeof fName === "string" &&
    fName.length > 0 &&
    validateEmail(email) &&
    emailUnique &&
    typeof pwd === "string" &&
    pwd.length > 0
  ) {
    return true;
  } else {
    return false;
  }
};

const validateEditForm = (formData, id) => {
  const { fName, email, pwd } = formData;
  const restUser = [...users];
  restUser.splice(id, 1);
  const emailUnique = !restUser.some((usr) => usr.email === email);

  if (
    typeof fName === "string" &&
    fName.length > 0 &&
    validateEmail(email) &&
    emailUnique &&
    typeof pwd === "string" &&
    pwd.length > 0
  ) {
    return true;
  } else {
    return false;
  }
};

const server = http.createServer((req, res) => {
  if (req.url === "/script.js") {
    fs.readFile("script.js", (err, data) => {
      if (err) {
        console.log("error");
      } else {
        res.writeHead(200, { "Content-Type": "text/javascript" });
        res.write(data);
        return res.end();
      }
    });
  }

  if (req.url === "/users") {
    const method = req.method;
    if (method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.write(JSON.stringify(users));
      return res.end();
    }
    if (method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        body = JSON.parse(body);
        if (validateForm(body)) {
          body.createdAt = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
          body.updatedAt = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
          users.push(body);
          res.writeHead(201, { "Content-Type": "application/json" });
          res.write(JSON.stringify(users));
          res.end();
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.write(JSON.stringify({ errmsg: "not valid input" }));
          return res.end();
        }
      });
    }
  }

  if (req.url.slice(0, 6) === "/user-") {
    const id = Number(req.url.slice(6));
    if (id < users.length && id >= 0) {
      if (req.method === "GET") {
        const user = users[id];
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(JSON.stringify(user));
        res.end();
      }

      if (req.method === "PUT") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", () => {
          const card = JSON.parse(body);
          if (validateEditForm(card, id)) {
            card.isEdit = false;
            card.createdAt = users[id].createdAt;
            card.updatedAt = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
            users.splice(id, 1, card);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.write(JSON.stringify(users));
            return res.end();
          } else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.write(JSON.stringify({ errmsg: "not valid input" }));
            return res.end();
          }
        });
      }

      if (req.method === "DELETE") {
        users.splice(id, 1);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(JSON.stringify({ redirect: "/" }));
        res.end();
      }
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.write(JSON.stringify({ errmsg: "client side error" }));
      return res.end();
    }
  }

  if (req.url === "/fileupload") {
    //
    const method = req.method;
    if (method === "POST") {
      const [, extension] = req.headers["content-type"].split("/");
      const writeStream = fs.createWriteStream(`test.${extension}`);
      req.pipe(writeStream);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.write(JSON.stringify({ msg: "write successfully" }));
      return res.end();
    }
  }

  if (req.url === "/style.css") {
    fs.readFile("style.css", (err, data) => {
      if (err) {
        console.log(err);
        return;
      } else {
        res.writeHead(200, { "Content-Type": "text/css" });
        res.write(data);
        res.end();
        return;
      }
    });
  }

  if (req.url === "/") {
    fs.readFile("index.html", (err, data) => {
      if (err) {
        console.log("error");
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(data);
        return res.end();
      }
    });
  }
});

server.listen(port, () => {
  console.log(`Server started: Listening on port ${port}`);
});
