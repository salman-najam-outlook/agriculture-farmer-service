import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { CreateMembershipInput } from './dto/create-membership.input';
import { UpdateMembershipInput } from './dto/update-membership.input';
import { Addons } from './entities/add-ons.entity';
import { MembershipFees } from './entities/membership-fees.entity';
import { Membership } from './entities/membership.entity';
import { UserAddons } from './entities/user-add-ons-map.entity';
import { UserMembership } from './entities/userMembership.entity';
import { InjectPaypal, InjectPaypalClient } from 'nestjs-paypal-payouts';
import { GetQueryDataArgs } from './dto/get-query-data.args';
import { PaymentMethods } from './entities/payment-methods.entity';
import { CreateUserMembershipInput } from './dto/create-user-membership.input';
import { CreatePaymentInput } from './dto/create-payment.input';
import { Payments } from './entities/payment.entity';
import { CreateUserAddonsInput } from './dto/create-user-addons.input';
import * as moment from 'moment';

const paypal = require('paypal-rest-sdk');

paypal.configure({
  mode: 'sandbox',
  client_id: 'AQg0_sStegJDdn4y7X3F3SO8QpQBtegCld3pp42TbEIFnRLfmdM_DtCONxLQuXvviulx0k8kLdRf4m75',
  client_secret: 'ENn68HNK7yuL2UyCNp5iXgOFd7piKk9SOU6Q9UGuIFFMfHnQ8Nmgk2TMb6ca_MPkiKkDujMUQepSnSIj'
})

@Injectable()
export class MembershipService {
  constructor(
    @InjectModel(Membership) private membershipRepository: typeof Membership,
    @InjectModel(Addons) private addonsRepository: typeof Addons,
    @InjectModel(MembershipFees) private membershipFeesRepository: typeof MembershipFees,
    @InjectModel(UserAddons) private userAddonsRepository: typeof UserAddons,
    @InjectModel(UserMembership) private userMembershipRepository: typeof UserMembership,
    @InjectModel(PaymentMethods) private paymentMethodsRepository: typeof PaymentMethods,
    @InjectModel(Payments) private paymentsRepository: typeof Payments,
    @Inject('SEQUELIZE')
    private readonly sequelize: Sequelize,
    // @InjectPaypalClient()
    // private readonly paypalClient,
    // @InjectPaypal()
    // private readonly paypal,
  ) {}

  create(createMembershipInput: CreateMembershipInput, userId: number) {
    return 'This action adds a new membership';
  }

  async findAll() {
    const res = await this.membershipRepository.findAll({
      include: [
        MembershipFees
      ],
      where: {
        [Op.or]: [
          { organization: null }
        ]
      }
    })
    return res
  }

  async getUserMembershipPlan(userId) {
    const res = await this.userMembershipRepository.findAll({
      include: [
        {
          model: Membership,
          include: [
            MembershipFees
          ]
        }
      ],
      where: {
        user_id: userId
      }
    })
    return res
  }


  async getUserCurrentMembershipPlan(userId) {

    let TODAY_START = new Date();
      TODAY_START.setHours(0, 0, 0, 0);
    const res = await this.userMembershipRepository.findOne({
      include: [
        {
          model: Membership,
          include: [
            MembershipFees
          ]
        }
      ],
      where: {
        user_id: userId,
        end_date :{
          [Op.gt]: moment(TODAY_START).format('yyyy-MM-DD HH:mm:ss.s'),
        }
      
      }
    })
    return res
  }


  async getAllAddons(queryData: GetQueryDataArgs): Promise<Object> {
    let { page, limit, searchPhrase } = queryData;
    type Query = {
      offset?: number;
      limit?: number;
    };
    const query: Query = {};
    if (page && limit) {
      query.offset = (page - 1) * limit;
      query.limit = limit;
    }

    const res = await this.addonsRepository.findAll({
      where: {
        [Op.or]: [
          { organization: null }
        ]
      },
      ...query,
    })
    return res
  }

  async findOne(id: number) {
    const res = await this.membershipRepository.findOne({
      include: [
        MembershipFees
      ],
      where: {
        id,
        [Op.or]: [
          { organization: null }
        ]
      }
    })
    return res
  }

  update(id: number, updateMembershipInput: UpdateMembershipInput) {
    return `This action updates a #${id} membership`;
  }

  remove(id: number) {
    return `This action removes a #${id} membership`;
  }

  // async paypalPayouts() {
  //   try {
  //     const request = new this.paypal.payouts.PayoutsPostRequest();
  
