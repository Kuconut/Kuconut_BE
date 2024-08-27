import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { createMeetingCommentDto } from "./dto/create-meeting.comment.dto";
import { User } from "src/users/entities/user.entity";
import { MeetingComment } from "./entities/meeting.comment.entity";
import { MeetingCommentRepository } from "./meeting.comment.repository";
import { MeetingRepository } from "./meeting.repository";
import { IsNull } from "typeorm";

@Injectable()
export class MeetingCommentService {
    constructor(
        private readonly meetingCommentRepository: MeetingCommentRepository,
        private readonly meetingRepository: MeetingRepository,
    ) {}

    async createComment(createCommentDto: createMeetingCommentDto, meeting_id: number, user:User) {
        const comment = new MeetingComment();

        const meeting = await this.meetingRepository.findById(meeting_id);
        if(!meeting) {
            throw new NotFoundException();
        }
        comment.user = user;
        comment.meeting = meeting;
        comment.content = createCommentDto.content;
        if(createCommentDto.parent_id) {
            const parent = await this.meetingCommentRepository.findById(createCommentDto.parent_id);
            if(!parent) {
                throw new NotFoundException();
            }
            
            comment.parent = parent;
        } 
        await this.meetingCommentRepository.save(comment);
        return this.getComments(meeting_id);
    }

    async getComments(meeting_id: number, user?: User) {
        const result = await this.meetingCommentRepository.getComments(meeting_id);
        const meeting_owner_id = result[0].meeting.created_by.id;

        result.forEach((comment) => {
            if(user===comment.user) {
                comment['is_mine'] = true;
            }else{
                comment['is_mine'] = false;
            }
            if(user){
                if(user.id===meeting_owner_id) {
                    comment['is_owner'] = true;
                }
                else{
                    comment['is_owner'] = false;
                }
            }else{
                comment['is_owner'] = false;
            }
            comment.children.forEach((child) => {
                if(user===child.user) {
                    child['is_mine'] = true;
                }else{
                    child['is_mine'] = false;
                }
                if(user){
                    if(user.id===meeting_owner_id) {
                        child['is_owner'] = true;
                    }
                    else{
                        child['is_owner'] = false;
                    }
                }else{
                    child['is_owner'] = false;
                }
            })
        })
        return result;
    }

    async removeComment(comment_id: number, user: User) {
        let comment = await this.meetingCommentRepository.findById(comment_id);

        if(!comment) {
            throw new NotFoundException();
        }
        if(comment.user.id !== user.id) {
            throw new UnauthorizedException();
        }
        comment.content = '삭제된 메시지입니다.';
        comment.user = null; 
        return await this.meetingCommentRepository.save(comment);
    } 
}
