import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { RechargeSyncModule } from './modules/recharge-sync/recharge-sync.module';
import { TiktokAccountModule } from './modules/tiktok-account/tiktok-account.module';
import { ReportSubmissionModule } from './modules/report/report-submission.module';
import { HealthController } from './common/controllers/health.controller';
import { User } from './modules/user/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        synchronize: false,
        logging: configService.get('NODE_ENV') === 'development',
        timezone: '+08:00',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User]),
    AuthModule,
    UserModule,
    RbacModule,
    RechargeSyncModule,
    TiktokAccountModule,
    ReportSubmissionModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
