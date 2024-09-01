import { Delete } from "@nestjs/common";
import { BeforeInsert, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import * as bcrypt from 'bcrypt';
import { MeetingComment } from "src/meeting/entities/meeting.comment.entity";
import { Meeting } from "src/meeting/entities/meeting.entity";

@Entity({ schema: 'users', name: 'users'})
export class User {
    @PrimaryGeneratedColumn({name : 'id', type  : 'int'})
    id: number;

    @Column({name : 'user_id', type : 'varchar', length : 255, nullable : true})
    user_id: string;

    @Column({name : 'password', type : 'varchar', length : 255, nullable : true})
    password: string;

    @Column({name : 'email', type : 'varchar', length : 255})
    email: string;
    
    @Column({name : 'nickname', type : 'varchar', length : 255})
    nickname: string;

    @Column({name : 'refreshtoken', type : 'varchar', length : 255, nullable : true})
    refreshtoken: string;

    @Column({name: 'refreshTokenExpiresIn', type: 'timestamp', nullable: true})
    refreshTokenExpiresIn: Date;

    @Column({name : 'profile_image', type : 'varchar', length : 255, nullable : true})
    profile_image: string;
    
    @OneToMany(() => Meeting, (meeting) => meeting.created_by)
    made_meetings: Meeting[];
    
    @ManyToMany(() => Meeting, (meeting) => meeting.meetingUsers) 
    // @JoinTable({ 
    //   name: 'users_my_meetings_meeting',
    //   joinColumn: { name: 'usersId', referencedColumnName: 'id' },
    //   inverseJoinColumn: { name: 'meetingId', referencedColumnName: 'id' },
    // })
    my_meetings: Meeting[];

    @ManyToMany(() => Meeting, (meeting) => meeting.likedUsers)
    // @JoinTable({ 
    //   name: 'users_liked_meetings_meeting',
    //   joinColumn: { name: 'usersId', referencedColumnName: 'id' },
    //   inverseJoinColumn: { name: 'meetingId', referencedColumnName: 'id' },
    // })
    liked_meetings: Meeting[];

    @OneToMany(() => MeetingComment, (meeting) => meeting.user)
    meetingcomments: MeetingComment[];

    @Column({name : "isSocialAccont", type : 'boolean', default : false})
    isSocialAccount: boolean;

    @Column({name : "externalId", type : 'varchar', length : 255, nullable : true, default : null})
    externalId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date | null;

    @BeforeInsert()
    private async beforeInsert() {
      this.password = await bcrypt.hashSync(this.password, 10);
    }
}
