import { Delete } from "@nestjs/common";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ schema: 'users', name: 'user'})
export class User {
    @PrimaryGeneratedColumn({name : 'id', type  : 'int'})
    id: number;

    @Column({name : 'user_id', type : 'varchar', length : 255})
    user_id: string;

    @Column({name : 'password', type : 'varchar', length : 255})
    password: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date | null;
}
