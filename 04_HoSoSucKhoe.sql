USE [DUCKFARM_SMART]
GO

/****** Object:  Table [dbo].[HoSoSucKhoe]    Script Date: 22-Nov-26 9:25:41 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[HoSoSucKhoe](
	[MaHoSo] [int] IDENTITY(1,1) NOT NULL,
	[TieuDe] [nvarchar](200) NULL,
	[MaDan] [int] NULL,
	[TenDanLuuTru] [nvarchar](150) NULL,
	[NgayThucHien] [date] NULL,
	[NguoiThucHien] [nvarchar](100) NULL,
	[TrangThai] [nvarchar](50) NULL,
	[GhiChu] [nvarchar](500) NULL,
	[NgayTao] [datetime2](7) NULL,
 CONSTRAINT [PK__HoSoSucK__1666423C40E5AE8A] PRIMARY KEY CLUSTERED
(
	[MaHoSo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[HoSoSucKhoe] ADD  CONSTRAINT [DF__HoSoSucKh__NgayT__5EBF139D]  DEFAULT (sysdatetime()) FOR [NgayTao]
GO

ALTER TABLE [dbo].[HoSoSucKhoe]  WITH CHECK ADD  CONSTRAINT [FK_HoSoSucKhoe_DanVit] FOREIGN KEY([MaDan])
REFERENCES [dbo].[DanVit] ([MaDan])
ON DELETE SET NULL
GO

ALTER TABLE [dbo].[HoSoSucKhoe] CHECK CONSTRAINT [FK_HoSoSucKhoe_DanVit]
GO