import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { BaseService } from 'src/base/base.service';
import { LeadEntity } from 'src/entities/lead.entity';
import { CreateLeadDto, UpdateLeadDto } from 'src/dto/lead.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LeadService extends BaseService {
  private leadRepository: Repository<LeadEntity>;

  constructor(private dataSource: DataSource) {
    super();
    this.leadRepository = this.dataSource.getRepository(LeadEntity);
  }

  async findAll() {
    return this.leadRepository.find({ order: { updatedAt: 'DESC' } });
  }

  async findOne(id: string) {
    const lead = await this.leadRepository.findOne({ where: { id } });
    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
    return lead;
  }

  async create(createLeadDto: CreateLeadDto) {
    const address = this.leadRepository.create(createLeadDto);
    try {
      const leadInfo = await this.leadRepository.save(address);
      this.moveLeadImage(leadInfo);
      return leadInfo;
    } catch (error) {
      console.log(error.message, error);
      throw new InternalServerErrorException('Failed to create lead');
    }
  }

  moveLeadImage(leadInfo: { fileName: string; id: string }) {
    const leadsFolder = path.join(
      __dirname,
      `../../../assets/leads/images`,
      leadInfo.id,
    );
    if (!fs.existsSync(leadsFolder)) {
      fs.mkdirSync(leadsFolder, { recursive: true });
    }

    const { fileName } = leadInfo;
    const tempFilePath = path.join(__dirname, `../../../temp/leads`, fileName);
    const leadsFolderPath = path.join(leadsFolder, fileName);

    if (!fs.existsSync(tempFilePath)) {
      // throw new NotFoundException(`File ${fileName} not found in temp folder`);
      console.log(`File ${fileName} not found in temp folder`);
      return;
    }

    try {
      fs.renameSync(tempFilePath, leadsFolderPath);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to move file to leads folder',
      );
    }
  }

  removeLeadImage(leadInfo: { fileName: string; id: string }) {
    const leadsFolder = path.join(
      __dirname,
      `../../../assets/leads/images`,
      leadInfo.id,
    );
    const leadsFolderPath = path.join(leadsFolder, leadInfo.fileName);

    if (fs.existsSync(leadsFolderPath)) {
      try {
        fs.unlinkSync(leadsFolderPath);
      } catch (error) {
        throw new InternalServerErrorException(
          'Failed to remove file from leads folder',
        );
      }
    }
  }

  async update(id: string, updateLeadDto: UpdateLeadDto) {
    const leadInfo = await this.findOne(id);
    const updatedLead = this.leadRepository.merge(leadInfo, updateLeadDto);
    this.moveLeadImage(updatedLead);
    return this.leadRepository.save(updatedLead);
  }

  async remove(id: string) {
    const lead = await this.findOne(id);
    this.removeLeadImage(lead);
    await this.leadRepository.remove(lead);
  }
}
