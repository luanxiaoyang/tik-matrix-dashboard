import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TiktokAccountService } from './tiktok-account.service';
import { TiktokAccountController } from './tiktok-account.controller';
import { TiktokAccount } from './entities/tiktok-account.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TiktokAccount, User])],
  controllers: [TiktokAccountController],
  providers: [TiktokAccountService],
  exports: [TiktokAccountService],
})
export class TiktokAccountModule {}
