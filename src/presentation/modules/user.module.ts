import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { SignInController } from '../controllers/user/signin.controller';
import { SignUpController } from '../controllers/user/signup.controller';
// import { SignInServiceInterface } from '../../application/services/user/signin.interface';
// import { SignUpServiceInterface } from '../../application/services/user/signup.interface';
import { SignInService } from '../../application/services/user/signin.service';
import { SignUpService } from '../../application/services/user/signup.service';

@Module({
  controllers: [SignInController, SignUpController],
  providers: [
    {
      provide: 'SignInServiceInterface',
      useClass: SignInService,
    },
    {
      provide: 'SignUpServiceInterface',
      useClass: SignUpService,
    },
  ],
  exports: [
    {
      provide: 'SignInServiceInterface',
      useClass: SignInService,
    },
    {
      provide: 'SignUpServiceInterface',
      useClass: SignUpService,
    },
  ],
})
export class UserModule {}
