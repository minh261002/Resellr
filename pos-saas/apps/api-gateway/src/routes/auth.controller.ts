import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { NatsClientService } from '../common/nats-client.service';
import { LoginDto, RegisterDto } from '@app/dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly natsClient: NatsClientService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.natsClient.send('auth.register', registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.natsClient.send('auth.login', loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refreshToken(@Request() req: any) {
    return this.natsClient.send('auth.refresh', { userId: req.user.id });
  }
}
