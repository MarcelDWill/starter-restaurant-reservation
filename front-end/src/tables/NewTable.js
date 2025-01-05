import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function NewTable() {
  const history = useHistory();
  const [table, setTable] = useState({
    table_name: "",
    capacity: 1,
  });
  const [error, setError] = useState(null);

  const handleChange = ({ target }) => {
    setTable({
      ...table,
      [target.name]: target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await createTable(table);
      history.push("/dashboard");
    } catch (error) {
      setError(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ErrorAlert error={error} />
      <div>
        <label htmlFor="table_name">Table Name</label>
        <input
          id="table_name"
          name="table_name"
          type="text"
          value={table.table_name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="capacity">Capacity</label>
        <input
          id="capacity"
          name="capacity"
          type="number"
          value={table.capacity}
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

export default NewTable;
