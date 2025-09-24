#!/usr/bin/env node

const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

async function initializeDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log("Connecting to database...");
    await client.connect();
    console.log("Connected successfully!");

    // Read and execute init.sql
    console.log("Executing init.sql...");
    const initSql = fs.readFileSync(
      path.join(__dirname, "server/config/init.sql"),
      "utf8",
    );
    await client.query(initSql);
    console.log("init.sql executed successfully!");

    // Read and execute messaging-tables.sql
    console.log("Executing messaging-tables.sql...");
    const messagingSql = fs.readFileSync(
      path.join(__dirname, "server/config/messaging-tables.sql"),
      "utf8",
    );
    await client.query(messagingSql);
    console.log("messaging-tables.sql executed successfully!");

    console.log("Database initialization completed successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initializeDatabase();
