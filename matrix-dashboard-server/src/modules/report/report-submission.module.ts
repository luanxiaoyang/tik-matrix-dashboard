import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportSubmissionService } from './report-submission.service';
import { ReportSubmissionController } from './report-submission.controller';
import { ReportSubmission } from './entities/report-submission.entity';
import { User } from '../user/entities/user.entity';
import { TiktokAccount } from '../tiktok-account/entities/tiktok-account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReportSubmission, User, TiktokAccount])],
  controllers: [ReportSubmissionController],
  providers: [ReportSubmissionService],
  exports: [ReportSubmissionService],
})
export class ReportSubmissionModule {}
