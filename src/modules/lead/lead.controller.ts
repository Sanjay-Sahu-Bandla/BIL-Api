import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { LeadService } from './lead.service';
import { BaseController } from 'src/base/base.controller';
import { CreateLeadDto, UpdateLeadDto } from 'src/dto/lead.dto';

@Controller('lead')
export class LeadController extends BaseController {
  constructor(private readonly leadService: LeadService) {
    super();
  }

  @Get()
  async getAllLeads() {
    const leads = await this.leadService.findAll();
    return this.sendResponse(leads, 'Leads retrieved successfully');
  }

  @Get(':id')
  async getLeadById(@Param('id') id: string) {
    const lead = await this.leadService.findOne(id);
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