  //     request.requestBody({
  //       sender_batch_header: {
  //         recipient_type: "EMAIL",
  //         email_message: "SDK payouts test txn",
  //         note: "Enjoy your Payout!!",
  //         sender_batch_id: "Test_sdk_1",
  //         email_subject: "This is a test transaction from SDK"
  //       },
  //       items: [{
  //         note: "Your 5$ Payout!",
  //         amount: {
  //           currency: "USD",
  //           value: "1.00"
  //         },
  //         receiver: "sb-akmxu21579558@personal.example.com",
  //         sender_item_id: "Test_txn_1"
  //       }]
  //     });
    
  //     let response = await this.paypalClient.execute(request);
  //     console.log(`Response: ${JSON.stringify(response)}`);
  //     // If call returns body in response, you can get the deserialized version from the result attribute of the response.
  //     console.log(`Payouts Create Response: ${JSON.stringify(response.result)}`);

  //     return {
  //       success: true,
  //       response
  //     }
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  // async buyMembership () {
  //   const create_payment_json = {
  //     "intent": "sale",
  //     "payer": {
  //       "payment_method": "paypal"
  //     },
  //     "redirect_urls": {
  //       "return_url": "http://localhost:3000/success",
  //       "cancel_url": "http://localhost:3000/cancel"
  //     },
  //     "transactions": [{
  //       "item_list": {
  //         "items": [{
  //           "name": "Redhock Bar Soap",
  //           "sku": "001",
  //           "price": "25.00",
  //           "currency": "USD",
  //           "quantity": 1
  //         }]
  //       },
  //       "amount": {
  //         "currency": "USD",
  //         "total": "25.00"
  //       },
  //       "description": "Washing Bar soap"
  //     }]
  //   }

  //   paypal.payment.create(create_payment_json, function (error, payment) {
  //     if (error) {
  //         throw error;
  //     } else {
  //         for(let i = 0;i < payment.links.length;i++){
  //           if(payment.links[i].rel === 'approval_url'){
  //             console.log('success', payment)
  //           }
  //         }
  //     }
  //   });
  // }

  async createUserMembership (createUserMembershipInput: CreateUserMembershipInput, userId: number) {
    const user_id = userId
    const {
      membershipId: membership_id,
      paymentId: payment_id,
      startDate: start_date,
      endDate: end_date
    } = createUserMembershipInput
    const transaction = await this.sequelize.transaction()
    try {
      this.userMembershipRepository.update({
        active: 0
      },
      {
        where: {
          user_id
        }
      })
      const res = await this.userMembershipRepository.create({
        user_id,
        membership_id,
        payment_id,
        start_date,
        end_date,
        active: 1
      })
      if (res.id) {
        await transaction.commit();
        return res
      }
    } catch (error) {
      console.log(error);
      await transaction.rollback();
      throw new Error('Something went wrong !!!');
    }
  }

  async createPayment (createPaymentInput: CreatePaymentInput, userId: number) {
    const user_id = userId
    const {
      paymentMethod: payment_method,
      transactionId: transaction_id,
      status,
      amount,
      currency,
      paymentNote: payment_note,
      paymentDate: payment_date,
      isRefund: is_refund,
      payerInfo: payer_info
    } = createPaymentInput
    const transaction = await this.sequelize.transaction()
    try {
      const res = await this.paymentsRepository.create({
        user_id,
        payment_method,
        transaction_id,
        status,
        amount,
        currency,
        payment_note,
        payment_date,
        is_refund,
        payer_info
      })
      if (res) {
        await transaction.commit();
        return res
      }
    } catch (error) {
      console.log(error);
      await transaction.rollback();
      throw new Error('Something went wrong !!!');
    }
  }

  async createUserAddons (createUserAddonsInput: CreateUserAddonsInput, userId: number) {
    const user_id = userId
    const {
      addonIds,
      userMembershipId: user_membership_id,
      startDate: start_date,
      endDate: end_date
    } = createUserAddonsInput
    const transaction = await this.sequelize.transaction()
    try {
      const userAddonsFinal = addonIds.map(addon => ({
        user_id,
        add_on_id: addon,
        user_membership_id,
        start_date,
        end_date
      }))
      const res = await this.userAddonsRepository.bulkCreate(userAddonsFinal)
      if (res) {
        await transaction.commit();
        return res
      }
    } catch (error) {
      console.log(error);
      await transaction.rollback();
      throw new Error('Something went wrong !!!');
    }
  }

  async getPaymentMethods () {
    const res = await this.paymentMethodsRepository.findAll()
    return res
  }
}
