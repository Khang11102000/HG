import { Injectable } from '@nestjs/common';

import { NullableType } from '../../../../../utils/types/nullable.type';
import { FilterProductDto, SortProductDto } from '../../../../dto/query-product.dto';
import { Product } from '../../../../domain/product';
import { ProductRepository } from '../../product.repository';
import { ProductSchemaClass } from '../entities/product.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { ProductMapper } from '../mappers/product.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class ProductsDocumentRepository implements ProductRepository {
  constructor(
    @InjectModel(ProductSchemaClass.name)
    private readonly productsModel: Model<ProductSchemaClass>,
  ) {}

  async create(data: Product): Promise<Product> {
    const persistenceModel = ProductMapper.toPersistence(data);
    const createdProduct = new this.productsModel(persistenceModel);
    const productObject = await createdProduct.save();
    return ProductMapper.toDomain(productObject);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterProductDto | null;
    sortOptions?: SortProductDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Product[]> {
    const where: FilterQuery<ProductSchemaClass> = {};
    if (filterOptions?.roles?.length) {
      where['role._id'] = {
        $in: filterOptions.roles.map((role) => role.id.toString()),
      };
    }

    const productObjects = await this.productsModel
      .find(where)
      .sort(
        sortOptions?.reduce(
          (accumulator, sort) => ({
            ...accumulator,
            [sort.orderBy === 'id' ? '_id' : sort.orderBy]:
              sort.order.toUpperCase() === 'ASC' ? 1 : -1,
          }),
          {},
        ),
      )
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .limit(paginationOptions.limit);

    return productObjects.map((productObject) => ProductMapper.toDomain(productObject));
  }

  async findById(id: Product['id']): Promise<NullableType<Product>> {
    const productObject = await this.productsModel.findById(id);
    return productObject ? ProductMapper.toDomain(productObject) : null;
  }

  async findByIds(ids: Product['id'][]): Promise<Product[]> {
    const productObjects = await this.productsModel.find({ _id: { $in: ids } });
    return productObjects.map((productObject) => ProductMapper.toDomain(productObject));
  }

  async findByEmail(email: Product['email']): Promise<NullableType<Product>> {
    if (!email) return null;

    const productObject = await this.productsModel.findOne({ email });
    return productObject ? ProductMapper.toDomain(productObject) : null;
  }

  async findBySocialIdAndProvider({
    socialId,
    provider,
  }: {
    socialId: Product['socialId'];
    provider: Product['provider'];
  }): Promise<NullableType<Product>> {
    if (!socialId || !provider) return null;

    const productObject = await this.productsModel.findOne({
      socialId,
      provider,
    });

    return productObject ? ProductMapper.toDomain(productObject) : null;
  }

  async update(id: Product['id'], payload: Partial<Product>): Promise<Product | null> {
    const clonedPayload = { ...payload };
    delete clonedPayload.id;

    const filter = { _id: id.toString() };
    const product = await this.productsModel.findOne(filter);

    if (!product) {
      return null;
    }

    const productObject = await this.productsModel.findOneAndUpdate(
      filter,
      ProductMapper.toPersistence({
        ...ProductMapper.toDomain(product),
        ...clonedPayload,
      }),
      { new: true },
    );

    return productObject ? ProductMapper.toDomain(productObject) : null;
  }

  async remove(id: Product['id']): Promise<void> {
    await this.productsModel.deleteOne({
      _id: id.toString(),
    });
  }
}
