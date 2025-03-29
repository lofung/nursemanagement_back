import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",
  host: "tonelessly-contiguous-terrapin.data-1.use1.tembo.io",
  database: "postgres",
  password: "z0h3T0WC84KLoN0I",
  port: 5432, // or the port you are using for PostgreSQL
  ssl: { //need this to not fall to connection terminated unexpectedly
    rejectUnauthorized : false
  }
});

export default pool;
