const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { rateLimit } = require("express-rate-limit");

require("dotenv").config();

const { truyVan, truyVanThamSo, ketNoiSQL } = require("./db");

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use(cors());
app.use(express.json());
// =====================================
// XAC THUC TAI KHOAN DEMO
// =====================================

// Gioi han so lan thu dang nhap
const gioiHanDangNhap = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message:
      "Ban da thu dang nhap qua nhieu lan. Vui long thu lai sau 15 phut.",
  },
});

// API dang nhap
app.post("/api/login", gioiHanDangNhap, async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username ||
      !password
    ) {
      return res.status(400).json({
        message: "Vui long nhap ten dang nhap va mat khau",
      });
    }

    if (
      !process.env.DEMO_USERNAME ||
      !process.env.DEMO_PASSWORD_HASH ||
      !process.env.API_SECRET_KEY
    ) {
      return res.status(503).json({
        message: "He thong dang nhap chua duoc cau hinh",
      });
    }

    const dungTenDangNhap = username === process.env.DEMO_USERNAME;

    const dungMatKhau = await bcrypt.compare(
      password,
      process.env.DEMO_PASSWORD_HASH,
    );

    if (!dungTenDangNhap || !dungMatKhau) {
      return res.status(401).json({
        message: "Ten dang nhap hoac mat khau khong dung",
      });
    }

    const token = jwt.sign(
      { username: process.env.DEMO_USERNAME, role: "demo" },
      process.env.API_SECRET_KEY,
      {
        expiresIn: "2h",
        algorithm: "HS256",
      },
    );

    return res.json({
      message: "Dang nhap thanh cong",
      token,
      expiresIn: 7200,
    });
  } catch (error) {
    console.error("Loi dang nhap:", error.message);

    return res.status(500).json({
      message: "Khong the dang nhap",
    });
  }
});
// =====================================
// BAO VE CAC API THAY DOI DU LIEU
// =====================================

function xacThucDemo(req, res, next) {
  const authorization = req.headers.authorization || "";
  const [loai, token] = authorization.split(" ");

  if (loai !== "Bearer" || !token) {
    return res.status(401).json({
      message: "Ban can dang nhap de thay doi du lieu",
    });
  }

  if (!process.env.API_SECRET_KEY) {
    return res.status(503).json({
      message: "He thong xac thuc chua duoc cau hinh",
    });
  }

  try {
    const thongTin = jwt.verify(token, process.env.API_SECRET_KEY, {
      algorithms: ["HS256"],
    });

    if (
      thongTin.role !== "demo" ||
      thongTin.username !== process.env.DEMO_USERNAME
    ) {
      return res.status(403).json({
        message: "Ban khong co quyen thuc hien thao tac nay",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Phien dang nhap khong hop le hoac da het han",
    });
  }
}

// Yeu cau dang nhap khi them, sua, xoa du lieu
app.use("/api", (req, res, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    return xacThucDemo(req, res, next);
  }

  next();
});
// =====================================
// 1. KIEM TRA BACKEND
// =====================================

app.get("/", (req, res) => {
  res.json({
    message: "DUCKFARM SMART BACKEND dang hoat dong!",
  });
});

// =====================================
// 2. GET - LAY DANH SACH CHUONG TRAI
// =====================================

app.get("/api/chuongtrai", (req, res) => {
  const cauLenh = "SELECT * FROM dbo.ChuongTrai ORDER BY MaChuong";

  truyVan(cauLenh, (err, rows) => {
    if (err) {
      console.error("Loi GET:", err);
      return res.status(500).json({
        message: "Khong the lay danh sach chuong trai",
      });
    }

    res.json(rows);
  });
});

// =====================================
// 3. POST - THEM CHUONG TRAI
// =====================================

