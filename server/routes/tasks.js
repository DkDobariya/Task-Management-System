const router = require("express").Router();
const db = require("../db");
const auth = require("../middleware/auth");

/* ===============================
   GET ALL TASKS
================================ */
router.get("/", auth, (req, res) => {
  db.query(
    "SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC",
    [req.user.id],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(results);
    }
  );
});

/* ===============================
   CREATE TASK
================================ */
router.post("/", auth, (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "All fields required" });
  }

  db.query(
    "INSERT INTO tasks (user_id, title, description, status) VALUES (?, ?, ?, ?)",
    [req.user.id, title, description, "To Do"],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ message: "Task created successfully" });
    }
  );
});

/* ===============================
   UPDATE TASK
================================ */
router.put("/:id", auth, (req, res) => {
  const { status, title, description } = req.body;
  const taskId = req.params.id;

  // 🔹 If updating only status
  if (status && !title && !description) {
    db.query(
      "UPDATE tasks SET status=? WHERE id=? AND user_id=?",
      [status, taskId, req.user.id],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Status update failed" });
        }
        return res.json({ message: "Status updated successfully" });
      }
    );
  }

  // 🔹 If updating title & description
  else if (title && description) {
    db.query(
      "UPDATE tasks SET title=?, description=? WHERE id=? AND user_id=?",
      [title, description, taskId, req.user.id],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Update failed" });
        }
        return res.json({ message: "Task updated successfully" });
      }
    );
  }

  else {
    return res.status(400).json({ error: "Invalid update request" });
  }
});

/* ===============================
   DELETE TASK
================================ */
router.delete("/:id", auth, (req, res) => {
  const taskId = req.params.id;

  db.query(
    "DELETE FROM tasks WHERE id=? AND user_id=?",
    [taskId, req.user.id],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Delete failed" });
      }
      res.json({ message: "Task deleted successfully" });
    }
  );
});

module.exports = router;