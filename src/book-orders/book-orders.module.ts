import { Module } from '@nestjs/common';
import { BookOrdersController } from './book-orders.controller';
import { BookOrdersService } from './book-orders.service';

@Module({
  controllers: [BookOrdersController],
  providers: [BookOrdersService]
})
export class BookOrdersModule {}