app.post("/api/chuongtrai", (req, res) => {
  const { TenChuong, MaSoChuong, SucChua, DienTich, ViTri, TrangThai, GhiChu } =
    req.body;

  if (
    typeof TenChuong !== "string" ||
    !TenChuong.trim() ||
    typeof MaSoChuong !== "string" ||
    !MaSoChuong.trim() ||
    !Number.isInteger(SucChua) ||
    SucChua < 0
  ) {
    return res.status(400).json({
      message: "Ten chuong, ma so va suc chua khong hop le",
    });
  }

  const cauLenh = `
        INSERT INTO dbo.ChuongTrai
        (
            TenChuong,
            MaSoChuong,
            SucChua,
            DienTich,
            ViTri,
            TrangThai,
            GhiChu
        )
        OUTPUT INSERTED.MaChuong
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

  const thamSo = [
    TenChuong.trim(),
    MaSoChuong.trim(),
    SucChua,
    DienTich ?? null,
    ViTri ?? null,
    TrangThai ?? "Dang hoat dong",
    GhiChu ?? null,
  ];

  truyVanThamSo(cauLenh, thamSo, (err, rows) => {
    if (err) {
      console.error("Loi POST:", err);

      return res.status(500).json({
        message: "Khong the them chuong trai",
      });
    }

    res.status(201).json({
      message: "Them chuong trai thanh cong",
      MaChuong: rows[0].MaChuong,
    });
  });
});

// =====================================
// 4. PUT - SUA THONG TIN CHUONG TRAI
// =====================================

app.put("/api/chuongtrai/:id", (req, res) => {
  const MaChuong = Number(req.params.id);

  if (!Number.isInteger(MaChuong) || MaChuong <= 0) {
    return res.status(400).json({
      message: "Ma chuong khong hop le",
    });
  }

  const { TenChuong, MaSoChuong, SucChua, DienTich, ViTri, TrangThai, GhiChu } =
    req.body;

  if (
    typeof TenChuong !== "string" ||
    !TenChuong.trim() ||
    typeof MaSoChuong !== "string" ||
    !MaSoChuong.trim() ||
    !Number.isInteger(SucChua) ||
    SucChua < 0
  ) {
    return res.status(400).json({
      message: "Du lieu cap nhat khong hop le",
    });
  }

  const cauLenh = `
        UPDATE dbo.ChuongTrai
        SET
            TenChuong = ?,
            MaSoChuong = ?,
            SucChua = ?,
            DienTich = ?,
            ViTri = ?,
            TrangThai = ?,
            GhiChu = ?
        OUTPUT INSERTED.MaChuong
        WHERE MaChuong = ?
    `;

  const thamSo = [
    TenChuong.trim(),
    MaSoChuong.trim(),
    SucChua,
    DienTich ?? null,
    ViTri ?? null,
    TrangThai ?? "Dang hoat dong",
    GhiChu ?? null,
    MaChuong,
  ];

  truyVanThamSo(cauLenh, thamSo, (err, rows) => {
    if (err) {
      console.error("Loi PUT:", err);
      return res.status(500).json({
        message: "Khong the cap nhat chuong trai",
      });
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        message: "Khong tim thay chuong trai",
      });
    }

    res.json({
      message: "Cap nhat chuong trai thanh cong",
    });
  });
});

// =====================================
// 5. DELETE - XOA CHUONG TRAI
// =====================================

app.delete("/api/chuongtrai/:id", (req, res) => {
  const MaChuong = Number(req.params.id);

  if (!Number.isInteger(MaChuong) || MaChuong <= 0) {
    return res.status(400).json({
      message: "Ma chuong khong hop le",
    });
  }

  const cauLenh = `
        DELETE FROM dbo.ChuongTrai
        OUTPUT DELETED.MaChuong
        WHERE MaChuong = ?
    `;

  truyVanThamSo(cauLenh, [MaChuong], (err, rows) => {
    if (err) {
      console.error("Loi DELETE:", err);
      return res.status(500).json({
        message: "Khong the xoa chuong trai",
      });
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        message: "Khong tim thay chuong trai",
      });
    }

    res.json({
      message: "Xoa chuong trai thanh cong",
    });
  });
});

// API GET - Lay danh sach dan vit
app.get("/api/danvit", (req, res) => {
  const cauLenh = "SELECT * FROM dbo.DanVit ORDER BY MaDan";

  truyVan(cauLenh, (err, rows) => {
    if (err) {
      console.error("Loi GET DanVit:", err);
      return res.status(500).json({
        message: "Khong the lay danh sach dan vit",
      });
    }

    res.json(rows);
  });
});

// API POST - Them dan vit moi
app.post("/api/danvit", (req, res) => {
  const {
    TenDan,
    GiongVit,
    SoLuong,
    NgayNhap,
    Tuoi,
    TrangThai,
    GhiChu,
    MaChuong,
  } = req.body;

  // Kiem tra du lieu dau vao
  if (!TenDan || !GiongVit || !Number.isInteger(SoLuong) || SoLuong < 0) {
    return res.status(400).json({
      message: "Thong tin dan vit khong hop le",
    });
  }

  const cauLenh = `
        INSERT INTO dbo.DanVit
        (TenDan, GiongVit, SoLuong, NgayNhap, Tuoi, TrangThai, GhiChu, MaChuong)
        OUTPUT INSERTED.MaDan
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

  const thamSo = [
    TenDan,
    GiongVit,
    SoLuong,
    NgayNhap || null,
    Tuoi ?? null,
    TrangThai || null,
    GhiChu || null,
    MaChuong ?? null,
  ];

  truyVanThamSo(cauLenh, thamSo, (err, rows) => {
    if (err) {
      console.error("Loi POST DanVit:", err);
      return res.status(500).json({
        message: "Khong the them dan vit",
      });
    }

    res.status(201).json({
      message: "Them dan vit thanh cong",
      MaDan: rows[0].MaDan,
    });
  });
});

