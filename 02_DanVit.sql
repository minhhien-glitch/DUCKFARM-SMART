USE [DUCKFARM_SMART]
GO

/****** Object:  Table [dbo].[DanVit]    Script Date: 22-Nov-26 9:10:47 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[DanVit](
	[MaDan] [int] IDENTITY(1,1) NOT NULL,
	[TenDan] [nvarchar](150) NULL,
	[GiongVit] [nvarchar](100) NULL,
	[SoLuong] [int] NULL,
	[NgayNhap] [date] NULL,
	[Tuoi] [int] NULL,
	[TrangThai] [nvarchar](50) NULL,
	[GhiChu] [nvarchar](500) NULL,
	[MaChuong] [int] NULL,
	[NgayTao] [datetime2](7) NULL,
 CONSTRAINT [PK__DanVit__3D88833ECD7ACDB2] PRIMARY KEY CLUSTERED
(
	[MaDan] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[DanVit] ADD  CONSTRAINT [DF__DanVit__NgayTao__52593CB8]  DEFAULT (sysdatetime()) FOR [NgayTao]
GO

ALTER TABLE [dbo].[DanVit]  WITH CHECK ADD  CONSTRAINT [FK_DanVit_ChuongTrai] FOREIGN KEY([MaChuong])
REFERENCES [dbo].[ChuongTrai] ([MaChuong])
ON DELETE SET NULL
GO

ALTER TABLE [dbo].[DanVit] CHECK CONSTRAINT [FK_DanVit_ChuongTrai]
GO

ALTER TABLE [dbo].[DanVit]  WITH CHECK ADD  CONSTRAINT [CK__DanVit__SoLuong__5070F446] CHECK  (([SoLuong]>=(0)))
GO

ALTER TABLE [dbo].[DanVit] CHECK CONSTRAINT [CK__DanVit__SoLuong__5070F446]
GO

ALTER TABLE [dbo].[DanVit]  WITH CHECK ADD  CONSTRAINT [CK__DanVit__Tuoi__5165187F] CHECK  (([Tuoi]>=(0)))
GO

ALTER TABLE [dbo].[DanVit] CHECK CONSTRAINT [CK__DanVit__Tuoi__5165187F]
GO
