import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { MeetingRepository } from './meeting.repository';
import { Meeting } from './entities/meeting.entity';
import { User } from 'src/users/entities/user.entity';
import { DataSource } from 'typeorm';
import { UsersRepository } from 'src/users/users.repository';

@Injectable()
export class MeetingService {
  constructor(
    private readonly meetingRepository:MeetingRepository,
    private readonly usersRepository: UsersRepository,
    private readonly dataSource: DataSource
  ) {}

  async create(user: User, createMeetingDto: CreateMeetingDto) {
    const meeting = new Meeting();
    
    // 한국 시간으로 설정
    const now = new Date();
    const norm = new Date(now);
    norm.setMinutes(now.getMinutes() + 30);
    const kr_meeting_Date = new Date(createMeetingDto.meeting_date);
    const kr_deadline = new Date(createMeetingDto.deadline);

    if(kr_meeting_Date < norm || kr_deadline < norm || kr_meeting_Date < kr_deadline) {
      throw new ForbiddenException("날짜가 올바르지 않습니다.");
    }
    if(createMeetingDto.min_user > createMeetingDto.max_user || createMeetingDto.min_user < 2) {
      throw new ForbiddenException("인원수 설정이 올바르지 않습니다.");
    }

    meeting.meeting_name = createMeetingDto.meeting_name;
    meeting.meeting_description = createMeetingDto.meeting_description;
    meeting.type = createMeetingDto.type;
    
    /*
    if(now.getFullYear() === kr_meeting_Date.getFullYear() && now.getMonth() === kr_meeting_Date.getMonth() && kr_meeting_Date.getDate() - now.getDate()  <= 1) {
      meeting.is_flash = true;
    }
    else {
      meeting.is_flash = false;
    }
    */
    meeting.is_flash = false;


    meeting.created_by = user;
    meeting.meetingUsers = [];
    meeting.likedUsers = [];
    meeting.deadline = createMeetingDto.deadline;
    meeting.meeting_date = createMeetingDto.meeting_date;
    meeting.min_user = createMeetingDto.min_user;
    meeting.max_user = createMeetingDto.max_user;
    meeting.user_count = 1;

    return await this.meetingRepository.save(meeting);
  }

  findById(id: number) {
    return this.meetingRepository.findById(id);
  }

  findMeeting(type: string, searchtype?: string, keyword?: string, stdate?: Date, eddate?: Date, isnew?: boolean, user?: User) {
    const possible_type = ['all', 'play', 'eat', 'extra', 'study'];
    const poosible_search = ['meeting_name_description', 'created_by'];
    if(!possible_type.includes(type)) {
      throw new NotFoundException('1');
    }
    if(searchtype && !poosible_search.includes(searchtype)) {
      throw new NotFoundException('2');
    }
    return this.meetingRepository.findMeeting(type, searchtype, keyword, stdate, eddate, isnew, user);
  }

  async joinMeeting(user: User, meeting_id: number) {
    let meeting = await this.meetingRepository.findById(meeting_id);
    const now = new Date();

    if(meeting.deadline < now) {
      throw new ForbiddenException();
    }
    if(!meeting) {
      throw new NotFoundException();
    }
    if(meeting.max_user <= meeting.user_count) {
      throw new ForbiddenException();
    }
    if(meeting.created_by.id === user.id) {
      throw new ForbiddenException();
    }
    if(meeting.meetingUsers.find((u) => u.id === user.id)) {
      throw new ForbiddenException();
    }
    meeting.meetingUsers.push(user);
    meeting.user_count += 1;

    return await this.meetingRepository.save(meeting);
  }

  async likeMeeting(user: User, meeting_id: number) {
    let meeting = await this.meetingRepository.findById(meeting_id);

    if(!meeting) {
      throw new NotFoundException("미팅이 존재하지 않습니다.");
    }
    if(meeting.created_by.id === user.id) {
      throw new ForbiddenException("모임을 만든 사용자입니다.");
    }
    const num = meeting.likedUsers.length;
    meeting.likedUsers = meeting.likedUsers.filter((u) => u.id !== user.id);
    if(meeting.likedUsers.length !== num) {
      await this.meetingRepository.save(meeting);
      return {message: 'unliked'};
    }
    else{
      meeting.likedUsers.push(user);
      await this.meetingRepository.save(meeting);
      return {message: 'liked'};
    }
  }

  async leaveMeeting(user: User, meeting_id: number) {
    let meeting = await this.meetingRepository.findById(meeting_id);

    if(!meeting) {
      throw new NotFoundException("미팅이 존재하지 않습니다.");
    }
    if(meeting.created_by.id === user.id) {
      throw new ForbiddenException("모임을 만든 사용자입니다.");
    }
    const num = meeting.meetingUsers.length;
    meeting.meetingUsers = meeting.meetingUsers.filter((u) => u.id !== user.id);
    if(num === meeting.meetingUsers.length) {
      throw new ForbiddenException("모임에 가입하지 않은 사용자입니다.");
    }
    meeting.user_count -= 1;

    return await this.meetingRepository.save(meeting);
  }

  async unlikeMeeting(user: User, meeting_id: number) {
    let meeting = await this.meetingRepository.findById(meeting_id);

    if(!meeting) {
      throw new NotFoundException("미팅이 존재하지 않습니다.");
    }
    const num = meeting.meetingUsers.length;
    meeting.likedUsers = meeting.likedUsers.filter((u) => u.id !== user.id);
    if(num === meeting.likedUsers.length) {
      throw new ForbiddenException("찜하지 않은 모임입니다.");
    }

    return await this.meetingRepository.save(meeting);
  }

  async remove(user: User, id: number) {
    const meeting = await this.meetingRepository.findById(id);
    if(!meeting) {
      throw new NotFoundException("미팅이 존재하지 않습니다.");
    }
    if(meeting.created_by.id !== user.id) {
      throw new ForbiddenException("모임을 만든 사용자가 아닙니다.");
    }
    if(meeting.user_count >= meeting.min_user) {
      throw new ForbiddenException("모임에 참가한 사용자가 최소인원 이상입니다.");
    }
    
    return this.meetingRepository.delete(id);
  }
}
