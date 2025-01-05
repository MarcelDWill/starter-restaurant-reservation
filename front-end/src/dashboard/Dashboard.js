import React, { useEffect, useState } from "react";
import { listReservations, listTables, deleteTable, updateReservationStatus } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { previous, next, today } from "../utils/date-time";

function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tablesError, setTablesError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const reservationsResponse = await listReservations({ date });
        setReservations(reservationsResponse);
      } catch (error) {
        setReservationsError(error);
      }
      try {
        const tablesResponse = await listTables();
        setTables(tablesResponse);
      } catch (error) {
        setTablesError(error);
      }
    };
    loadDashboard();
  }, [date]);

  const handleDelete = async (table_id) => {
    const confirm = window.confirm("Is this table ready to seat new guests? This cannot be undone.");
    if (confirm) {
      try {
        await deleteTable(table_id);
        const tablesResponse = await listTables();
        setTables(tablesResponse);
      } catch (error) {
        setTablesError(error);
      }
    }
  };

  const handleSeat = async (reservation_id) => {
    try {
      await updateReservationStatus(reservation_id, "seated");
      const reservationsResponse = await listReservations({ date });
      setReservations(reservationsResponse);
    } catch (error) {
      setReservationsError(error);
    }
  };

  const handleFinishReservation = async (reservation_id) => {
    try {
      await updateReservationStatus(reservation_id, "finished");
      const reservationsResponse = await listReservations({ date });
      setReservations(reservationsResponse);
    } catch (error) {
      setReservationsError(error);
    }
  };

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for {date}</h4>
      </div>
      <ErrorAlert error={reservationsError} />
      <ErrorAlert error={tablesError} />
      <div>
        <h4>Reservations</h4>
        <ul>
          {reservations.map((reservation) => (
            <li key={reservation.reservation_id}>
              {reservation.first_name} {reservation.last_name} - {reservation.reservation_time} - {reservation.status}
              {reservation.status === "booked" && (
                <button onClick={() => handleSeat(reservation.reservation_id)}>Seat</button>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4>Tables</h4>
        <ul>
          {tables.map((table) => (
            <li key={table.table_id}>
              {table.table_name} - {table.capacity} - {table.reservation_id ? "Occupied" : "Free"}
              {table.reservation_id && (
                <button
                  data-table-id-finish={table.table_id}
                  onClick={() => handleDelete(table.table_id)}
                >
                  Finish
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <button onClick={() => history.push(`/dashboard?date=${previous(date)}`)}>Previous</button>
        <button onClick={() => history.push(`/dashboard?date=${today()}`)}>Today</button>
        <button onClick={() => history.push(`/dashboard?date=${next(date)}`)}>Next</button>
      </div>
    </main>
  );
}

export default Dashboard;
