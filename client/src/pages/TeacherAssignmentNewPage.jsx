import { useEffect, useState } from 'react';
import { getStudents, createAssignment } from '../services/api';

export default function TeacherAssignmentNewPage() {
  const [students, setStudents] = useState([]);
  const [picked, setPicked] = useState([]);
  const [question, setQuestion] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(()=>{ getStudents().then(setStudents); }, []);

  const toggle = (id) => {
    setPicked(p=> p.includes(id) ? p.filter(x=>x!==id) : [...p, id]);
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const { id } = await createAssignment(question, picked);
      setMsg(`Assignment #${id} created`);
      setPicked([]); setQuestion('');
    } catch (err) {
      setMsg(err.response?.data?.error || 'Error creating assignment');
    }
  };

  return (
    <form onSubmit={submit}>
      <h2>New Assignment</h2>
      {msg && <div>{msg}</div>}
      <label>Question</label>
      <textarea value={question} onChange={e=>setQuestion(e.target.value)} required rows={4}/>
      <h3>Pick 2–6 Students</h3>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:6}}>
        {students.map(s=>(
          <label key={s.id}>
            <input type="checkbox" checked={picked.includes(s.id)} onChange={()=>toggle(s.id)} />
            {s.surname} {s.name}
          </label>
        ))}
      </div>
      <button type="submit">Create</button>
    </form>
  );
}