// API PUT - Cap nhat thong tin dan vit
app.put("/api/danvit/:id", (req, res) => {
  const maDan = Number(req.params.id);

  const {
    TenDan,
    GiongVit,
    SoLuong,
    NgayNhap,
    Tuoi,
    TrangThai,
    GhiChu,
    MaChuong,
  } = req.body;

  if (
    !Number.isInteger(maDan) ||
    maDan <= 0 ||
    typeof TenDan !== "string" ||
    !TenDan.trim() ||
    typeof GiongVit !== "string" ||
    !GiongVit.trim() ||
    !Number.isInteger(SoLuong) ||
    SoLuong < 0
  ) {
    return res.status(400).json({
      message: "Thong tin dan vit khong hop le",
    });
  }

  const cauLenh = `
        UPDATE dbo.DanVit
        SET TenDan = ?, GiongVit = ?, SoLuong = ?,
            NgayNhap = ?, Tuoi = ?, TrangThai = ?,
            GhiChu = ?, MaChuong = ?
        OUTPUT INSERTED.MaDan
        WHERE MaDan = ?
    `;

  const thamSo = [
    TenDan.trim(),
    GiongVit.trim(),
    SoLuong,
    NgayNhap || null,
    Tuoi ?? null,
    TrangThai || null,
    GhiChu || null,
    MaChuong ?? null,
    maDan,
  ];

  truyVanThamSo(cauLenh, thamSo, (err, rows) => {
    if (err) {
      console.error("Loi PUT DanVit:", err);
      return res.status(500).json({
        message: "Khong the cap nhat dan vit",
      });
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        message: "Khong tim thay dan vit",
      });
    }

    res.json({
      message: "Cap nhat dan vit thanh cong",
    });
  });
});

