import { Module } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { MembershipResolver } from './membership.resolver';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { MembershipFees } from './entities/membership-fees.entity';
import { Addons } from './entities/add-ons.entity';
import { Membership } from './entities/membership.entity';
import { UserAddons } from './entities/user-add-ons-map.entity';
import { UserMembership } from './entities/userMembership.entity';
import { NestjsPaypalPayoutsModule } from 'nestjs-paypal-payouts';
import { PaymentMethods } from './entities/payment-methods.entity';
import { Payments } from './entities/payment.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Addons,
      MembershipFees,
      Membership,
      UserAddons,
      UserMembership,
      PaymentMethods,
      Payments,
    ]),
    // NestjsPaypalPayoutsModule.register({
    //   environment: process.env.PAYPAL_ENVIRONMENT as 'sandbox' | 'live',
    //   clientId: process.env.PAYPAL_CLIENT_ID || 'AQg0_sStegJDdn4y7X3F3SO8QpQBtegCld3pp42TbEIFnRLfmdM_DtCONxLQuXvviulx0k8kLdRf4m75',
    //   clientSecret: process.env.PAYPAL_CLIENT_SECRET || 'ENn68HNK7yuL2UyCNp5iXgOFd7piKk9SOU6Q9UGuIFFMfHnQ8Nmgk2TMb6ca_MPkiKkDujMUQepSnSIj',
    // }),
  ],
  providers: [
    MembershipResolver,
    MembershipService,
    { provide: 'SEQUELIZE', useExisting: Sequelize },
  ],
  exports: [SequelizeModule, MembershipService],
})
export class MembershipModule {}
