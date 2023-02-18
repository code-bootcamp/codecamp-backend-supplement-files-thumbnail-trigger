import { Int, ObjectType, Field } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => Int)
  amount: number;

  @Column({ default: 0 })
  @Field(() => Int)
  tax: number;

  @Column({ default: 0 })
  @Field(() => Int)
  commission: number;
}
