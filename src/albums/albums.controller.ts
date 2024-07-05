import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import AuthGuard from '../auth/auth.guard';
import { AlbumsService } from './albums.service';

@Controller('albums')
@ApiTags('albums') // Swagger 태그
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get Albums' })
  @ApiResponse({
    status: 200,
    description: 'Albums retrieved successfully.',
  })
  async getAlbums(@Req() req) {
    const token = req.headers.authorization.split(' ')[1];
    return this.albumsService.getAlbums(token);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a new album' })
  @ApiResponse({
    status: 201,
    description: 'Album created successfully.',
  })
  async createAlbum(
    @Body('year') year: number,
    @Body('month') month: number,
    @Req() req,
  ) {
    const token = req.headers.authorization.split(' ')[1];
    return this.albumsService.createAlbum(year, month, token);
  }

  @Post('photos')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Add Photos to album by month' })
  @ApiResponse({
    status: 201,
    description: 'Photos added successfully.',
  })
  async addPhotosToAlbumByMonth(
    @Body('year') year: number,
    @Body('month') month: number,
    @Req() req,
  ) {
    const token = req.headers.authorization.split(' ')[1];
    return this.albumsService.addPhotosToAlbumByMonth(year, month, token);
  }
}
