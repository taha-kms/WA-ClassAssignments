import { useEffect, useState } from 'react';
import { getOpenAssignments } from '../services/api';
import { Link } from 'react-router-dom';

export default function StudentAssignmentsPage() {
  const [rows, setRows] = useState([]);
  useEffect(()=>{ getOpenAssignments().then(setRows); }, []);
  return (
    <div>
      <h2>My Open Assignments</h2>
      <ul>
        {rows.map(a=>(
          <li key={a.id}>
            <Link to={`/student/assignments/${a.id}`}>#{a.id}: {a.question}</Link>
            <div><small>Group: {a.groupMembers}</small></div>
          </li>
        ))}
      </ul>
    </div>
  );
}
