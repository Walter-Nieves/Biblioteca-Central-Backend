import { Pool,createPool } from "mysql2";
import dotenv from "dotenv";
dotenv.config();    

const db:Pool = createPool({
    host: process.env.SQL_HOST as string,
    user: process.env.SQL_USER as string,
    password: process.env.SQL_PASSWORD as string,
    database: process.env.SQL_DB as string,
});

export default db;