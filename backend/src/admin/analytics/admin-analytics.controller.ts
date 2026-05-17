import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard.js';
import { AdminGuard } from '../guards/admin.guard';
import { AdminAnalyticsService } from '../services/admin-analytics.service';
import {
  GetExecutionAnalyticsDto,
  GetTrendDto,
} from '../dto/admin-analytics.dto';

@Controller('admin/analytics')
@UseGuards(AuthGuard, AdminGuard)
export class AdminAnalyticsController {
  constructor(
    private readonly adminAnalyticsService: AdminAnalyticsService,
  ) {}

  @Get('platform')
  async getPlatformStatistics() {
    return this.adminAnalyticsService.getPlatformStatistics();
  }

  @Get('executions')
  async getExecutionAnalytics(@Query() query: GetExecutionAnalyticsDto) {
    return this.adminAnalyticsService.getExecutionAnalytics(query);
  }

  @Get('users')
  async getUserAnalytics() {
    return this.adminAnalyticsService.getUserAnalytics();
  }

  @Get('trends/registrations')
  async getRegistrationTrend(@Query() query: GetTrendDto) {
    return this.adminAnalyticsService.getRegistrationTrend(query.days);
  }

  @Get('trends/executions')
  async getExecutionTrend(@Query() query: GetTrendDto) {
    return this.adminAnalyticsService.getExecutionTrend(query.days);
  }

  @Get('node-types/usage')
  async getNodeTypeUsage() {
    return this.adminAnalyticsService.getNodeTypeUsage();
  }
}