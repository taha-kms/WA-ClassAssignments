import { useEffect, useState } from 'react';
import { getStatus } from '../services/api';

export default function TeacherStatusPage() {
  const [sort, setSort] = useState('name');
  const [rows, setRows] = useState([]);

  useEffect(() => { getStatus(sort).then(setRows); }, [sort]);

  return (
    <div>
      <h2>Class Status</h2>
      <label>Sort:</label>
      <select value={sort} onChange={e=>setSort(e.target.value)}>
        <option value="name">Name</option>
        <option value="total">Total</option>
        <option value="avg">Average</option>
      </select>
      <table border="1" cellPadding="6">
        <thead><tr><th>Name</th><th>Open</th><th>Closed</th><th>Avg</th></tr></thead>
        <tbody>
          {rows.map(r=>(
            <tr key={r.student_id}>
              <td>{r.surname} {r.name}</td>
              <td>{r.openCount}</td>
              <td>{r.closedCount}</td>
              <td>{r.avg ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
