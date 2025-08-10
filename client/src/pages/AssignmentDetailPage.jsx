import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAssignment, submitAnswer } from '../services/api';

export default function AssignmentDetailPage() {
  const { id } = useParams();
  const [a, setA] = useState(null);
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');

  const load = () => getAssignment(id).then(data=>{
    setA(data);
    setText(data.answer || '');
  }).catch(err=> setMsg(err.response?.data?.error || 'Error loading assignment'));

  useEffect(load, [id]);

  const save = async () => {
    try {
      await submitAnswer(id, text);
      setMsg('Saved');
      load();
    } catch (e) {
      setMsg(e.response?.data?.error || 'Error saving');
    }
  };

  if (!a) return <div>Loading…</div>;
  const closed = a.status === 'closed';

  return (
    <div>
      <h2>Assignment #{a.id}</h2>
      <p><b>Question:</b> {a.question}</p>
      <p><b>Status:</b> {a.status}</p>
      {closed && <p><b>Score:</b> {a.score}</p>}
      <div>
        <label>Your Group Answer</label>
        <textarea rows={6} value={text} onChange={e=>setText(e.target.value)} disabled={closed}/>
      </div>
      {!closed && <button onClick={save}>Save Answer</button>}
      {msg && <div>{msg}</div>}
    </div>
  );
}
