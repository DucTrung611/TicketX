import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ComboRepository } from './combo.repository';
import { Combo } from './entities/combo.entity';
import { CreateComboDto } from './dto/create-combo.dto';
import { UpdateComboDto } from './dto/update-combo.dto';
import { ComboResponseDto } from './dto/combo-response.dto';

@Injectable()
export class ComboService {
  constructor(private readonly comboRepository: ComboRepository) {}

  async listActive(): Promise<ComboResponseDto[]> {
    const combos = await this.comboRepository.findActive();
    return combos.map((combo) => this.toResponseDto(combo));
  }

  async getByIdOrThrow(id: string): Promise<Combo> {
    const combo = await this.comboRepository.findById(id);
    if (!combo) {
      throw new NotFoundException({
        code: 'COMBO_001',
        message: 'Combo not found',
      });
    }
    return combo;
  }

  /**
   * Used by `features/booking` to validate a combo item before adding it to a
   * booking's subtotal. Never returns an inactive combo — booking must not be
   * able to purchase a combo that's been taken off the menu.
   */
  async getActiveByIdOrThrow(id: string): Promise<ComboResponseDto> {
    const combo = await this.comboRepository.findById(id);
    if (!combo || !combo.isActive) {
      throw new NotFoundException({
        code: 'COMBO_001',
        message: `Combo ${id} not found or unavailable`,
      });
    }
    return this.toResponseDto(combo);
  }

  async create(dto: CreateComboDto): Promise<Combo> {
    return this.comboRepository.create({
      name: dto.name,
      description: dto.description ?? null,
      price: dto.price.toFixed(2),
      imageUrl: dto.imageUrl ?? null,
      isActive: dto.isActive ?? true,
    });
  }

  async update(id: string, dto: UpdateComboDto): Promise<Combo> {
    const combo = await this.getByIdOrThrow(id);

    if (
      dto.name === undefined &&
      dto.description === undefined &&
      dto.price === undefined &&
      dto.imageUrl === undefined &&
      dto.isActive === undefined
    ) {
      throw new ConflictException({
        code: 'VALIDATION_001',
        message: 'At least one field must be provided',
      });
    }

    Object.assign(combo, {
      name: dto.name ?? combo.name,
      description: dto.description ?? combo.description,
      price: dto.price !== undefined ? dto.price.toFixed(2) : combo.price,
      imageUrl: dto.imageUrl ?? combo.imageUrl,
      isActive: dto.isActive ?? combo.isActive,
    });

    return this.comboRepository.save(combo);
  }

  toResponseDto(combo: Combo): ComboResponseDto {
    return {
      id: combo.id,
      name: combo.name,
      description: combo.description,
      price: Number(combo.price),
      imageUrl: combo.imageUrl,
      isActive: combo.isActive,
    };
  }
}
