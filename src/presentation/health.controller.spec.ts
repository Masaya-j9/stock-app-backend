import { Test, TestingModule } from '@nestjs/testing';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  HealthCheckResult,
  TerminusModule,
} from '@nestjs/terminus';
import { HealthController } from './controllers/health.controller';

describe('HealthController', () => {
  let healthController: HealthController;
  let healthCheckService: HealthCheckService;
  let typeOrmHealthIndicator: TypeOrmHealthIndicator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [HealthController],
    })
      .overrideProvider(HealthCheckService)
      .useValue({
        check: jest.fn(),
      })
      .overrideProvider(TypeOrmHealthIndicator)
      .useValue({
        pingCheck: jest.fn(),
      })
      .compile();

    healthController = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    typeOrmHealthIndicator = module.get<TypeOrmHealthIndicator>(
      TypeOrmHealthIndicator
    );
  });

  describe('check', () => {
    it('should return health check result', (done) => {
      const mockHealthCheck: HealthCheckResult = {
        status: 'ok',
        info: { database: { status: 'up' } },
        error: {},
        details: { database: { status: 'up' } },
      };
      jest
        .spyOn(healthCheckService, 'check')
        .mockResolvedValue(mockHealthCheck);
      jest
        .spyOn(typeOrmHealthIndicator, 'pingCheck')
        .mockResolvedValue({ database: { status: 'up' } });

      healthController.check().subscribe({
        next: (result) => {
          expect(result).toEqual(mockHealthCheck);
          expect(healthCheckService.check).toHaveBeenCalledWith([
            expect.any(Function),
          ]);
          done();
        },
        error: (error) => done(error),
      });
    });
  });
});