// API DELETE - Xoa dan vit
app.delete("/api/danvit/:id", (req, res) => {
  const maDan = Number(req.params.id);

  if (!Number.isInteger(maDan) || maDan <= 0) {
    return res.status(400).json({
      message: "Ma dan vit khong hop le",
    });
  }

  const cauLenh = `
        DELETE FROM dbo.DanVit
        OUTPUT DELETED.MaDan
        WHERE MaDan = ?
    `;

  truyVanThamSo(cauLenh, [maDan], (err, rows) => {
    if (err) {
      console.error("Loi DELETE DanVit:", err);
      return res.status(500).json({
        message: "Khong the xoa dan vit",
      });
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        message: "Khong tim thay dan vit",
      });
    }

    res.json({
      message: "Xoa dan vit thanh cong",
    });
  });
});

// =====================================
// API QUAN LY THUC AN
// =====================================

// GET - Lay danh sach thuc an
app.get("/api/thucan", (req, res) => {
  const sql = "SELECT * FROM dbo.ThucAn ORDER BY MaThucAn";

  truyVan(sql, (err, rows) => {
    if (err) {
      console.error("Loi GET ThucAn:", err);
      return res.status(500).json({
        message: "Khong the lay danh sach thuc an",
      });
    }

    res.json(rows);
  });
});

// POST - Them thuc an moi
app.post("/api/thucan", (req, res) => {
  const {
    TenThucAn,
    NhomThucAn,
    SoLuongTon,
    DonViTinh,
    DonGia,
    TonKhoToiThieu,
  } = req.body;

  if (
    typeof TenThucAn !== "string" ||
    !TenThucAn.trim() ||
    !Number.isFinite(SoLuongTon) ||
    SoLuongTon < 0 ||
    !Number.isFinite(DonGia) ||
    DonGia < 0
  ) {
    return res.status(400).json({
      message: "Thong tin thuc an khong hop le",
    });
  }

  const sql = `
        INSERT INTO dbo.ThucAn
        (TenThucAn, NhomThucAn, SoLuongTon,
         DonViTinh, DonGia, TonKhoToiThieu)
        OUTPUT INSERTED.MaThucAn
        VALUES (?, ?, ?, ?, ?, ?)
    `;

  const params = [
    TenThucAn.trim(),
    NhomThucAn || null,
    SoLuongTon,
    DonViTinh || null,
    DonGia,
    TonKhoToiThieu ?? null,
  ];

  truyVanThamSo(sql, params, (err, rows) => {
    if (err) {
      console.error("Loi POST ThucAn:", err);
      return res.status(500).json({
        message: "Khong the them thuc an",
      });
    }

    res.status(201).json({
      message: "Them thuc an thanh cong",
      MaThucAn: rows[0].MaThucAn,
    });
  });
});

// PUT - Cap nhat thuc an
app.put("/api/thucan/:id", (req, res) => {
  const id = Number(req.params.id);

  const {
    TenThucAn,
    NhomThucAn,
    SoLuongTon,
    DonViTinh,
    DonGia,
    TonKhoToiThieu,
  } = req.body;

  if (
    !Number.isInteger(id) ||
    id <= 0 ||
    typeof TenThucAn !== "string" ||
    !TenThucAn.trim() ||
    !Number.isFinite(SoLuongTon) ||
    SoLuongTon < 0 ||
    !Number.isFinite(DonGia) ||
    DonGia < 0
  ) {
    return res.status(400).json({
      message: "Thong tin thuc an khong hop le",
    });
  }

  const sql = `
        UPDATE dbo.ThucAn
        SET TenThucAn = ?,
            NhomThucAn = ?,
            SoLuongTon = ?,
            DonViTinh = ?,
            DonGia = ?,
            TonKhoToiThieu = ?
        OUTPUT INSERTED.MaThucAn
        WHERE MaThucAn = ?
    `;

  const params = [
    TenThucAn.trim(),
    NhomThucAn || null,
    SoLuongTon,
    DonViTinh || null,
    DonGia,
    TonKhoToiThieu ?? null,
    id,
  ];

  truyVanThamSo(sql, params, (err, rows) => {
    if (err) {
      console.error("Loi PUT ThucAn:", err);
      return res.status(500).json({
        message: "Khong the cap nhat thuc an",
      });
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        message: "Khong tim thay thuc an",
      });
    }

    res.json({
      message: "Cap nhat thuc an thanh cong",
    });
  });
});

