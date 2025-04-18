import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { BaseService } from 'src/base/base.service';
import { FavoriteEntity } from 'src/entities/favorite.entity';
import { CreateFavoriteDto } from 'src/dto/favorite.dto';

@Injectable()
export class FavoriteService extends BaseService {
  private favoriteRepository: Repository<FavoriteEntity>;

  constructor(private dataSource: DataSource) {
    super();
    this.favoriteRepository = this.dataSource.getRepository(FavoriteEntity);
  }

  async findAll(userId: string) {
    return await this.favoriteRepository.find({
      where: {
        user: { id: userId },
      },
      relations: ['lead'],
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const address = await this.favoriteRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user'],
    });
    if (!address) {
      throw new NotFoundException(`Favorite not found`);
    }
    return address;
  }

  async create(createFavoriteDto: CreateFavoriteDto, userId: string) {
    const existingFavorite = await this.favoriteRepository.findOne({
      where: {
        user: { id: userId },
        lead: { id: createFavoriteDto.leadId },
      },
    });

    if (existingFavorite) {
      throw new InternalServerErrorException(
        'Item already exists in the favorites',
      );
    }

    const favorite = this.favoriteRepository.create({
      ...createFavoriteDto,
      user: { id: userId },
      lead: { id: createFavoriteDto.leadId },
    });

    try {
      return await this.favoriteRepository.save(favorite);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create favorite');
    }
  }

  async remove(id: string, userId: string) {
    const address = await this.findOne(id, userId);
    await this.favoriteRepository.remove(address);
  }
}
