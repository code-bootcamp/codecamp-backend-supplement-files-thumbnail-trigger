import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductSaleslocation } from './entities/productSaleslocation.entity';
import { IProductsSaleslocationsServiceCreate } from './interfaces/products-saleslocations.interface';

@Injectable()
export class ProductsSaleslocationsService {
  constructor(
    @InjectRepository(ProductSaleslocation)
    private readonly productsSaleslocationsRepository: Repository<ProductSaleslocation>,
  ) {}

  create({ productSaleslocation }: IProductsSaleslocationsServiceCreate) {
    return this.productsSaleslocationsRepository.save({
      ...productSaleslocation,
    });
  }
}
