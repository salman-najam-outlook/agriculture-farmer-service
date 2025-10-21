import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateEnquiryInput } from './dto/create-enquiry.input';
import { UpdateEnquiryInput } from './dto/update-enquiry.input';
import { Sequelize } from 'sequelize-typescript';
import { Enquiry } from './entities/enquiry.entity';
import { MailService } from 'src/mail/mail.service';
import { emailParams } from 'src/mail/mail.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class EnquiryService {
  constructor(
    private mailService: MailService,
    private userService: UsersService,
    @InjectModel(Enquiry)
    private EnquiryModel: typeof Enquiry,

    @Inject('SEQUELIZE')
    private readonly sequelize: Sequelize,
  ) {}

  async create(createEnquiryInput: CreateEnquiryInput, userId: number) {
    let transaction = await this.sequelize.transaction();
    try {
      const enquiry = await this.EnquiryModel.create(
        { ...createEnquiryInput, status: 'open', userId },
        {
          transaction,
        },
      );
      await transaction.commit();

      const user = await this.userService.findOne(userId);
      const fullName = user?.firstName + user?.lastName;
      const userEmail = user?.email;
      const params: emailParams = {
        toEmail: 'rajiv@dimitra.io',
        subject: 'Development Enquiry Mail Test', //TODO change for production
        contentParams: {
          fullName: fullName,
          email: userEmail,
          subject: enquiry.subject,
          areaOfEnquiry: enquiry.areaOfEnquiry,
          type: enquiry.type,
          status: enquiry.status,
          date: enquiry.createdAt,
          description: enquiry.description,
          attachmentLink: enquiry.imageLink,
        },
      };
      this.mailService.sendEmail('Enquiry', params);

      return enquiry;
    } catch (err) {
      transaction.rollback();
      console.log(err);
      throw err;
    }
  }

  async findAll(userId: number, status: string, page = 1, limit = 10) {
    const query = { offset: 1, limit: 10 };
    let where: any = {
      userId: userId,
      isDeleted: 0,
    };

    if (page && limit) {
      limit = limit;
      query.offset = (page - 1) * limit;
      query.limit = limit;
    }

    if (status) {
      where = {
        ...where,
        status: status,
      };
    }

    let res: { totalCount?: any; count: any; rows: any };

    res = await this.EnquiryModel.findAndCountAll({
      where: where,
      order: [['id', 'DESC']],
      ...query,
    });

    res.totalCount = res.count;
    res.count = res.rows.length;

    return res;
  }

  async update(id: number, updateEnquiryInput: UpdateEnquiryInput) {
    try {
      await this.EnquiryModel.update(
        { ...updateEnquiryInput },
        { where: { id } },
      );

      return await this.EnquiryModel.findOne({ where: { id } });
    } catch (error) {
      console.log('Enquiey service update =>', error);

      throw error;
    }
  }

  async remove(id: number) {
    await this.EnquiryModel.update(
      { isDeleted: 1 },
      {
        where: {
          id: id,
        },
      },
    );
    return true;
  }
}
