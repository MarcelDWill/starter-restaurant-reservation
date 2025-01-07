//imports
const resService = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");
const resValidate = require("../errors/resValidate");

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
const hasStatusProperty = hasProperties("status");

const hasRequiredProperties = hasProperties(
  "first_name", 
  "last_name", 
  "mobile_number", 
  "reservation_date", 
  "reservation_time", 
  "people",);
  
const VALID_STATUS = [
    "booked",
    "seated",
    "finished",
    "cancelled"
]
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
module.exports = {
  list: asyncErrorBoundary(list),
  read: [asyncErrorBoundary(resExists), read],
  create: [hasOnlyValidProperties, hasRequiredProperties,  addBookedStatus,resValidate("reservation_date"),
    resValidate("reservation_time"),
    resValidate("people"), resValidate("status"),create],
  update: [asyncErrorBoundary(resExists), hasOnlyValidProperties,  hasRequiredProperties,  resValidate("reservation_date"),
    resValidate("reservation_time"),
    resValidate("people"), hasValidStatus, update],
  updateStatus: [asyncErrorBoundary(resExists), hasStatusProperty, hasValidStatus, update],
  delete: [asyncErrorBoundary(resExists), destroy],
};