import { useEffect, useState } from 'react';
import { getScores } from '../services/api';

export default function StudentScoresPage() {
  const [data, setData] = useState({ overallAvg: null, assignments: [] });

  useEffect(()=>{ getScores().then(setData); }, []);

  return (
    <div>
      <h2>My Scores</h2>
      <p><b>Weighted average:</b> {data.overallAvg ?? '-'}</p>
      <table border="1" cellPadding="6">
        <thead><tr>
          <th>#</th><th>Question</th><th>Score</th><th>Group size</th><th>Teacher</th>
        </tr></thead>
        <tbody>
          {data.assignments.map(a=>(
            <tr key={a.assignment_id}>
              <td>{a.assignment_id}</td>
              <td>{a.question}</td>
              <td>{a.score}</td>
              <td>{a.groupSize}</td>
              <td>{a.teacher_surname} {a.teacher_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
