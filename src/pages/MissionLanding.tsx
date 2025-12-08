import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function MissionLanding() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [mission, setMission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchMission = async () => {
      try {
        const res = await fetch(`${API_URL}/missions/${id}`);
        const data = await res.json();
        if (data.success) setMission(data.mission);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMission();
  }, [id]);

  const handleClaim = async () => {
    if (!token) {
      // Redirect to login and come back
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/missions/${id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (!data.success) {
        setMessage(data.message || 'Claim thất bại');
        return;
      }

      setMessage('Claim thành công!');
      // Optionally refresh user and redirect to missions page
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      console.error(err);
      setMessage('Lỗi khi claim nhiệm vụ');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!mission) return <div className="p-6">Mission không tồn tại</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{mission.name}</h1>
      <p className="mb-2">{mission.description}</p>
      <p className="mb-4">Reward: <strong>{mission.reward}</strong> coins</p>

      {mission.code ? (
        <div className="mb-4">
          <label className="block mb-2">Nhập mã xác nhận:</label>
          <input value={code} onChange={(e) => setCode(e.target.value)} className="border p-2 w-full" />
        </div>
      ) : null}

      <div>
        <button onClick={handleClaim} className="bg-blue-600 text-white px-4 py-2 rounded">Claim</button>
      </div>

      {message && <div className="mt-4 text-sm">{message}</div>}
    </div>
  );
}
