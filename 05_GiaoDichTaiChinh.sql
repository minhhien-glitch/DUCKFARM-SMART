USE [DUCKFARM_SMART]
GO

/****** Object:  Table [dbo].[GiaoDichTaiChinh]    Script Date: 22-Nov-26 9:18:34 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[GiaoDichTaiChinh](
	[MaGiaoDich] [int] IDENTITY(1,1) NOT NULL,
	[TieuDe] [nvarchar](200) NULL,
	[LoaiGiaoDich] [nvarchar](20) NULL,
	[NgayGiaoDich] [date] NULL,
	[MaDan] [int] NULL,
	[TenDanLuuTru] [nvarchar](150) NULL,
	[SoTien] [decimal](18, 2) NULL,
	[GhiChu] [nvarchar](500) NULL,
	[NgayTao] [datetime2](7) NULL,
 CONSTRAINT [PK__GiaoDich__0A2A24EB327A23ED] PRIMARY KEY CLUSTERED
(
	[MaGiaoDich] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[GiaoDichTaiChinh] ADD  CONSTRAINT [DF__GiaoDichT__NgayT__6477ECF3]  DEFAULT (sysdatetime()) FOR [NgayTao]
GO

ALTER TABLE [dbo].[GiaoDichTaiChinh]  WITH CHECK ADD  CONSTRAINT [FK_GiaoDichTaiChinh_DanVit] FOREIGN KEY([MaDan])
REFERENCES [dbo].[DanVit] ([MaDan])
ON DELETE SET NULL
GO

ALTER TABLE [dbo].[GiaoDichTaiChinh] CHECK CONSTRAINT [FK_GiaoDichTaiChinh_DanVit]
GO

ALTER TABLE [dbo].[GiaoDichTaiChinh]  WITH CHECK ADD  CONSTRAINT [CK__GiaoDichT__LoaiG__628FA481] CHECK  (([LoaiGiaoDich]=N'chi' OR [LoaiGiaoDich]=N'thu'))
GO

ALTER TABLE [dbo].[GiaoDichTaiChinh] CHECK CONSTRAINT [CK__GiaoDichT__LoaiG__628FA481]
GO

ALTER TABLE [dbo].[GiaoDichTaiChinh]  WITH CHECK ADD  CONSTRAINT [CK__GiaoDichT__SoTie__6383C8BA] CHECK  (([SoTien]>=(0)))
GO

ALTER TABLE [dbo].[GiaoDichTaiChinh] CHECK CONSTRAINT [CK__GiaoDichT__SoTie__6383C8BA]
GO