import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { BookOrder, BookOrdersService } from './book-orders.service';

@Controller('book-orders')
export class BookOrdersController {
  constructor(private bookOrderService: BookOrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/new-request')
  async takeNewBook(@Body() newBookRequest: BookOrder) {
    return this.bookOrderService.planToTakeBook(newBookRequest);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/get-all-user-planned-books')
  async getAllUserPlannedBooks(@Query('userId') userId: string) {
    return this.bookOrderService.getAllUserPlannedBooks(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/get-all-planned-books')
  async getAllPlannedBooks(@Query('userId') userId: string) {
    return this.bookOrderService.getAllPlannedBooks(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-all-user-taken-books')
  async getAllUserTakenBooks(@Query('userId') userId: string) {
    return this.bookOrderService.getAllUserTakenBooks(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-all-taken-books')
  async getAllTakenBooks(@Query('userId') userId: string) {
    return this.bookOrderService.getAllTakenBooks(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('take-book')
  async takeBooks(
    @Body() payload: { librarianId: string; trackingId: string },
  ) {
    return this.bookOrderService.takeABook(
      payload.librarianId,
      payload.trackingId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('return-book')
  async returnBook(
    @Body() tackingData: { trackingId: string; librarianId: string },
  ) {
    return this.bookOrderService.returnBook(
      tackingData.trackingId,
      tackingData.librarianId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('cancel-book')
  async cancelBook(@Query('id') id: string) {
    return this.bookOrderService.cancelBook(id);
  }
}
