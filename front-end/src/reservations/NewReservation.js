import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function isValidDate(date) {
  const today = new Date();
  const reservationDate = new Date(date);
  return reservationDate > today && reservationDate.getDay() !== 2;
}

function isValidTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes;
  const openingTime = 10 * 60 + 30; // 10:30 AM in minutes
  const closingTime = 21 * 60 + 30; // 9:30 PM in minutes
  return totalMinutes >= openingTime && totalMinutes <= closingTime;
}

function NewReservation() {
  const history = useHistory();
  const [reservation, setReservation] = useState({
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: 1,
  });
  const [error, setError] = useState(null);

  const handleChange = ({ target }) => {
    setReservation({
      ...reservation,
      [target.name]: target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isValidDate(reservation.reservation_date)) {
      setError({ message: "Reservation date must be in the future and not on a Tuesday." });
      return;
    }
    if (!isValidTime(reservation.reservation_time)) {
      setError({ message: "Reservation time must be between 10:30 AM and 9:30 PM." });
      return;
    }
    try {
      await createReservation(reservation);
      history.push(`/dashboard?date=${reservation.reservation_date}`);
    } catch (error) {
      setError(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ErrorAlert error={error} />
      <div>
        <label htmlFor="first_name">First Name</label>
        <input
          id="first_name"
          name="first_name"
          type="text"
          value={reservation.first_name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="last_name">Last Name</label>
        <input
          id="last_name"
          name="last_name"
          type="text"
          value={reservation.last_name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="mobile_number">Mobile Number</label>
        <input
          id="mobile_number"
          name="mobile_number"
          type="text"
          value={reservation.mobile_number}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="reservation_date">Date</label>
        <input
          id="reservation_date"
          name="reservation_date"
          type="date"
          value={reservation.reservation_date}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="reservation_time">Time</label>
        <input
          id="reservation_time"
          name="reservation_time"
          type="time"
          value={reservation.reservation_time}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="people">People</label>
        <input
          id="people"
          name="people"
          type="number"
          value={reservation.people}
          onChange={handleChange}
          required
          min="1"
        />
      </div>
      <button type="submit">Submit</button>
      <button type="button" onClick={() => history.goBack()}>
        Cancel
      </button>
    </form>
  );
}

export default NewReservation;
