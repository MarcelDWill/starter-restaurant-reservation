const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const service = require("./reservations.service");

/**
 * List handler for reservation resources
 */
async function list(req, res) {
  const { date } = req.query;
  const data = await service.list(date);
  res.json({ data });
}

function isValidDate(date) {
  const today = new Date();
  const reservationDate = new Date(date);
  return reservationDate > today && reservationDate.getDay() !== 2;
}

async function create(req, res, next) {
  const { data: { reservation_date } = {} } = req.body;
  if (!isValidDate(reservation_date)) {
    return next({
      status: 400,
      message: "Reservation date must be in the future and not on a Tuesday.",
    });
  }
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

async function updateStatus(req, res) {
  const { reservation_id } = req.params;
  const { status } = req.body.data;
  const data = await service.updateStatus(reservation_id, status);
  res.json({ data });
}

async function search(req, res) {
  const { mobile_number } = req.query;
  const data = await service.search(mobile_number);
  res.json({ data });
}

async function update(req, res) {
  const { reservation_id } = req.params;
  const data = await service.update(reservation_id, req.body.data);
  res.json({ data });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: asyncErrorBoundary(create),
  updateStatus: asyncErrorBoundary(updateStatus),
  search: asyncErrorBoundary(search),
  update: asyncErrorBoundary(update),
};
