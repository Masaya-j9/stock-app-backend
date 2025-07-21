import { Module } from '@nestjs/common';
import { RabbitMQModule as NestRabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    NestRabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('RABBITMQ_URI'),
        exchanges: [
          {
            name: 'stock.exchange',
            type: 'topic',
          },
        ],
        queues: [
          {
            name: 'stock.update.queue',
            exchange: 'stock.exchange',
            routingKey: 'item.created',
          },
        ],
        connectionInitOptions: { wait: false },
        enableControllerDiscovery: true,
        channels: {
          default: {
            prefetchCount: 1,
            default: true,
          },
        },
      }),
    }),
  ],
  exports: [NestRabbitMQModule],
})
export class RabbitMQModule {}
