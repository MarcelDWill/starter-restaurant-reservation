const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function list(req, res) {
  const data = await service.list();
  res.json({ data });
}

async function create(req, res) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

async function seat(req, res) {
  const { table_id } = req.params;
  const { reservation_id } = req.body.data;
  const data = await service.seat(table_id, reservation_id);
  res.json({ data });
}

async function deleteTable(req, res) {
  const { table_id } = req.params;
  const data = await service.deleteTable(table_id);
  res.json({ data });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: asyncErrorBoundary(create),
  seat: asyncErrorBoundary(seat),
  delete: asyncErrorBoundary(deleteTable),
};
