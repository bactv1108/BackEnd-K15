const http = require("node:http");

// In memory DB
const db = {
  tasks: [
    {
      id: 1,
      title: "Nau com",
      isCompleted: false,
    },
    {
      id: 2,
      title: "Quet nha",
      isCompleted: false,
    },
  ],
};

const server = http.createServer((req, res) => {
  console.log(req.method, req.url);

  // CORS (quan trọng)
  const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"]; //các link client gọi server

  const origin = req.headers.origin;

  //kiểm tra và cho phép các client

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  // res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS",);
  //CHO PHÉP frontend gửi 2 header này khi gọi API
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // hỏi server xem có cho phép không
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  /* ---------------GET ALL----------- */
  if (req.method === "GET" && req.url === "/api/tasks") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(db.tasks));
    return;
  }

  /* ---------GET BY ID------------ */
  if (req.method === "GET" && req.url.startsWith("/api/tasks/")) {
    const id = Number(req.url.split("/").pop());
    const task = db.tasks.find((t) => t.id === id);

    if (!task) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Task not found" }));
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(task));
    return;
  }

  /* --------------POST------------- */
  if (req.method === "POST" && req.url === "/api/tasks") {
    let body = "";

    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const payload = JSON.parse(body);

      const uniqId =
        db.tasks.length > 0 ? Math.max(...db.tasks.map((item) => item.id)) : 0;

      const newTask = {
        id: uniqId + 1,
        title: payload.title,
        isCompleted: false,
      };

      db.tasks.push(newTask);

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ data: newTask }));
    });

    return;
  }

  /* ---------------PUT------------ */
  if (req.method === "PUT" && req.url.startsWith("/api/tasks/")) {
    const id = Number(req.url.split("/").pop());

    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const payload = JSON.parse(body);

      const task = db.tasks.find((t) => t.id === id);

      if (!task) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Task not found" }));
      }

      // cập nhật
      if (payload.title !== undefined) task.title = payload.title;
      if (payload.isCompleted !== undefined)
        task.isCompleted = payload.isCompleted;

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ data: task }));
    });

    return;
  }

  /* -----------------DELETE-------------- */
  if (req.method === "DELETE" && req.url.startsWith("/api/tasks/")) {
    const id = Number(req.url.split("/").pop());

    const index = db.tasks.findIndex((t) => t.id === id);

    if (index === -1) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Task not found" }));
    }

    db.tasks.splice(index, 1);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Deleted successfully" }));
    return;
  }

/* ----------BYPASS CORS-------------- */
if (req.url.startsWith("/bypass-cors")) {
  const fullUrl = new URL(req.url, `http://${req.headers.host}`);
  const targetUrl = fullUrl.searchParams.get("url");

  if (!targetUrl) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Missing url param" }));
    return;
  }

  let body = "";

  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    try {
      const response = await fetch(targetUrl, {
        method: req.method,
        headers: {
          "Content-Type": req.headers["content-type"] || "application/json",
        },
        body: body || undefined,
      });

      const data = await response.text();

      res.writeHead(response.status, {
        "Content-Type":
          response.headers.get("content-type") || "application/json",
      });

      res.end(data);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ message: "Bypass error", error: err.message })
      );
    }
  });

  return;
}

  /* ------------404 NOT FOUND-------------- */
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Not found" }));
});

server.listen(3001, () => {
  console.log("Server start...");
});
