import {
  // common
  Module,
} from '@nestjs/common';

import { ProductsController } from './products.controller';

import { ProductsService } from './products.service';
import { DocumentProductPersistenceModule } from './infrastructure/persistence/document/document-persistence.module';
import { RelationalProductPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { DatabaseConfig } from '../database/config/database-config.type';
import databaseConfig from '../database/config/database.config';
import { FilesModule } from '../files/files.module';

// <database-block>
const infrastructurePersistenceModule = (databaseConfig() as DatabaseConfig)
  .isDocumentDatabase
  ? DocumentProductPersistenceModule
  : RelationalProductPersistenceModule;
// </database-block>

@Module({
  imports: [
    // import modules, etc.
    infrastructurePersistenceModule,
    FilesModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService, infrastructurePersistenceModule],
})
export class ProductsModule {}
