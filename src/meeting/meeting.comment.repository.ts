import { IsNull, Repository } from "typeorm";
import { MeetingComment } from "./entities/meeting.comment.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";


@Injectable()
export class MeetingCommentRepository extends Repository<MeetingComment> {
    constructor(
        @InjectRepository(MeetingComment) private readonly repository: Repository<MeetingComment>,
    ) {
        super(repository.target, repository.manager);
    }

    async findById(id: number): Promise<MeetingComment> {
        return await this.repository.findOne({ where : {id: id, parent: IsNull()}, relations: ['user']});
    }

    async getComments(id: number): Promise<MeetingComment[]> {
        const queryBuilder = this.repository.createQueryBuilder('meeting_comment');

        queryBuilder.leftJoinAndSelect('meeting_comment.user', 'user');
        queryBuilder.leftJoinAndSelect('meeting_comment.children', 'children');
        queryBuilder.leftJoinAndSelect('children.user', 'children_user');
        queryBuilder.leftJoinAndSelect('meeting_comment.parent', 'parent');
        queryBuilder.leftJoinAndSelect('meeting_comment.meeting', 'meeting');
        queryBuilder.leftJoinAndSelect('meeting.created_by', 'created_by');
        queryBuilder.where('meeting.id = :id', { id: id });
        queryBuilder.andWhere('meeting_comment.parent IS NULL');

        return await queryBuilder.getMany();
        
    }

}
