import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { BookOrder, BookOrdersService } from './book-orders.service';

@Controller('book-orders')
export class BookOrdersController {
  constructor(private bookOrderService: BookOrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/new-request')
  async function(@Body() newBookRequest: BookOrder) {
    // console.log(newBookRequest);
    return this.bookOrderService.planToTakeBook(newBookRequest);
  }
}