// DELETE - Xoa thuc an
app.delete("/api/thucan/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Ma thuc an khong hop le",
    });
  }

  const sql = `
        DELETE FROM dbo.ThucAn
        OUTPUT DELETED.MaThucAn
        WHERE MaThucAn = ?
    `;

  truyVanThamSo(sql, [id], (err, rows) => {
    if (err) {
      console.error("Loi DELETE ThucAn:", err);
      return res.status(500).json({
        message: "Khong the xoa thuc an",
      });
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        message: "Khong tim thay thuc an",
      });
    }

    res.json({
      message: "Xoa thuc an thanh cong",
    });
  });
});

// =====================================
// API QUAN LY HO SO SUC KHOE
// =====================================

// GET - Lay danh sach ho so suc khoe
app.get("/api/hososuckhoe", (req, res) => {
  const sql = "SELECT * FROM dbo.HoSoSucKhoe ORDER BY MaHoSo";

  truyVan(sql, (err, rows) => {
    if (err) {
      console.error("Loi GET HoSoSucKhoe:", err);
      return res.status(500).json({
        message: "Khong the lay danh sach ho so",
      });
    }

    res.json(rows);
  });
});

// POST - Them ho so suc khoe
app.post("/api/hososuckhoe", (req, res) => {
  const {
    TieuDe,
    MaDan,
    TenDanLuuTru,
    NgayThucHien,
    NguoiThucHien,
    TrangThai,
    GhiChu,
  } = req.body;

  if (
    typeof TieuDe !== "string" ||
    !TieuDe.trim() ||
    (MaDan != null && (!Number.isInteger(MaDan) || MaDan <= 0))
  ) {
    return res.status(400).json({
      message: "Thong tin ho so khong hop le",
    });
  }

  const sql = `
        INSERT INTO dbo.HoSoSucKhoe
        (TieuDe, MaDan, TenDanLuuTru,
         NgayThucHien, NguoiThucHien,
         TrangThai, GhiChu)
        OUTPUT INSERTED.MaHoSo
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

  const params = [
    TieuDe.trim(),
    MaDan ?? null,
    TenDanLuuTru ?? null,
    NgayThucHien || null,
    NguoiThucHien ?? null,
    TrangThai ?? null,
    GhiChu ?? null,
  ];

  truyVanThamSo(sql, params, (err, rows) => {
    if (err) {
      console.error("Loi POST HoSoSucKhoe:", err);
      return res.status(500).json({
        message: "Khong the them ho so",
      });
    }

    res.status(201).json({
      message: "Them ho so suc khoe thanh cong",
      MaHoSo: rows[0].MaHoSo,
    });
  });
});

// PUT - Cap nhat ho so suc khoe
app.put("/api/hososuckhoe/:id", (req, res) => {
  const id = Number(req.params.id);

  const {
    TieuDe,
    MaDan,
    TenDanLuuTru,
    NgayThucHien,
    NguoiThucHien,
    TrangThai,
    GhiChu,
  } = req.body;

  if (
    !Number.isInteger(id) ||
    id <= 0 ||
    typeof TieuDe !== "string" ||
    !TieuDe.trim() ||
    (MaDan != null && (!Number.isInteger(MaDan) || MaDan <= 0))
  ) {
    return res.status(400).json({
      message: "Thong tin ho so khong hop le",
    });
  }

  const sql = `
        UPDATE dbo.HoSoSucKhoe
        SET TieuDe = ?,
            MaDan = ?,
            TenDanLuuTru = ?,
            NgayThucHien = ?,
            NguoiThucHien = ?,
            TrangThai = ?,
            GhiChu = ?
        OUTPUT INSERTED.MaHoSo
        WHERE MaHoSo = ?
    `;

  const params = [
    TieuDe.trim(),
    MaDan ?? null,
    TenDanLuuTru ?? null,
    NgayThucHien || null,
    NguoiThucHien ?? null,
    TrangThai ?? null,
    GhiChu ?? null,
    id,
  ];

  truyVanThamSo(sql, params, (err, rows) => {
    if (err) {
      console.error("Loi PUT HoSoSucKhoe:", err);
      return res.status(500).json({
        message: "Khong the cap nhat ho so",
      });
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        message: "Khong tim thay ho so",
      });
    }

    res.json({
      message: "Cap nhat ho so suc khoe thanh cong",
    });
  });
});

// DELETE - Xoa ho so suc khoe
app.delete("/api/hososuckhoe/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Ma ho so khong hop le",
    });
  }

  const sql = `
        DELETE FROM dbo.HoSoSucKhoe
        OUTPUT DELETED.MaHoSo
        WHERE MaHoSo = ?
    `;

  truyVanThamSo(sql, [id], (err, rows) => {
    if (err) {
      console.error("Loi DELETE HoSoSucKhoe:", err);
      return res.status(500).json({
        message: "Khong the xoa ho so",
      });
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        message: "Khong tim thay ho so",
      });
    }

    res.json({
      message: "Xoa ho so suc khoe thanh cong",
    });
  });
});

// =====================================
// API QUAN LY GIAO DICH TAI CHINH
// =====================================

// GET - Lay danh sach giao dich
app.get("/api/giaodichtaichinh", (req, res) => {
  const sql = "SELECT * FROM dbo.GiaoDichTaiChinh ORDER BY MaGiaoDich";

  truyVan(sql, (err, rows) => {
    if (err) {
      console.error("Loi GET GiaoDich:", err);
      return res.status(500).json({
        message: "Khong the lay danh sach giao dich",
      });
    }

    res.json(rows);
  });
});

// POST - Them giao dich moi
app.post("/api/giaodichtaichinh", (req, res) => {
  const {
    TieuDe,
    LoaiGiaoDich,
    NgayGiaoDich,
    MaDan,
    TenDanLuuTru,
    SoTien,
    GhiChu,
  } = req.body;

  if (
    typeof TieuDe !== "string" ||
    !TieuDe.trim() ||
    typeof LoaiGiaoDich !== "string" ||
    !LoaiGiaoDich.trim() ||
    !Number.isFinite(SoTien) ||
    SoTien < 0 ||
    (MaDan != null && (!Number.isInteger(MaDan) || MaDan <= 0))
  ) {
    return res.status(400).json({
      message: "Thong tin giao dich khong hop le",
    });
  }

  const sql = `
        INSERT INTO dbo.GiaoDichTaiChinh
        (TieuDe, LoaiGiaoDich, NgayGiaoDich,
         MaDan, TenDanLuuTru, SoTien, GhiChu)
        OUTPUT INSERTED.MaGiaoDich
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

  const params = [
    TieuDe.trim(),
    LoaiGiaoDich.trim(),
    NgayGiaoDich || null,
    MaDan ?? null,
    TenDanLuuTru ?? null,
    SoTien,
    GhiChu ?? null,
  ];

  truyVanThamSo(sql, params, (err, rows) => {
    if (err) {
      console.error("Loi POST GiaoDich:", err);
      return res.status(500).json({
        message: "Khong the them giao dich",
      });
    }

    res.status(201).json({
      message: "Them giao dich thanh cong",
      MaGiaoDich: rows[0].MaGiaoDich,
    });
  });
});

