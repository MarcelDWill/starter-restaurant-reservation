import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { listTables, seatReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function SeatReservation() {
  const { reservation_id } = useParams();
  const history = useHistory();
  const [tables, setTables] = useState([]);
  const [tableId, setTableId] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTables = async () => {
      try {
        const response = await listTables();
        setTables(response);
      } catch (error) {
        setError(error);
      }
    };
    loadTables();
  }, []);

  const handleChange = ({ target }) => {
    setTableId(target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await seatReservation(tableId, reservation_id);
      history.push("/dashboard");
    } catch (error) {
      setError(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ErrorAlert error={error} />
      <div>
        <label htmlFor="table_id">Table</label>
        <select id="table_id" name="table_id" value={tableId} onChange={handleChange} required>
          <option value="">Select a table</option>
          {tables.map((table) => (
            <option key={table.table_id} value={table.table_id}>
              {table.table_name} - {table.capacity}
            </option>
          ))}
        </select>
      </div>
      <button type="submit">Submit</button>
      <button type="button" onClick={() => history.goBack()}>
        Cancel
      </button>
    </form>
  );
}

export default SeatReservation;
