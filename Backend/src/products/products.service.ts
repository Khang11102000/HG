import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { NullableType } from '../utils/types/nullable.type';
import { FilterProductDto, SortProductDto } from './dto/query-product.dto';
import { ProductRepository } from './infrastructure/persistence/product.repository';
import { Product } from './domain/product';
import bcrypt from 'bcryptjs';
import { AuthProvidersEnum } from '../auth/auth-providers.enum';
import { FilesService } from '../files/files.service';
import { RoleEnum } from '../roles/roles.enum';
import { StatusEnum } from '../statuses/statuses.enum';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { FileType } from '../files/domain/file';
import { Role } from '../roles/domain/role';
import { Status } from '../statuses/domain/status';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductRepository,
    private readonly filesService: FilesService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Do not remove comment below.
    // <creating-property />

    let password: string | undefined = undefined;

    if (createProductDto.password) {
      const salt = await bcrypt.genSalt();
      password = await bcrypt.hash(createProductDto.password, salt);
    }

    let email: string | null = null;

    if (createProductDto.email) {
      const productObject = await this.productsRepository.findByEmail(
        createProductDto.email,
      );
      if (productObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'emailAlreadyExists',
          },
        });
      }
      email = createProductDto.email;
    }

    let photo: FileType | null | undefined = undefined;

    if (createProductDto.photo?.id) {
      const fileObject = await this.filesService.findById(
        createProductDto.photo.id,
      );
      if (!fileObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            photo: 'imageNotExists',
          },
        });
      }
      photo = fileObject;
    } else if (createProductDto.photo === null) {
      photo = null;
    }

    let role: Role | undefined = undefined;

    if (createProductDto.role?.id) {
      const roleObject = Object.values(RoleEnum)
        .map(String)
        .includes(String(createProductDto.role.id));
      if (!roleObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            role: 'roleNotExists',
          },
        });
      }

      role = {
        id: createProductDto.role.id,
      };
    }

    let status: Status | undefined = undefined;

    if (createProductDto.status?.id) {
      const statusObject = Object.values(StatusEnum)
        .map(String)
        .includes(String(createProductDto.status.id));
      if (!statusObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            status: 'statusNotExists',
          },
        });
      }

      status = {
        id: createProductDto.status.id,
      };
    }

    return this.productsRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
      firstName: createProductDto.firstName,
      lastName: createProductDto.lastName,
      email: email,
      password: password,
      photo: photo,
      role: role,
      status: status,
      provider: createProductDto.provider ?? AuthProvidersEnum.email,
      socialId: createProductDto.socialId,
    });
  }

  findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterProductDto | null;
    sortOptions?: SortProductDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Product[]> {
    return this.productsRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  findById(id: Product['id']): Promise<NullableType<Product>> {
    return this.productsRepository.findById(id);
  }

  findByIds(ids: Product['id'][]): Promise<Product[]> {
    return this.productsRepository.findByIds(ids);
  }

  findByEmail(email: Product['email']): Promise<NullableType<Product>> {
    return this.productsRepository.findByEmail(email);
  }

  findBySocialIdAndProvider({
    socialId,
    provider,
  }: {
    socialId: Product['socialId'];
    provider: Product['provider'];
  }): Promise<NullableType<Product>> {
    return this.productsRepository.findBySocialIdAndProvider({
      socialId,
      provider,
    });
  }

  async update(
    id: Product['id'],
    updateProductDto: UpdateProductDto,
  ): Promise<Product | null> {
    // Do not remove comment below.
    // <updating-property />

    let password: string | undefined = undefined;

    if (updateProductDto.password) {
      const productObject = await this.productsRepository.findById(id);

      if (productObject && productObject?.password !== updateProductDto.password) {
        const salt = await bcrypt.genSalt();
        password = await bcrypt.hash(updateProductDto.password, salt);
      }
    }

    let email: string | null | undefined = undefined;

    if (updateProductDto.email) {
      const productObject = await this.productsRepository.findByEmail(
        updateProductDto.email,
      );

      if (productObject && productObject.id !== id) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'emailAlreadyExists',
          },
        });
      }

      email = updateProductDto.email;
    } else if (updateProductDto.email === null) {
      email = null;
    }

    let photo: FileType | null | undefined = undefined;

    if (updateProductDto.photo?.id) {
      const fileObject = await this.filesService.findById(
        updateProductDto.photo.id,
      );
      if (!fileObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            photo: 'imageNotExists',
          },
        });
      }
      photo = fileObject;
    } else if (updateProductDto.photo === null) {
      photo = null;
    }

    let role: Role | undefined = undefined;

    if (updateProductDto.role?.id) {
      const roleObject = Object.values(RoleEnum)
        .map(String)
        .includes(String(updateProductDto.role.id));
      if (!roleObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            role: 'roleNotExists',
          },
        });
      }

      role = {
        id: updateProductDto.role.id,
      };
    }

    let status: Status | undefined = undefined;

    if (updateProductDto.status?.id) {
      const statusObject = Object.values(StatusEnum)
        .map(String)
        .includes(String(updateProductDto.status.id));
      if (!statusObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            status: 'statusNotExists',
          },
        });
      }

      status = {
        id: updateProductDto.status.id,
      };
    }

    return this.productsRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
      firstName: updateProductDto.firstName,
      lastName: updateProductDto.lastName,
      email,
      password,
      photo,
      role,
      status,
      provider: updateProductDto.provider,
      socialId: updateProductDto.socialId,
    });
  }

  async remove(id: Product['id']): Promise<void> {
    await this.productsRepository.remove(id);
  }
}
