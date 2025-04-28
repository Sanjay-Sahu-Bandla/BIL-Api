import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LeadService } from './lead.service';
import { BaseController } from 'src/base/base.controller';
import { CreateLeadDto, UpdateLeadDto } from 'src/dto/lead.dto';
import { JwtAdminGuard } from 'src/guards/auth/admin.guard';
import { JwtInfoGuard } from 'src/guards/auth/info.guard';

@Controller('lead')
export class LeadController extends BaseController {
  constructor(private readonly leadService: LeadService) {
    super();
  }

  @UseGuards(JwtInfoGuard)
  @Get()
  async getAllLeads(@Req() req: any) {
    const leads = await this.leadService.findAll(req);
    return this.sendResponse(leads, 'Leads retrieved successfully');
  }

  @UseGuards(JwtAdminGuard)
  @Get('order-stats')
  async getOrderStats() {
    const stats = await this.leadService.getOrderStats();
    return this.sendResponse(stats, 'Stats retrieved successfully');
  }

  @UseGuards(JwtAdminGuard)
  @Get('customer-orders')
  async getCustomerOrders() {
    const customerOrders = await this.leadService.getCustomerOrders();
    return this.sendResponse(customerOrders, 'Orders retrieved successfully');
  }

  @UseGuards(JwtInfoGuard)
  @Get(':id')
  async getLeadById(@Param('id') id: string, @Req() req: any) {
    const userId = req?.user?.id;
    const lead = await this.leadService.findOne(id, userId);
    return this.sendResponse(lead, 'Lead retrieved successfully');
  }

  @Post()
  async createLead(@Body() createLeadDto: CreateLeadDto) {
    const newLead = await this.leadService.create(createLeadDto);
    return this.sendResponse(newLead, 'Lead created successfully');
  }

  @Put(':id')
  async updateLead(
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
  ) {
    const updatedLead = await this.leadService.update(id, updateLeadDto);
    return this.sendResponse(updatedLead, 'Lead updated successfully');
  }

  @Delete(':id')
  async deleteLead(@Param('id') id: string) {
    await this.leadService.remove(id);
    return this.sendResponse(null, 'Lead deleted successfully');
  }
}
