import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from "../../../config";

const DepositStats = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchDeposits = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const res = await axios.get(`${API_BASE_URL}/api/deposit`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeposits(res.data.deposits || []);
    } catch (err) {
      console.error('Lỗi khi tải nạp:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleAction = async (id, action) => {
    if (!window.confirm(`Bạn chắc chắn muốn ${action === 'approve' ? 'DUYỆT' : 'TỪ CHỐI'} yêu cầu này?`)) {
      return;
    }
    try {
      setProcessingId(id);
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      await axios.post(`${API_BASE_URL}/api/deposit/${action}/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchDeposits();
    } catch (err) {
      console.error(`Lỗi khi ${action}:`, err);
      alert(`Lỗi khi ${action}: ${err.response?.data?.message || err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return (
    <div className="flex items-center gap-2 text-emerald-800 font-bold py-4 animate-pulse">
      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-emerald-600"></div>
      <span>Đang tải thống kê nạp...</span>
    </div>
  );

  return (
    <div className="mt-2">
      <h2 className="text-xl font-bold mb-4 text-emerald-950 flex items-center gap-2">
        <span className="inline-block w-2 h-5 bg-emerald-500 rounded-full"></span>
        Thống kê nạp World Crystal
      </h2>
      {deposits.length === 0 ? (
        <p className="text-emerald-800/60 text-sm italic py-4">Chưa có giao dịch nạp World Crystal nào.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs sm:text-sm uppercase tracking-wider font-bold">
                  <th className="p-3 text-left">Người dùng</th>
                  <th className="p-3 text-right">World Crystal</th>
                  <th className="p-3 text-right">Số tiền (VNĐ)</th>
                  <th className="p-3 text-left">Phương thức</th>
                  <th className="p-3 text-left">Loại thẻ</th>
                  <th className="p-3 text-left">Seri thẻ</th>
                  <th className="p-3 text-left">Mã thẻ</th>
                  <th className="p-3 text-left">Trạng thái</th>
                  <th className="p-3 text-left">Ngày tạo</th>
                  <th className="p-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {deposits.map((d) => (
                  <tr key={d.id} className="hover:bg-emerald-50/30 border-b border-emerald-50 transition-colors last:border-b-0 text-xs sm:text-sm">
                    <td className="p-3 font-semibold text-emerald-950">{d.User?.username || "Ẩn danh"}</td>
                    <td className="p-3 text-right font-bold text-emerald-700">💎 {d.amount}</td>
                    <td className="p-3 text-right font-semibold text-emerald-950">
                      {d.price ? d.price.toLocaleString("vi-VN") : '0'}
                    </td>
                    <td className="p-3 text-emerald-800/80 font-medium">{d.method === 'card' ? 'Thẻ cào' : d.method}</td>
                    <td className="p-3 text-emerald-800/80 font-mono">{d.cardType || '-'}</td>
                    <td className="p-3 text-emerald-800/80 font-mono">{d.cardSerial || '-'}</td>
                    <td className="p-3 text-emerald-800/80 font-mono">{d.cardCode || '-'}</td>
                    <td className="p-3 font-bold">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        d.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : d.status === 'rejected'
                          ? 'bg-rose-50 text-rose-600 border border-rose-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {d.status === 'pending'
                          ? 'Chờ duyệt'
                          : d.status === 'approved'
                          ? 'Đã duyệt'
                          : 'Đã từ chối'}
                      </span>
                    </td>
                    <td className="p-3 text-emerald-800/60 font-semibold">
                      {new Date(d.createdAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="p-3 text-center">
                      {d.status === 'pending' ? (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleAction(d.id, 'approve')}
                            disabled={processingId === d.id}
                            className="px-2.5 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all shadow-sm shadow-emerald-600/10 disabled:opacity-40"
                          >
                            {processingId === d.id ? '...' : 'Duyệt'}
                          </button>
                          <button
                            onClick={() => handleAction(d.id, 'reject')}
                            disabled={processingId === d.id}
                            className="px-2.5 py-1.5 text-xs bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg transition-all shadow-sm shadow-rose-500/10 disabled:opacity-40"
                          >
                            {processingId === d.id ? '...' : 'Từ chối'}
                          </button>
                        </div>
                      ) : (
                        <span className={`text-xs font-semibold ${d.status === 'approved' ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {d.status === 'approved' ? '✓ Đã duyệt' : '✗ Đã từ chối'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositStats;
