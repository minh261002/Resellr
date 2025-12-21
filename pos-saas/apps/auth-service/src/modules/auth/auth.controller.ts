import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, AuthResponseDto } from '@app/dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refreshToken(@Request() req: any): Promise<AuthResponseDto> {
    return this.authService.refreshToken(req.user.id);
  }

  // Microservice endpoints
  @MessagePattern('auth.validate')
  async validateUser(@Payload() data: { userId: string }) {
    return this.authService.validateUser(data.userId);
  }

  @MessagePattern('auth.login')
  async loginViaMessage(@Payload() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @MessagePattern('auth.register')
  async registerViaMessage(@Payload() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
