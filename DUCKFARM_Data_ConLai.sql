USE [DUCKFARM_SMART]
GO
SET IDENTITY_INSERT [dbo].[DanVit] ON
GO
INSERT [dbo].[DanVit] ([MaDan], [TenDan], [GiongVit], [SoLuong], [NgayNhap], [Tuoi], [TrangThai], [GhiChu], [MaChuong], [NgayTao]) VALUES (1, N'Dan vit thit A - Da cap nhat', N'Vit bau', 600, CAST(N'2026-11-19' AS Date), 35, N'Dang nuoi', N'Da cap nhat bang API PUT', 2, CAST(N'2026-11-19T19:37:45.0733650' AS DateTime2))
GO
INSERT [dbo].[DanVit] ([MaDan], [TenDan], [GiongVit], [SoLuong], [NgayNhap], [Tuoi], [TrangThai], [GhiChu], [MaChuong], [NgayTao]) VALUES (3, N'Lứa vịt GRIMAUD 06', N'Vịt cỏ', 100, CAST(N'2026-11-19' AS Date), 1, N'Đang nuôi', NULL, 2, CAST(N'2026-11-20T01:57:04.8899616' AS DateTime2))
GO
SET IDENTITY_INSERT [dbo].[DanVit] OFF
GO
SET IDENTITY_INSERT [dbo].[ThucAn] ON
GO
INSERT [dbo].[ThucAn] ([MaThucAn], [TenThucAn], [NhomThucAn], [SoLuongTon], [DonViTinh], [DonGia], [TonKhoToiThieu], [NgayTao]) VALUES (1, N'Ngô', N'Rau', CAST(100.00 AS Decimal(18, 2)), N'KG', CAST(0.00 AS Decimal(18, 2)), CAST(0.00 AS Decimal(18, 2)), CAST(N'2026-11-15T10:16:21.3271846' AS DateTime2))
GO
SET IDENTITY_INSERT [dbo].[ThucAn] OFF
GO
