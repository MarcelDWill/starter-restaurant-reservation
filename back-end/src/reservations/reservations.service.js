const knex = require("../db/connection");

function list(){
    return knex("reservations").select("*");
}

function filteredList(date){
  return knex("reservations")
    .select("*")
    .whereNot('status', 'finished')
    .andWhereNot('status', 'cancelled')
    .andWhere({reservation_date: date})
    .orderBy('reservation_time')
}

function create(reservation){
  return knex("reservations")
      .insert(reservation)
      .returning("*")
      .then((createdRecords)=> createdRecords[0]);
}

function read(reservationId) {
    return knex("reservations")
    .select("*")
    .where({ reservation_id: reservationId }).first();
}

function update(updatedReservation){

    return knex("reservations")     
      .select("*")
      .where({ reservation_id: updatedReservation.reservation_id})
      .update(updatedReservation, "*")
}

function destroy(reservation_id) {
    return knex("reservations").where({ reservation_id }).del(); 
}
function search(mobile_number) { 
  return knex("reservations")
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");
}

  module.exports = {
    list,
    filteredList,
    create,
    read,
    update,
    delete: destroy,
    search,
  };