// PUT - Cap nhat giao dich
app.put("/api/giaodichtaichinh/:id", (req, res) => {
  const id = Number(req.params.id);

  const {
    TieuDe,
    LoaiGiaoDich,
    NgayGiaoDich,
    MaDan,
    TenDanLuuTru,
    SoTien,
    GhiChu,
  } = req.body;

  if (
    !Number.isInteger(id) ||
    id <= 0 ||
    typeof TieuDe !== "string" ||
    !TieuDe.trim() ||
    typeof LoaiGiaoDich !== "string" ||
    !LoaiGiaoDich.trim() ||
    !Number.isFinite(SoTien) ||
    SoTien < 0 ||
    (MaDan != null && (!Number.isInteger(MaDan) || MaDan <= 0))
  ) {
    return res.status(400).json({
      message: "Thong tin giao dich khong hop le",
    });
  }

  const sql = `
        UPDATE dbo.GiaoDichTaiChinh
        SET TieuDe = ?,
            LoaiGiaoDich = ?,
            NgayGiaoDich = ?,
            MaDan = ?,
            TenDanLuuTru = ?,
            SoTien = ?,
            GhiChu = ?
        OUTPUT INSERTED.MaGiaoDich
        WHERE MaGiaoDich = ?
    `;

  const params = [
    TieuDe.trim(),
    LoaiGiaoDich.trim(),
    NgayGiaoDich || null,
    MaDan ?? null,
    TenDanLuuTru ?? null,
    SoTien,
    GhiChu ?? null,
    id,
  ];

  truyVanThamSo(sql, params, (err, rows) => {
    if (err) {
      console.error("Loi PUT GiaoDich:", err);
      return res.status(500).json({
        message: "Khong the cap nhat giao dich",
      });
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        message: "Khong tim thay giao dich",
      });
    }

    res.json({
      message: "Cap nhat giao dich thanh cong",
    });
  });
});

