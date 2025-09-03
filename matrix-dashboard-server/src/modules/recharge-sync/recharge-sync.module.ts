import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RechargeSyncController } from './recharge-sync.controller';
import { RechargeSyncService } from './services/recharge-sync.service';
import { ExternalApiService } from './services/external-api.service';
import { YayAuthService } from './services/yay-auth.service';
import { TestApiService } from './services/test-api.service';
import { DirectApiService } from './services/direct-api.service';
import { DirectSyncService } from './services/direct-sync.service';
import { UserRechargeFeature } from './entities/user-recharge-feature.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRechargeFeature])],
  controllers: [RechargeSyncController],
  providers: [RechargeSyncService, ExternalApiService, YayAuthService, TestApiService, DirectApiService, DirectSyncService],
  exports: [RechargeSyncService, ExternalApiService, YayAuthService, TestApiService, DirectApiService, DirectSyncService],
})
export class RechargeSyncModule {}
