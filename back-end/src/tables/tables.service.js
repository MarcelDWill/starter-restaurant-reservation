const knex = require("../db/connection");

function list() {
  return knex("tables").select("*").orderBy("table_name");
}

function create(table) {
  return knex("tables").insert(table).returning("*").then((rows) => rows[0]);
}

function seat(table_id, reservation_id) {
  return knex("tables")
    .where({ table_id })
    .update({ reservation_id })
    .returning("*")
    .then((rows) => rows[0]);
}

function deleteTable(table_id) {
  return knex("tables")
    .where({ table_id })
    .update({ reservation_id: null })
    .returning("*")
    .then((rows) => rows[0]);
}

module.exports = {
  list,
  create,
  seat,
  deleteTable,
};
