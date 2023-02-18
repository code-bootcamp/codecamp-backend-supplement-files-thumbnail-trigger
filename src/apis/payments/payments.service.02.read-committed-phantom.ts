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
      // 하나의 트랜잭션 내에서 1개의 데이터가 조회됐으면,
      // 해당 트랜잭션이 끝나기 전까지는(커밋 전까지는) 다시 조회하더라도 항상 1개의 데이터가 조회 되어야 함
      // 1초간 반복해서 조회하는 중에, 누군가 등록하면(create), 유령 데이터가 생겨남 => Phantom-Read
      setInterval(async () => {
        const payment = await queryRunner.manager.find(Payment);
        console.log(payment);
      }, 1000);
    } catch (error) {
      await queryRunner.rollbackTransaction();
    }
  }

  async create({ amount }) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('READ COMMITTED');
    try {
      // 중간에 돈 추가해보기
      const payment = this.paymentsRepository.create({ amount });
      await queryRunner.manager.save(payment);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    }
  }
}
