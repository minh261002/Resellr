import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class NatsClientService implements OnModuleInit, OnModuleDestroy {
  private client: ClientProxy;

  constructor(private configService: ConfigService) {
    this.client = ClientProxyFactory.create({
      transport: Transport.NATS,
      options: {
        servers: [this.configService.get('NATS_URL') || 'nats://localhost:4222'],
      },
    } as any);
  }

  async onModuleInit() {
    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.close();
  }

  send<T = any>(pattern: string, data: any): Promise<T> {
    return this.client.send<T>(pattern, data).toPromise() as Promise<T>;
  }

  emit(pattern: string, data: any): void {
    this.client.emit(pattern, data);
  }

  getClient(): ClientProxy {
    return this.client;
  }
}
