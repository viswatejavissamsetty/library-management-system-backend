import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
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
  @Get('/getAllUserPlannedBooks')
  async getAllUserPlannedBooks(@Query('userId') userId: string) {
    return this.bookOrderService.getAllUserPlannedBooks(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getAllPlannedBooks')
  async getAllPlannedBooks(@Query('userId') userId: string) {
    return this.bookOrderService.getAllPlannedBooks(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('getAllUserTakenBooks')
  async getAllUserTakenBooks(@Query('userId') userId: string) {
    return this.bookOrderService.getAllUserTakenBooks(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('getAllTakenBooks')
  async getAllTakenBooks(@Query('userId') userId: string) {
    return this.bookOrderService.getAllTakenBooks(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('takeBook')
  async takeBooks(
    @Body() payload: { librarianId: string; trackingId: string },
  ) {
    return this.bookOrderService.takeABook(
      payload.librarianId,
      payload.trackingId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('returnBook')
  async returnBook(@Body() tackingData: { id: string; librarianId: string }) {
    return this.bookOrderService.returnBook(
      tackingData.id,
      tackingData.librarianId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('cancelBook')
  async cancelBook(@Body() tackingData: { id: string }) {
    return this.bookOrderService.cancelBook(tackingData.id);
  }
}
