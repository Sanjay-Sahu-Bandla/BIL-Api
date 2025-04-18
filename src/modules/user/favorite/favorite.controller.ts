import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { BaseController } from 'src/base/base.controller';
import { JwtUserGuard } from 'src/guards/auth/user.guard';
import { CreateFavoriteDto } from 'src/dto/favorite.dto';

@UseGuards(JwtUserGuard)
@Controller('favorite')
export class FavoriteController extends BaseController {
  constructor(private readonly favoriteService: FavoriteService) {
    super();
  }

  @Get()
  async getAllFavorites(@Req() req) {
    const userId = req.user.id;
    const favorites = await this.favoriteService.findAll(userId);
    return this.sendResponse(favorites, 'Favorites retrieved successfully');
  }

  @Post()
  async createFavorite(
    @Body() createFavoriteDto: CreateFavoriteDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    const newFavorite = await this.favoriteService.create(
      createFavoriteDto,
      userId,
    );
    return this.sendResponse(newFavorite, 'Favorite created successfully');
  }

  @Delete(':id')
  async deleteFavorite(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    await this.favoriteService.remove(id, userId);
    return this.sendResponse(null, 'Favorite deleted successfully');
  }
}