// DELETE - Xoa giao dich
app.delete("/api/giaodichtaichinh/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Ma giao dich khong hop le",
    });
  }

  const sql = `
        DELETE FROM dbo.GiaoDichTaiChinh
        OUTPUT DELETED.MaGiaoDich
        WHERE MaGiaoDich = ?
    `;

  truyVanThamSo(sql, [id], (err, rows) => {
    if (err) {
      console.error("Loi DELETE GiaoDich:", err);
      return res.status(500).json({
        message: "Khong the xoa giao dich",
      });
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        message: "Khong tim thay giao dich",
      });
    }

    res.json({
      message: "Xoa giao dich thanh cong",
    });
  });
});

// =====================================
// 6. KHOI DONG BACKEND
// =====================================


// New monitoring APIs. Run 06_NangCap_TheoDoi.sql before enabling these routes.
app.get('/api/theodoisuckhoe',(req,res)=>{
  truyVan('SELECT * FROM dbo.TheoDoiSucKhoe ORDER BY NgayGhiNhan, MaTheoDoi',(err,rows)=>err?res.status(500).json({message:'Khong tai duoc lich su suc khoe'}):res.json(rows));
});
app.post('/api/theodoisuckhoe',(req,res)=>{
  const {MaDan,NgayGhiNhan,SoConBenh,SoConChet,GhiChu}=req.body||{};
  if(!Number.isInteger(MaDan)||MaDan<=0||!/^\d{4}-\d{2}-\d{2}$/.test(NgayGhiNhan||'')||!Number.isInteger(SoConBenh)||SoConBenh<0||!Number.isInteger(SoConChet)||SoConChet<0||typeof GhiChu!=='string'||GhiChu.length>500)return res.status(400).json({message:'Du lieu theo doi khong hop le'});
  const sql=`SET XACT_ABORT ON; BEGIN TRAN;
    DECLARE @current int;
    SELECT @current=SoLuong FROM dbo.DanVit WITH (UPDLOCK,HOLDLOCK) WHERE MaDan=?;
    IF @current IS NULL OR @current < ? OR @current - ? < ? BEGIN ROLLBACK TRAN; THROW 50001,'So luong khong hop le',1; END;
    UPDATE dbo.DanVit SET SoLuong=SoLuong-? WHERE MaDan=?;
    INSERT INTO dbo.TheoDoiSucKhoe(MaDan,NgayGhiNhan,SoConBenh,SoConChet,GhiChu) VALUES(?,?,?,?,?);
    COMMIT TRAN; SELECT 1 AS ok;`;
  const args=[MaDan,SoConChet,SoConChet,SoConBenh,SoConChet,MaDan,MaDan,NgayGhiNhan,SoConBenh,SoConChet,GhiChu||null];
  truyVanThamSo(sql,args,(err)=>err?(console.error('Loi theo doi suc khoe:',err),res.status(400).json({message:'Khong luu duoc: kiem tra so luong con va du lieu'})):res.status(201).json({message:'Da ghi nhan'}));
});
app.get('/api/tiemphong',(req,res)=>truyVan('SELECT * FROM dbo.TheoDoiTiemPhong ORDER BY NgayTiem,MaTiem',(err,rows)=>err?res.status(500).json({message:'Khong tai duoc tiem phong'}):res.json(rows)));
app.post('/api/tiemphong',(req,res)=>{
 const {MaDan,TenVacXin,NgayTiem,NgayNhacLai,GhiChu}=req.body||{};
 if(!Number.isInteger(MaDan)||MaDan<=0||typeof TenVacXin!=='string'||!TenVacXin.trim()||TenVacXin.length>150||!/^\d{4}-\d{2}-\d{2}$/.test(NgayTiem||'')||(NgayNhacLai&&!/^\d{4}-\d{2}-\d{2}$/.test(NgayNhacLai))||String(GhiChu||'').length>500)return res.status(400).json({message:'Du lieu tiem phong khong hop le'});
 truyVanThamSo('INSERT INTO dbo.TheoDoiTiemPhong(MaDan,TenVacXin,NgayTiem,NgayNhacLai,GhiChu) VALUES(?,?,?,?,?)',[MaDan,TenVacXin.trim(),NgayTiem,NgayNhacLai||null,GhiChu||null],err=>err?(console.error(err),res.status(500).json({message:'Khong luu duoc tiem phong'})):res.status(201).json({message:'Da luu'}));
});
app.get('/api/moitruong',(req,res)=>truyVan('SELECT * FROM dbo.TheoDoiMoiTruong ORDER BY NgayDo,MaDo',(err,rows)=>err?res.status(500).json({message:'Khong tai duoc moi truong'}):res.json(rows)));
app.post('/api/moitruong',(req,res)=>{
 const {MaChuong,NgayDo,NhietDo,DoAm,DoSach,GhiChu}=req.body||{};
 if(!Number.isInteger(MaChuong)||MaChuong<=0||!/^\d{4}-\d{2}-\d{2}$/.test(NgayDo||'')||!Number.isFinite(NhietDo)||NhietDo< -30||NhietDo>80||!Number.isFinite(DoAm)||DoAm<0||DoAm>100||!['Sạch','Bẩn'].includes(DoSach)||String(GhiChu||'').length>500)return res.status(400).json({message:'Du lieu moi truong khong hop le'});
 truyVanThamSo('INSERT INTO dbo.TheoDoiMoiTruong(MaChuong,NgayDo,NhietDo,DoAm,DoSach,GhiChu) VALUES(?,?,?,?,?,?)',[MaChuong,NgayDo,NhietDo,DoAm,DoSach,GhiChu||null],err=>err?(console.error(err),res.status(500).json({message:'Khong luu duoc moi truong'})):res.status(201).json({message:'Da luu'}));
});

app.listen(PORT, () => {
  console.log(`Backend dang chay tai http://localhost:${PORT}`);

  ketNoiSQL();
});
