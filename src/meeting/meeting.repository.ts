import { Between, Brackets, EntityManager, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Meeting } from './entities/meeting.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class MeetingRepository extends Repository<Meeting> {
    constructor(
        @InjectRepository(Meeting) private readonly repository: Repository<Meeting>,
    ) {
        super(repository.target, repository.manager);
    }

    async findById(id: number): Promise<Meeting> {
        return await this.repository.findOne({ where : { id }, relations: ['created_by', 'meetingUsers', 'likedUsers'] });
    }


    async findMeeting(type: string, searchtype?: string, keyword?: string, startdate?: Date, eddate?: Date, isnew?: boolean, user?: User): Promise<Meeting[]> {
        const current_date = new Date();
        let stdate = new Date(startdate);
        const queryBuilder = this.repository.createQueryBuilder('meeting')

        queryBuilder.leftJoinAndSelect('meeting.created_by', 'created_by');
        queryBuilder.leftJoinAndSelect('meeting.meetingUsers', 'meetingUsers');
        queryBuilder.leftJoinAndSelect('meeting.likedUsers', 'likedUsers'); 
        
        if(!startdate || stdate.getTime() < current_date.getTime()) {
            stdate = current_date;
        }

        if(type !== 'all') {
            queryBuilder.where('type = :type', { type: type });
        }
        if(eddate){
            queryBuilder.andWhere('meeting_date BETWEEN :stdate AND :eddate', { stdate: stdate, eddate: eddate });
        }
        else{
            queryBuilder.andWhere('meeting_date >    :stdate', { stdate: stdate });
        }
        
        if(searchtype) {
            if(searchtype === 'meeting_name_description') {
                queryBuilder.andWhere(new Brackets
                    (qb => {qb.where('meeting_name LIKE :keyword OR meeting_description LIKE :keyword', { keyword: `%${keyword}%` })}));
            }else if(searchtype === 'created_by') {
                queryBuilder.andWhere('created_by.nickname LIKE :keyword', { keyword: `%${keyword}%` });
            }
        }
        
        if(isnew===true) {
            queryBuilder.orderBy('meeting.createdAt', 'DESC');
        }
        else{
            queryBuilder.orderBy('meeting.meeting_date', 'ASC');
        }

        return await queryBuilder.getMany();
    }

    async findUserMeetings(user: User, type:string, iscoming: boolean): Promise<Meeting[]> {
        const currentDate = new Date();
        const queryBuilder = this.repository.createQueryBuilder('meeting')
        queryBuilder.leftJoinAndSelect('meeting.created_by', 'created_by');
        queryBuilder.leftJoinAndSelect('meeting.meetingUsers', 'meetingUsers');
        queryBuilder.leftJoinAndSelect('meeting.likedUsers', 'likedUsers');
        if(iscoming) {
            queryBuilder.where('meeting_date > :currentDate', { currentDate });
        }else{
            queryBuilder.where('meeting_date < :currentDate', { currentDate });
        }   
        if(type === 'all') {
            queryBuilder.andWhere('meetingUsers.id = :id', { id: user.id });
        }
        else if(type === 'mine') {
            queryBuilder.andWhere('created_by.id = :id', { id: user.id });
        }
        else if(type === 'joined') {
            queryBuilder.andWhere('meetingUsers.id = :id', { id: user.id });
            queryBuilder.andWhere('created_by.id != :id', { id: user.id });
        }
        queryBuilder.orderBy('meeting_date', 'ASC');
        
        const result = await queryBuilder.getMany();

        return result;
    }

    async findLikedMeetings(user: User, type:string): Promise<Meeting[]> {
        const currentDate = new Date();
        const queryBuilder = this.repository.createQueryBuilder('meeting')
        queryBuilder.leftJoinAndSelect('meeting.created_by', 'created_by');
        queryBuilder.leftJoinAndSelect('meeting.meetingUsers', 'meetingUsers');
        queryBuilder.leftJoinAndSelect('meeting.likedUsers', 'likedUsers');
        queryBuilder.where('likedUsers.id = :id', { id: user.id });
        queryBuilder.andWhere('meeting_date > :currentDate', { currentDate });
        queryBuilder.orderBy('meeting_date', 'ASC');
        
        const result = await queryBuilder.getMany();

        return result
    }
}
