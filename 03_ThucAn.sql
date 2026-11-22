USE [DUCKFARM_SMART]
GO

/****** Object:  Table [dbo].[ThucAn]    Script Date: 22-Nov-26 9:31:14 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ThucAn](
	[MaThucAn] [int] IDENTITY(1,1) NOT NULL,
	[TenThucAn] [nvarchar](150) NULL,
	[NhomThucAn] [nvarchar](100) NULL,
	[SoLuongTon] [decimal](18, 2) NULL,
	[DonViTinh] [nvarchar](30) NULL,
	[DonGia] [decimal](18, 2) NULL,
	[TonKhoToiThieu] [decimal](18, 2) NULL,
	[NgayTao] [datetime2](7) NULL,
 CONSTRAINT [PK__ThucAn__CD96151EE2DA06E2] PRIMARY KEY CLUSTERED
(
	[MaThucAn] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[ThucAn] ADD  CONSTRAINT [DF__ThucAn__SoLuongT__5629CD9C]  DEFAULT ((0)) FOR [SoLuongTon]
GO

ALTER TABLE [dbo].[ThucAn] ADD  CONSTRAINT [DF__ThucAn__DonGia__5812160E]  DEFAULT ((0)) FOR [DonGia]
GO

ALTER TABLE [dbo].[ThucAn] ADD  CONSTRAINT [DF__ThucAn__TonKhoTo__59FA5E80]  DEFAULT ((0)) FOR [TonKhoToiThieu]
GO

ALTER TABLE [dbo].[ThucAn] ADD  CONSTRAINT [DF__ThucAn__NgayTao__5BE2A6F2]  DEFAULT (sysdatetime()) FOR [NgayTao]
GO

ALTER TABLE [dbo].[ThucAn]  WITH CHECK ADD  CONSTRAINT [CK__ThucAn__DonGia__59063A47] CHECK  (([DonGia]>=(0)))
GO

ALTER TABLE [dbo].[ThucAn] CHECK CONSTRAINT [CK__ThucAn__DonGia__59063A47]
GO

ALTER TABLE [dbo].[ThucAn]  WITH CHECK ADD  CONSTRAINT [CK__ThucAn__SoLuongT__571DF1D5] CHECK  (([SoLuongTon]>=(0)))
GO

ALTER TABLE [dbo].[ThucAn] CHECK CONSTRAINT [CK__ThucAn__SoLuongT__571DF1D5]
GO

ALTER TABLE [dbo].[ThucAn]  WITH CHECK ADD  CONSTRAINT [CK__ThucAn__TonKhoTo__5AEE82B9] CHECK  (([TonKhoToiThieu]>=(0)))
GO

ALTER TABLE [dbo].[ThucAn] CHECK CONSTRAINT [CK__ThucAn__TonKhoTo__5AEE82B9]
GO
