import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../config";

const SQLManager = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [schema, setSchema] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [expandedRowIdx, setExpandedRowIdx] = useState(-1);
  const [editData, setEditData] = useState({});
  const [showPasswordMap, setShowPasswordMap] = useState({});

  const getToken = () => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser).token : null;
  };

  // Fetch all tables
  useEffect(() => {
    const fetchTables = async () => {
      setLoading(true);
      setError("");
      try {
        const token = getToken();
        if (!token) throw new Error("Vui lòng đăng nhập quyền admin");
        
        const res = await axios.get(`${API_BASE_URL}/api/sql/tables`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setTables(res.data.tables || []);
          if (res.data.tables.length > 0) {
            setSelectedTable(res.data.tables[0]);
          }
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || err.message || "Lỗi tải danh sách bảng");
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  // Fetch table data and schema when selectedTable changes
  useEffect(() => {
    if (!selectedTable) return;

    const fetchTableData = async () => {
      setLoading(true);
      setError("");
      setSuccessMessage("");
      setExpandedRowIdx(-1);
      setEditData({});
      try {
        const token = getToken();
        const res = await axios.get(`${API_BASE_URL}/api/sql/tables/${selectedTable}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setSchema(res.data.schema || []);
          setRows(res.data.rows || []);
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || err.message || `Lỗi tải dữ liệu bảng ${selectedTable}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTableData();
  }, [selectedTable]);

  // Find primary key column
  const getPrimaryKeyInfo = () => {
    const priKeyCol = schema.find((col) => col.Key === "PRI");
    if (priKeyCol) {
      return { field: priKeyCol.Field, type: priKeyCol.Type };
    }
    // Fallback to first column
    if (schema.length > 0) {
      return { field: schema[0].Field, type: schema[0].Type };
    }
    return { field: "id", type: "" };
  };

  const handleRowClick = (idx, row) => {
    if (expandedRowIdx === idx) {
      setExpandedRowIdx(-1);
      setEditData({});
    } else {
      setExpandedRowIdx(idx);
      setEditData({ ...row });
    }
  };

  const handleInputChange = (field, val) => {
    setEditData((prev) => ({ ...prev, [field]: val }));
  };

  // Đặt lại mật khẩu nhanh về 123456 hoặc mật khẩu tùy ý
  const handleResetPasswordDirect = async (userId, customPass = "123456") => {
    if (!window.confirm(`Anh có chắc muốn đặt lại mật khẩu của tài khoản (ID: ${userId}) thành "${customPass}" không?`)) {
      return;
    }
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");
      const token = getToken();
      const res = await axios.post(
        `${API_BASE_URL}/api/sql/reset-password`,
        { userId, newPassword: customPass },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setSuccessMessage(`✅ ${res.data.message}`);
        // Cập nhật cả plain_password và password (hash) trong editData
        setEditData((prev) => ({
          ...prev,
          plain_password: customPass,
          password: res.data.hash || prev.password,
        }));
        setShowPasswordMap((prev) => ({ ...prev, [expandedRowIdx]: true }));
        // Tải lại rows từ server
        const tableRes = await axios.get(`${API_BASE_URL}/api/sql/tables/${selectedTable}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (tableRes.data?.success) {
          setRows(tableRes.data.rows || []);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update a row
  const handleUpdateRow = async (e, originalRow) => {
    e.preventDefault();
    setSuccessMessage("");
    setError("");

    const pkInfo = getPrimaryKeyInfo();
    const priKeyValue = originalRow[pkInfo.field];

    // Chuẩn bị các trường cập nhật (bỏ khóa chính để tránh lỗi đổi PK)
    const updatedFields = { ...editData };
    delete updatedFields[pkInfo.field];

    try {
      const token = getToken();
      const res = await axios.post(
        `${API_BASE_URL}/api/sql/tables/${selectedTable}/edit`,
        {
          primaryKeyField: pkInfo.field,
          primaryKeyValue: priKeyValue,
          updatedFields
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setSuccessMessage("Cập nhật hàng dữ liệu thành công! ✨");
        // Tải lại dữ liệu mới nhất từ server để đồng bộ mã băm và các cột
        const tableRes = await axios.get(`${API_BASE_URL}/api/sql/tables/${selectedTable}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (tableRes.data?.success) {
          setRows(tableRes.data.rows || []);
        }
        setExpandedRowIdx(-1);
        setEditData({});
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Lỗi cập nhật hàng");
    }
  };

  // Delete a row
  const handleDeleteRow = async (originalRow) => {
    const pkInfo = getPrimaryKeyInfo();
    const priKeyValue = originalRow[pkInfo.field];

    if (!window.confirm(`Bạn chắc chắn muốn XÓA hàng dữ liệu có ${pkInfo.field} = "${priKeyValue}"?`)) {
      return;
    }

    setError("");
    setSuccessMessage("");

    try {
      const token = getToken();
      const res = await axios.post(
        `${API_BASE_URL}/api/sql/tables/${selectedTable}/delete-row`,
        {
          primaryKeyField: pkInfo.field,
          primaryKeyValue: priKeyValue
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setSuccessMessage("Xóa hàng dữ liệu thành công! 🗑️");
        setRows((prev) => prev.filter((r) => r[pkInfo.field] !== priKeyValue));
        setExpandedRowIdx(-1);
        setEditData({});
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Lỗi xóa hàng");
    }
  };

  // Truncate table data
  const handleTruncateTable = async () => {
    const confirm1 = window.confirm(
      `⚠️ CẢNH BÁO NGUY HIỂM: Bạn có chắc chắn muốn XÓA SẠCH toàn bộ dữ liệu trong bảng "${selectedTable}"? Thao tác này KHÔNG THỂ HOÀN TÁC!`
    );
    if (!confirm1) return;

    const confirm2 = window.prompt(
      `Vui lòng nhập chính xác tên bảng "${selectedTable}" để xác nhận việc xóa sạch dữ liệu:`
    );
    if (confirm2 !== selectedTable) {
      alert("Xác nhận không khớp. Hủy thao tác làm sạch bảng.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const token = getToken();
      const res = await axios.post(
        `${API_BASE_URL}/api/sql/tables/${selectedTable}/truncate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setSuccessMessage(`Đã làm trống (truncate) toàn bộ bảng "${selectedTable}" thành công! ✨`);
        setRows([]);
        setExpandedRowIdx(-1);
        setEditData({});
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Lỗi làm sạch bảng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 font-sans text-black">
      {/* 1. Sidebar bên trái: Danh sách bảng */}
      <div className="w-full lg:w-60 shrink-0 bg-emerald-50/30 border border-emerald-100 p-4 rounded-2xl">
        <h3 className="font-extrabold text-sm text-emerald-950 uppercase tracking-wider mb-3">
          🗄️ Danh sách bảng SQL
        </h3>
        {tables.length === 0 ? (
          <p className="text-xs text-gray-500 italic">Không có bảng nào.</p>
        ) : (
          <div className="flex flex-wrap lg:flex-col gap-1.5">
            {tables.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTable(t)}
                className={`px-3 py-2 text-left text-xs font-bold rounded-xl transition-all ${
                  selectedTable === t
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white text-emerald-900 border border-emerald-100 hover:bg-emerald-50"
                }`}
              >
                📊 {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Nội dung bên phải: Cấu trúc & Dữ liệu */}
      <div className="flex-1 min-w-0 bg-white border border-emerald-50 rounded-2xl p-5 shadow-sm">
        {selectedTable ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-emerald-50 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-emerald-950">
                  Bảng: <span className="text-emerald-600">{selectedTable}</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Đang hiển thị {rows.length} hàng dữ liệu gần nhất
                </p>
              </div>

              <button
                onClick={handleTruncateTable}
                disabled={loading || rows.length === 0}
                className="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-black transition disabled:opacity-40"
              >
                🔥 Xóa sạch dữ liệu bảng (Truncate)
              </button>
            </div>

            {loading && (
              <div className="flex items-center gap-2 text-emerald-800 font-bold py-4 animate-pulse">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-emerald-600"></div>
                <span>Đang tải dữ liệu từ Cây Thế Giới...</span>
              </div>
            )}

            {error && (
              <div className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">
                ⚠️ {error}
              </div>
            )}

            {successMessage && (
              <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                {successMessage}
              </div>
            )}

            {!loading && (
              <div className="space-y-4">
                {/* Danh sách các dòng dữ liệu dưới dạng các hàng co giãn được (Collapsible list) */}
                <div className="space-y-2">
                  {rows.length === 0 ? (
                    <p className="text-sm text-gray-500 italic py-4 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50">
                      Bảng này chưa có dữ liệu hàng nào.
                    </p>
                  ) : (
                    rows.map((row, idx) => {
                      const pkInfo = getPrimaryKeyInfo();
                      const pkVal = row[pkInfo.field];
                      const isExpanded = expandedRowIdx === idx;

                      // Lấy tiêu đề preview của hàng (lấy cột thứ 2 làm tên hiển thị nếu có, hoặc slug/username/id)
                      const previewLabelField = schema[1]?.Field || pkInfo.field;
                      const previewLabel = row[previewLabelField] || "";

                      return (
                        <div
                          key={pkVal || idx}
                          className={`border rounded-xl transition bg-white ${
                            isExpanded ? "border-emerald-500 shadow-sm" : "border-gray-200 hover:border-emerald-200"
                          }`}
                        >
                          {/* Hàng Header để Click Co/Giãn */}
                          <div
                            onClick={() => handleRowClick(idx, row)}
                            className="p-3.5 flex justify-between items-center cursor-pointer text-xs md:text-sm"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold shrink-0">
                                {pkInfo.field}: {pkVal}
                              </span>
                              <span className="font-bold text-emerald-950 truncate">
                                {String(previewLabel).substring(0, 50)}
                              </span>
                            </div>
                            <span className="text-gray-400 font-bold ml-2">
                              {isExpanded ? "▲ Thu gọn" : "▼ Chi tiết"}
                            </span>
                          </div>

                          {/* Nội dung Form chỉnh sửa khi giãn ra */}
                          {isExpanded && (
                            <div className="border-t border-gray-150 p-4 bg-emerald-50/10 space-y-4">
                              <form onSubmit={(e) => handleUpdateRow(e, row)} className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                {schema.map((col) => {
                                  const isPk = col.Field === pkInfo.field;
                                  const isPasswordCol = col.Field.toLowerCase() === "password";

                                  // Ẩn cột plain_password riêng lẻ để không bị lặp form
                                  if (selectedTable?.toLowerCase() === "users" && col.Field.toLowerCase() === "plain_password") {
                                    return null;
                                  }

                                  if (isPasswordCol) {
                                    const currentPlainPass =
                                      editData.plain_password !== undefined && editData.plain_password !== null
                                        ? editData.plain_password
                                        : row.plain_password || "";
                                    const currentHash = editData.password || row.password || "";

                                    return (
                                      <div key={col.Field} className="flex flex-col gap-2 md:col-span-2 p-3.5 bg-gradient-to-br from-amber-50/70 to-emerald-50/40 border border-amber-200/80 rounded-2xl shadow-xs">
                                        <div className="flex flex-wrap justify-between items-center gap-2">
                                          <label className="font-black text-amber-950 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                                            <span>🔑</span> MẬT KHẨU TÀI KHOẢN (ĐĂNG NHẬP)
                                          </label>
                                          <div className="flex items-center gap-2">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setShowPasswordMap((prev) => ({
                                                  ...prev,
                                                  [idx]: !prev[idx],
                                                }))
                                              }
                                              className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-white hover:bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-300 shadow-xs transition flex items-center gap-1 cursor-pointer"
                                            >
                                              {showPasswordMap[idx] ? "🙈 Ẩn mật khẩu" : "👁️ Xem mật khẩu chưa hash"}
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleResetPasswordDirect(row.id || pkVal, "123456")}
                                              className="text-[11px] font-black text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 px-3 py-1 rounded-lg shadow-sm transition active:scale-95 flex items-center gap-1 cursor-pointer"
                                              title="Đặt lại mật khẩu tài khoản này về 123456 và tự động mã hóa Bcrypt"
                                            >
                                              <span>⚡</span> Đặt lại MK: 123456
                                            </button>
                                          </div>
                                        </div>

                                        {/* Ô nhập / xem mật khẩu chưa hash */}
                                        <div className="flex flex-col gap-1">
                                          <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-amber-900">
                                              Mật khẩu chưa hash (dùng để đăng nhập):
                                            </span>
                                            {showPasswordMap[idx] && (
                                              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/70 px-1.5 py-0.2 rounded">
                                                Đang hiển thị mật khẩu thực tế
                                              </span>
                                            )}
                                          </div>
                                          <input
                                            type={showPasswordMap[idx] ? "text" : "password"}
                                            value={currentPlainPass}
                                            onChange={(e) => handleInputChange("plain_password", e.target.value)}
                                            placeholder="Gõ mật khẩu mới tại đây (ví dụ: 123456)..."
                                            className="w-full px-3.5 py-2 border border-amber-300 focus:border-amber-500 rounded-xl bg-white focus:outline-none text-black font-mono text-xs focus:ring-2 focus:ring-amber-300/50 shadow-inner"
                                          />
                                        </div>

                                        {/* Mã hash Bcrypt lưu trong CSDL (Read-only) */}
                                        <div className="mt-1 pt-2 border-t border-amber-200/50 flex flex-col gap-1">
                                          <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-semibold text-gray-500 flex items-center gap-1">
                                              <span>🔒</span> Mã băm Bcrypt hệ thống (Lưu an toàn trong CSDL):
                                            </span>
                                            <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                                              Bcrypt 1-Way Hash
                                            </span>
                                          </div>
                                          <input
                                            type="text"
                                            readOnly
                                            disabled
                                            value={currentHash}
                                            title="Mã hash bcrypt này được hệ thống tự động băm để bảo mật tài khoản"
                                            className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 font-mono text-[10px] select-all cursor-not-allowed"
                                          />
                                        </div>

                                        <p className="text-[10px] text-gray-600 italic">
                                          💡 <b>Mẹo quản trị:</b> Bấm <span className="text-emerald-800 font-bold">👁️ Xem mật khẩu chưa hash</span> để xem mật khẩu đăng nhập của tài khoản. Khi anh đổi mật khẩu ở ô trên rồi bấm <b>Lưu chỉnh sửa</b> (hoặc bấm <b>⚡ Đặt lại MK: 123456</b>), hệ thống sẽ tự động băm Bcrypt vào cột <code>password</code> và lưu mật khẩu vào <code>plain_password</code>!
                                        </p>
                                      </div>
                                    );
                                  }

                                  return (
                                    <div key={col.Field} className="flex flex-col gap-1">
                                      <label className="font-bold text-emerald-950 uppercase text-[10px] tracking-wide">
                                        {col.Field} {isPk && <span className="text-red-500">(Khóa chính)</span>}
                                      </label>
                                      {col.Type.includes("text") ? (
                                        <textarea
                                          value={editData[col.Field] || ""}
                                          onChange={(e) => handleInputChange(col.Field, e.target.value)}
                                          className="px-3 py-2 border border-emerald-150 focus:border-emerald-500 rounded-xl bg-white focus:outline-none h-20 text-black"
                                        />
                                      ) : (
                                        <input
                                          type="text"
                                          value={editData[col.Field] === null ? "" : editData[col.Field]}
                                          onChange={(e) => handleInputChange(col.Field, e.target.value)}
                                          disabled={isPk} // Khóa chính không cho chỉnh sửa để bảo toàn khoá ngoại
                                          className={`px-3 py-2 border rounded-xl bg-white focus:outline-none text-black ${
                                            isPk
                                              ? "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
                                              : "border-emerald-150 focus:border-emerald-500"
                                          }`}
                                        />
                                      )}
                                    </div>
                                  );
                                })}

                                <div className="col-span-1 md:col-span-2 flex justify-end gap-2.5 pt-2 border-t border-gray-100 mt-2">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRow(row)}
                                    className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 hover:bg-red-600 hover:text-white rounded-xl font-bold transition"
                                  >
                                    🗑️ Xóa hàng
                                  </button>
                                  <button
                                    type="submit"
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-sm"
                                  >
                                    💾 Lưu chỉnh sửa
                                  </button>
                                </div>
                              </form>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic py-8 text-center">
            Vui lòng chọn một bảng từ danh sách bên trái để quản lý dữ liệu.
          </p>
        )}
      </div>
    </div>
  );
};

export default SQLManager;
