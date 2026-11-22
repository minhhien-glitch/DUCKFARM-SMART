USE [DUCKFARM_SMART]
GO
SET IDENTITY_INSERT [dbo].[ChuongTrai] ON
GO
INSERT [dbo].[ChuongTrai] ([MaChuong], [TenChuong], [MaSoChuong], [SucChua], [DienTich], [ViTri], [TrangThai], [GhiChu], [NgayTao]) VALUES (1, N'Chuồng 01', N'Grimaulm01', 1000, CAST(1000.00 AS Decimal(10, 2)), N'A1', N'Trống', N'sdw', CAST(N'2026-11-15T10:09:17.7608166' AS DateTime2))
GO
INSERT [dbo].[ChuongTrai] ([MaChuong], [TenChuong], [MaSoChuong], [SucChua], [DienTich], [ViTri], [TrangThai], [GhiChu], [NgayTao]) VALUES (2, N'Chuong A', N'CH-A', 1000, CAST(250.00 AS Decimal(10, 2)), N'Khu vuc 1', N'Dang hoat dong', N'Chuong nuoi vit thit', CAST(N'2026-11-15T14:56:26.6763822' AS DateTime2))
GO
INSERT [dbo].[ChuongTrai] ([MaChuong], [TenChuong], [MaSoChuong], [SucChua], [DienTich], [ViTri], [TrangThai], [GhiChu], [NgayTao]) VALUES (3, N'Chuong B', N'CH-B', 1500, CAST(300.00 AS Decimal(10, 2)), N'Khu vuc 2', N'Dang hoat dong', N'Chuong nuoi vit giong', CAST(N'2026-11-15T14:56:26.6763822' AS DateTime2))
GO
INSERT [dbo].[ChuongTrai] ([MaChuong], [TenChuong], [MaSoChuong], [SucChua], [DienTich], [ViTri], [TrangThai], [GhiChu], [NgayTao]) VALUES (5, N'Chuồng thử nghiệm SQL', N'CH-1795145654693', 500, NULL, N'Khu C', N'Dang hoat dong', N'Giống chuyên nuôi: Vịt cỏ', CAST(N'2026-11-20T10:34:14.8866793' AS DateTime2))
GO
SET IDENTITY_INSERT [dbo].[ChuongTrai] OFF
GO
