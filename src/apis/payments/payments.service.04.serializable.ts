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
    await queryRunner.startTransaction('SERIALIZABLE');
    try {
      // 조회시 락을 걸고 조회함으로써, 다른 쿼리에서 조회 못하게 막음(대기시킴) => Select ~ For Update
      const payment = await queryRunner.manager.find(Payment, {
        lock: { mode: 'pessimistic_write' }, // write_or_fail: 잠겼으면 관두기, partial_write: 잠긴것 패스하고 나머지 수행, for~~: postgres 전용
        where: { id: '0edb1d43-68d5-4225-a992-8b24b3c06972' }, // row-lock
      });
      console.log(payment);

      // 처리에 5초간의 시간이 걸림을 가정!!
      setTimeout(async () => {
        await queryRunner.commitTransaction();
      }, 5000);
      return payment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
    }
  }

  async create({ amount }) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');
    try {
      // 조회를 했을때, 바로 조회되지 않고 락이 풀릴 때 까지 대기
      const payment = await queryRunner.manager.find(Payment, {
        where: { id: '0edb1d43-68d5-4225-a992-8b24b3c06972' },
      });
      console.log('========== 철수가 시도 ==========');
      console.log(payment);
      console.log('==============================');
      await queryRunner.commitTransaction();
      return payment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
    }
  }
}
