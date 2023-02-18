import { Mutation, Resolver, Query, Args } from '@nestjs/graphql';
import { Payment } from './entities/payment.entity';
import { PaymentsService } from './payments.service';

@Resolver()
export class PaymentsResolver {
  constructor(private readonly paymentsService: PaymentsService) {}
  @Mutation(() => Payment)
  createPayment(
    @Args('amount') amount: number, //
  ) {
    return this.paymentsService.create({ amount });
  }

  @Query(() => [Payment])
  fetchPayments() {
    return this.paymentsService.findAll();
  }
}
