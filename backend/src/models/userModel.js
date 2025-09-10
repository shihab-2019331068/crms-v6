const pool = require('../config/db');

const createUser = async (name, email, passwordHash, role, departmentId = null, session = null, accesses = []) => {
  // If role is super_admin, departmentId is null; otherwise, departmentId is required
  departmentId = departmentId === '' ? null : departmentId;
  session = session === '' ? null : session;

  const result = await pool.query(
    'INSERT INTO users (name, email, password_hash, role, "departmentId", session, accesses) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, email, role, "departmentId", session, created_at, accesses',
    [name, email, passwordHash, role, departmentId, session, accesses]
  );
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

const getDepartmentIdByName = async (departmentName) => {
  const result = await pool.query('SELECT id FROM "Department" WHERE name = $1', [departmentName]);
  return result.rows[0] ? result.rows[0].id : null;
};

const getDepartmentByDepartmentId = async (departmentId) => {
  const result = await pool.query('SELECT * FROM "Department" WHERE id = $1', [departmentId]);
  return result.rows[0] || null;
};

module.exports = { createUser, findUserByEmail, getDepartmentIdByName, getDepartmentByDepartmentId };
