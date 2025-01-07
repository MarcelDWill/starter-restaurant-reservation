const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");
const tablesService = require("./tables.service");
const reservationsService= require("../reservations/reservations.service");

async function list(req, res) {    
    const occupied = req.query.is_open;
    // open tables
    if(occupied){
        const data = await tablesService.filteredList();
        res.json({ data});
    }
    else{
    const data = await tablesService.list();
    res.json({ data });
    }
}
// make table
async function create(req, res) { 
    const data = await tablesService.create(req.body.data);
    res.status(201).json({ data });
}
// single table
function read(req, res) {
    const { table: data } = res.locals;
    res.json({ data });
}

function update(req, res) {

  if(res.locals.reservation.status === "seated"){
    return res.status(400).send({error: `reservation is already ${res.locals.reservation.status}`}) 
  }
  const updatedTable = {
    ...res.locals.table,
    reservation_id: res.locals.reservation.reservation_id,
  };

  reservationsService.update({...res.locals.reservation, status : "seated"})
    .then(()=> {return tablesService.update(updatedTable)}).then((data)=>{return res.status(200).json({ data })});
}

function removeReservation(req, res) {
  if(!res.locals.table.reservation_id) return res.status(400).send({error: `${res.locals.table.table_id} is not occupied`})
  
  const updatedTable = {
    ...res.locals.table,
    reservation_id: null,
  };

  reservationsService.update({reservation_id: res.locals.table.reservation_id, status : "finished"})
    .then(()=>tablesService.update(updatedTable)).then((data)=>res.status(200).json({ data }));   
}
// check for res in db
async function reservationExists(req, res, next) {

  if(!req.body.data.reservation_id) next({ status: 400, message: `No reservation_id in req.body.data` })
  const reservation = await reservationsService.read(req.body.data.reservation_id);
  if (!reservation) next({ status: 404, message: `reservation ${req.body.data.reservation_id} cannot be found.` });
  res.locals.reservation = reservation;
  return next();

}

async function tableExists(req, res, next) {
  const table = await tablesService.read(req.params.tableId);
  if (!table) next({ status: 404, message: `Table ${req.params.tableId} cannot be found.` });

  res.locals.table = table;
  
  return next();

}

const VALID_PROPERTIES = [
"table_id",
"table_name",
"capacity",
"reservation_id"
];

function hasOnlyValidProperties(req, res, next) {
if(!req.body.data)
{res.status(400).send({error: "data is missing!"})}
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

const hasRequiredProperties = hasProperties("table_name","capacity");

const capacityNumberCheck = (req, res, next) => {
  typeof req.body.data.capacity == 'number' ? next() : next({status: 400, message: 'capacity field must be a number'})
}

function nameLengthCheck(req, res, next){
  if(req.body.data.table_name.length <2){
    return next({status: 400, message: 'table_name must be at least 2 characters'})
  }
  next();
}

function dataExists(req, res, next){
  if(!req.body.data)
{return next({status: 400, message: 'data is missing from req.body'})}
next();
}

function tableUpdateValidator(req, res, next) {
      const reservation = res.locals.reservation
      if(reservation && reservation.people > res.locals.table.capacity){
        return res.status(400).send({error: `capacity not big enough`})
      }
      if(res.locals.table.reservation_id !== null){
          res.status(400).send({ error: "table is occupied"});
      }
      next();
      
}

module.exports = {
        list: asyncErrorBoundary(list),
        create: [hasOnlyValidProperties, 
          hasRequiredProperties, 
          nameLengthCheck,
          capacityNumberCheck,
          create],
        read: [asyncErrorBoundary(tableExists), read],
        update: [dataExists,
           asyncErrorBoundary(tableExists), 
           asyncErrorBoundary(reservationExists), 
           hasOnlyValidProperties, 
           tableUpdateValidator, 
           update],
        delete: [
          asyncErrorBoundary(tableExists),
          removeReservation]
      };