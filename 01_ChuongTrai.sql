USE [DUCKFARM_SMART]
GO

/****** Object:  Table [dbo].[ChuongTrai]    Script Date: 22-Nov-26 12:29:02 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ChuongTrai](
	[MaChuong] [int] IDENTITY(1,1) NOT NULL,
	[TenChuong] [nvarchar](150) NULL,
	[MaSoChuong] [nvarchar](50) NULL,
	[SucChua] [int] NULL,
	[DienTich] [decimal](10, 2) NULL,
	[ViTri] [nvarchar](200) NULL,
	[TrangThai] [nvarchar](50) NULL,
	[GhiChu] [nvarchar](500) NULL,
	[NgayTao] [datetime2](7) NULL,
 CONSTRAINT [PK__ChuongTr__0D6A804C0A9DDF19] PRIMARY KEY CLUSTERED
(
	[MaChuong] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY],
 CONSTRAINT [UQ__ChuongTr__F6D4E198ECFBB4A8] UNIQUE NONCLUSTERED
(
	[MaSoChuong] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[ChuongTrai] ADD  CONSTRAINT [DF__ChuongTra__Trang__4CA06362]  DEFAULT (N'Dang hoat dong') FOR [TrangThai]
GO

ALTER TABLE [dbo].[ChuongTrai] ADD  CONSTRAINT [DF__ChuongTra__NgayT__4D94879B]  DEFAULT (sysdatetime()) FOR [NgayTao]
GO

ALTER TABLE [dbo].[ChuongTrai]  WITH CHECK ADD  CONSTRAINT [CK__ChuongTra__DienT__4BAC3F29] CHECK  (([DienTich] IS NULL OR [DienTich]>=(0)))
GO

ALTER TABLE [dbo].[ChuongTrai] CHECK CONSTRAINT [CK__ChuongTra__DienT__4BAC3F29]
GO

ALTER TABLE [dbo].[ChuongTrai]  WITH CHECK ADD  CONSTRAINT [CK__ChuongTra__SucCh__4AB81AF0] CHECK  (([SucChua]>=(0)))
GO

ALTER TABLE [dbo].[ChuongTrai] CHECK CONSTRAINT [CK__ChuongTra__SucCh__4AB81AF0]
GO
