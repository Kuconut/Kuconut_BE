import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MeetingComment } from "./meeting.comment.entity";
import { User } from "src/users/entities/user.entity";

@Entity()
export class Meeting{
    @PrimaryGeneratedColumn({name : 'id', type  : 'int'})
    id: number;

    @Column({name : 'meeting_name', type : 'varchar', length : 255})
    meeting_name: string;

    @Column({name : 'meeting_description', type : 'varchar', length : 2047})
    meeting_description: string;

    @OneToMany(() => MeetingComment, (comment) => comment.meeting, { cascade: true })
    comments: MeetingComment[];

    @Column({name : 'type', type : 'varchar', length : 255})
    type: string;

    @Column({name : 'is_flash', type : 'boolean'})
    is_flash: boolean;

    @ManyToOne(() => User, (creator) => creator.made_meetings)
    @JoinColumn()
    created_by: User;

    @ManyToMany(() => User, (user) => user.posted_meetings)
    meetingUsers: User[];

    @ManyToMany(() => User, (user) => user.liked_meetings)
    likedUsers: User[];

    @Column({name : "user_count", type : 'int'})
    user_count: number;

    @Column({name : 'deadline', type: 'timestamp' })
    deadline: Date;

    @Column({name : 'meeting_date', type: 'timestamp' })
    meeting_date: Date;

    @Column({ name: 'min_user', type: 'int' })
    min_user: number;

    @Column({ name: 'max_user', type: 'int' })
    max_user: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date | null;
}
