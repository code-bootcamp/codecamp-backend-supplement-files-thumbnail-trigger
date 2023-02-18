import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,

    private readonly dataSource: DataSource,
  ) {}

  async findAll() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('READ COMMITTED');
    try {
      // 하나의 트랜잭션 내에서 500원이 조회됐으면,
      // 해당 트랜잭션이 끝나기 전까지는(커밋 전까지는) 다시 조회하더라도 항상 500원이 조회(Repeatable-Read) 되어야 함
      const payment = await queryRunner.manager.findOne(Payment, {
        where: { id: 'd2ee2dea-816e-4aa0-9f19-e10b94ffe464' },
        select: { amount: true },
      });
      console.log(`당신이 가진 돈은 ${payment.amount}원 입니다.`); // >>>>>>>>>>>>>>>> 1. 최초 금액 기록

      const paymentTax = await queryRunner.manager.findOne(Payment, {
        where: { id: 'd2ee2dea-816e-4aa0-9f19-e10b94ffe464' },
        select: { amount: true, tax: true },
      });
      const result = paymentTax.amount - paymentTax.tax;
      console.log(`당신이 가진 돈에서 세금을 제외하면 ${result}원 입니다.`); // >>>>>>>>>>> 2. 세금 제외한 금액 기록

      // 여러 로직을 수행하는데 5초가 걸렸다고 가정하고, 5초 후 최종금액에서 수수료를 뺀 값을 결과로 리턴하려고 함.
      // 이 사이에 누군가 수정하면(update), Repeatable-Read 보장되지 않음 => Non-Repeatable-Read 문제!!!
      setTimeout(async () => {
        const paymentCommission = await queryRunner.manager.findOne(Payment, {
          where: { id: 'd2ee2dea-816e-4aa0-9f19-e10b94ffe464' },
          select: { amount: true, commission: true },
        });
        const result = paymentCommission.amount - paymentCommission.commission;
        console.log(`당신이 가진 돈에서 수수료를 빼면 ${result}원 입니다.`); // >>>>>>>>>>> 3. 수수료 제외한 금액 기록
      }, 5000);
    } catch (error) {
      await queryRunner.rollbackTransaction();
    }
  }

  async create({ amount }) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('READ COMMITTED');
    try {
      // 중간에 돈 수정해보기
      const payment = await queryRunner.manager.findOne(Payment, {
        where: { id: 'd2ee2dea-816e-4aa0-9f19-e10b94ffe464' },
      });
      payment.amount = 1;
      await queryRunner.manager.save(payment);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    }
  }
}
