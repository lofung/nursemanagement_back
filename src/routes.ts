import { Router, Request, Response } from "express";
import pool from "./db";
import { AnyARecord } from "dns";

const router = Router();

interface Nurse {
  id: number;
  first_name: string;
  last_name: string;
  ward: string;
  employee_id: number;
  email: string;
}

// This route handles requests to the root path '/'
router.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the Nurse Administration App!");
});

// This route gets all nurses
router.get("/nurses", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM nurses");
    const nurses: Nurse[] = result.rows;
    res.json(nurses);
  } catch (error) {
    console.error("Error fetching nurses", error);
    res.status(500).json({ error: "Error fetching nurses" });
  }
});

// This route creates a new nurse
router.post("/nurses", async (req: Request, res: Response) => {
  const { first_name, last_name, ward, email } = req.body;

  // TypeScript type-based input validation
  if (
    typeof first_name !== "string" ||
    typeof last_name !== "string" ||
    typeof ward !== "string" ||
    typeof email !== "string" ||
    first_name.trim() === "" ||
    last_name.trim() === "" ||
    ward.trim() === "" ||
    email.trim() === ""
  ) {
    return res.status(400).json({ error: "Invalid nurse data" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO nurses (first_name, last_name, ward, email) VALUES ($1, $2, $3, $4) RETURNING *",
      [first_name, last_name, ward, email]
    );
    const createdNurse: Nurse = result.rows[0];
    res.status(201).json(createdNurse);
  } catch (error) {
    console.error("Error adding nurse", error);
    res.status(500).json({ error: "Error adding nurse" });
  }
});

// Delete nurse
router.delete("/nurses/:id", async (req: Request, res: Response) => {
  const nurseID = parseInt(req.params.id, 10);

  // TypeScript type-based input validation
  if (isNaN(nurseID)) {
    return res.status(400).json({ error: "Invalid nurse ID" });
  }

  try {
    await pool.query("DELETE FROM nurses WHERE employee_id = $1", [nurseID]);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error deleting nurse", error);
    res.status(500).json({ error: "Error deleting nurse" });
  }
});

// Pagination route for nurses
router.get("/nurses_pag", async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;  // Default to page 1
  let limit = parseInt(req.query.limit as string) || 10;  // Default to 10 nurses per page
  let search = req.query.search as string || '';
  const offset = (page - 1) * limit;
  //console.log(search)

  let query = "";
  let queryCount = "";
  let parameters = [];

  if (req.query.search){
    query = `SELECT * FROM nurses WHERE first_name LIKE '%${search}%' OR last_name LIKE '%${search}%' OR ward LIKE '%${search}%' ORDER BY employee_id LIMIT ${limit} OFFSET ${offset}`
    queryCount = `SELECT COUNT(*) FROM nurses WHERE first_name LIKE '%${search}%' OR last_name LIKE '%${search}%' OR ward LIKE '%${search}%'`
  } else {
    query = `SELECT * FROM nurses ORDER BY employee_id LIMIT ${limit} OFFSET ${offset}`    
    queryCount = `SELECT COUNT(*) FROM nurses`
  }

  console.log(query)

  try {
    const result = await pool.query(query);
    const nurses = result.rows;
    
    // Get total count for pagination
    const countResult = await pool.query(queryCount);
    const totalNurses = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalNurses / limit);

    res.json({
      nurses,
      totalNurses,
      totalPages,
      currentPage: page,
      nursesPerPage: limit,
    });
  } catch (error) {
    console.error("Error fetching nurses", error);
    res.status(500).json({ error: "Error fetching nurses" });
  }
});

export default router;