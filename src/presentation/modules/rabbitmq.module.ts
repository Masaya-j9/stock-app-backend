import { Module } from '@nestjs/common';
import { RabbitMQModule as NestRabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    NestRabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('RABBITMQ_URI'),
        exchanges: [
          {
            name: 'item.created',
            type: 'topic',
          },
          {
            name: 'item.updated',
            type: 'topic',
          },
          {
            name: 'item.quantity.updated',
            type: 'topic',
          },
          {
            name: 'item.deleted',
            type: 'topic',
          },
          {
            name: 'item.restored',
            type: 'topic',
          },
          {
            name: 'stock.exchange',
            type: 'topic',
          },
        ],
        connectionInitOptions: {
          wait: true,
          reject: true,
          timeout: 3000,
        },
      }),
    }),
  ],
  exports: [NestRabbitMQModule],
})
export class RabbitMQModule {}
