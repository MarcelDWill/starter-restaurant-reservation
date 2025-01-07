//imports
const resService = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");

//constants
const VALID_PROPERTIES = [
  "reservation_id",
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
  "status",
  "created_at",
  "updated_at",
];

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([01]\d|2[0-3]):?([0-5]\d)$/;

const hasStatusProperty = hasProperties("status");

const hasRequiredProperties = hasProperties(
  "first_name", 
  "last_name", 
  "mobile_number", 
  "reservation_date", 
  "reservation_time", 
  "people"
);

const VALID_STATUS = [
  "booked",
  "seated",
  "finished",
  "cancelled"
];

//functions

async function list(req, res) {
  const {date, mobile_number} = req.query;
  // list by date
  if(date){
    const data = await resService.filteredList(date);
    return res.json({data});}
  // list by number
  if(mobile_number){
    const data = await resService.search(mobile_number);
    return res.json({data});
  }
  // normal list
  else{
  const data = await resService.list();
  return res.json({ data });
  }
}
// make res
async function create(req, res) {
  const data = await resService.create(req.body.data);
  res.status(201).json({ data });
}
// single res
function read(req, res) {
  const { reservation: data } = res.locals;
  res.json({ data });
}

async function update(req, res) {
  if(res.locals.reservation.status === "finished"){
    return res.status(400).send({error: `${res.locals.reservation.status} reservation can not be updated`}) 
  }
  const updatedRes = {
    ...req.body.data,
    reservation_id: res.locals.reservation.reservation_id,
  };
  const result = await resService.update(updatedRes);
  const data = result[0];
  res.status(200).json({ data });
}

async function destroy(req, res) {
  const { reservation } = res.locals;
  await resService.delete(reservation.reservation_id);
  res.sendStatus(204);
}
// check res is in DB
async function resExists(req, res, next) {
  const reservation = await resService.read(req.params.reservationId);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({ status: 404, message: `Reservation ${req.params.reservationId} cannot be found.` });
}

function hasOnlyValidProperties(req, res, next) {
  if(!req.body.data) res.status(400).send({error: "data is missing!"})
  const {data} = req.body;
  const invalidFields = Object.keys(data).filter(
    (field) => !VALID_PROPERTIES.includes(field)
  );

  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  next();
}
function hasValidStatus(req, res, next){
  if(!req.body.data){
    res.status(400).send({error: "data is missing!"})
  }
  const {data} = req.body;
  if(!VALID_STATUS.includes(data.status)){
    return next({
      status: 400,
      message: `Invalid Status: ${data.status}`,
    });
  }
  next();
}
function addBookedStatus(req, res, next){
  if(!req.body.data.status){
  req.body.data = {
    ...req.body.data,
    status: "booked"
  }}
  next();
}

function validateReservationDate(req, res, next) {
  const reservationDate = new Date(`${req.body.data.reservation_date}T${req.body.data.reservation_time}`);
  if (reservationDate < new Date()) return res.status(400).send({ error: 'reservation_date should be in the future' });
  const theDate = new Date(req.body.data.reservation_date).getUTCDay();
  if (theDate === 2) return res.status(400).send({ error: 'Business is closed on Tuesdays' });
  if (!dateRegex.test(req.body.data.reservation_date)) return res.status(400).send({ error: 'reservation_date should be in correct format' });
  next();
}

function validateReservationTime(req, res, next) {
  const resTime = req.body.data.reservation_time;
  if (timeRegex.test(resTime)) {
    const timeArray = resTime.split(":");
    const timeNumber = Number(timeArray.join(''));
    if (timeNumber >= 1030 && timeNumber <= 2130) return next();
    return res.status(400).send({ error: 'reservation_time should be between 10:30am and 9:30pm' });
  }
  return res.status(400).send({ error: 'reservation_time should be in correct format' });
}

function validatePeople(req, res, next) {
  if (typeof req.body.data.people !== 'number') {
    return next({ status: 400, message: 'people field must be a number' });
  }
  next();
}

function validateStatus(req, res, next) {
  if (req.body.data.status !== "booked") {
    return next({ status: 400, message: `${req.body.data.status} is not a valid POST status` });
  }
  next();
}

module.exports = {
  list: asyncErrorBoundary(list),
  read: [asyncErrorBoundary(resExists), read],
  create: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    addBookedStatus,
    validateReservationDate,
    validateReservationTime,
    validatePeople,
    validateStatus,
    create
  ],
  update: [
    asyncErrorBoundary(resExists),
    hasOnlyValidProperties,
    hasRequiredProperties,
    validateReservationDate,
    validateReservationTime,
    validatePeople,
    hasValidStatus,
    update
  ],
  updateStatus: [
    asyncErrorBoundary(resExists),
    hasStatusProperty,
    hasValidStatus,
    update
  ],
  delete: [asyncErrorBoundary(resExists), destroy],
};