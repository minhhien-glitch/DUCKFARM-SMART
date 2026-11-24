SET XACT_ABORT ON;
IF DB_NAME() <> N'DUCKFARM_SMART' THROW 50001, N'Sai co so du lieu', 1;
BEGIN TRAN;
IF OBJECT_ID('dbo.SuDungVatTu','U') IS NULL
CREATE TABLE dbo.SuDungVatTu (Id int IDENTITY PRIMARY KEY, MaThucAn int NOT NULL REFERENCES dbo.ThucAn(MaThucAn), MaDan int NOT NULL REFERENCES dbo.DanVit(MaDan), Ngay date NOT NULL, SoLuong decimal(18,2) NOT NULL CHECK(SoLuong>0), DonVi nvarchar(30) NOT NULL, GhiChu nvarchar(500), RequestId uniqueidentifier NOT NULL UNIQUE);
IF OBJECT_ID('dbo.TheoDoiTangTruong','U') IS NULL
CREATE TABLE dbo.TheoDoiTangTruong (Id int IDENTITY PRIMARY KEY, MaDan int NOT NULL REFERENCES dbo.DanVit(MaDan), Ngay date NOT NULL, CanNang decimal(10,3) NOT NULL CHECK(CanNang>0), MucTieu decimal(10,3) NULL CHECK(MucTieu>0), SoCon int NOT NULL CHECK(SoCon>0), UNIQUE(MaDan,Ngay));
IF OBJECT_ID('dbo.KeHoachXuatBan','U') IS NULL
CREATE TABLE dbo.KeHoachXuatBan (MaDan int PRIMARY KEY REFERENCES dbo.DanVit(MaDan), Ngay date NOT NULL, SoCon int NOT NULL CHECK(SoCon>0), CanNang decimal(10,3) NOT NULL CHECK(CanNang>0), Gia decimal(18,2) NOT NULL CHECK(Gia>=0), ChiPhiThem decimal(18,2) NOT NULL CHECK(ChiPhiThem>=0));
COMMIT;
SELECT N'Cap nhat V2 thanh cong' AS KetQua;
