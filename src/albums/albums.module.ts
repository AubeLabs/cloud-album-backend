// src/albums/albums.module.ts
import { Module } from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { AlbumsController } from './albums.controller';
import { AuthGuard } from '../auth/auth.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AlbumsController],
  providers: [AlbumsService, AuthGuard],
  exports: [AlbumsService],
})
export class AlbumsModule {}
