import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/jwt.strategy';
import { NatsClientService } from './common/nats-client.service';
import { AuthController } from './routes/auth.controller';
import { OrganizationsController } from './routes/organizations.controller';
import { ProductsController } from './routes/products.controller';
import { SalesController } from './routes/sales.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [
    AuthController,
    OrganizationsController,
    ProductsController,
    SalesController,
  ],
  providers: [JwtStrategy, NatsClientService],
})
export class AppModule {}
