import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MeetingService } from './meeting.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { AuthGuard } from 'src/auth/security/auth.guard';
import { MeetingIdDto } from './dto/meeting_id.dto';
import { OptionalAuthGuard } from 'src/auth/security/auth.optionalguard';
import { User } from 'src/users/entities/user.entity';
import { UpdateMeetingDto } from './dto/update-meeting.dto';

@ApiTags('Meeting')
@Controller('meeting')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @Post('make_meeting')
  @ApiOperation({ summary: '모임 만들기' })
  @ApiResponse({ status: 403.1, description: '날짜가 올바르지 않을 때' })
  @ApiResponse({ status: 403.2, description: '인원수 설정이 올바르지 않을 때' })
  @ApiResponse({ status: 401, description: '로그인 없을 시'})
  @ApiResponse({ status: 200, description: '그 외 정상적인 응답' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('token')
  create(@Req() req: Request, @Body() createMeetingDto: CreateMeetingDto) {
    const { user }:any = req;
    return this.meetingService.create(user, createMeetingDto);
  }

  @Get('id/:id')
  @ApiOperation({ summary: '아이디로 모임 조회' })
  findOne(@Param('id') id: string) {
    return this.meetingService.findById(+id);
  }

  @Get('type:type')
  @ApiResponse({ status: 403.1, description: 'type이 all, play, eat, extra, study 가 아닐 때' })
  @ApiResponse({ status: 403.2, description: 'searchtype이 meeting_name_description, created_by 가 아닐 때' })
  @ApiResponse({ status: 200, description: '이 외 정상적 응답' })
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth('token')
  @ApiOperation({ summary: "모임 조회 ['all', 'play', 'eat', 'extra', 'study'] / isnew가 true면 새로 작성된 순으로 정렬 (default오 false는 모임날짜 기준)" })
  @ApiQuery({ name: 'searchtype', required: false })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'stdate', required: false })
  @ApiQuery({ name: 'eddate', required: false })
  @ApiQuery({ name: 'new', required: false })
  findMeeting(@Req() req, @Param('type') type: string, @Query('searchtype') searchtype?: string, @Query('keyword') keyword?: string,@Query('stdate') stdate?: Date, @Query('eddate') eddate?: Date, @Query('new') isnew?: boolean) {
    if(req.user){
      return this.meetingService.findMeeting(type, searchtype, keyword, stdate, eddate, isnew, req.user);
    }
    return this.meetingService.findMeeting(type, searchtype, keyword, stdate, eddate, isnew);
  }

  @Patch('/join')
  @ApiOperation({ summary: '모임 참가' })
  @ApiResponse({ status: 403.1, description: 'deadline 이후일 때' })
  @ApiResponse({ status: 404, description: '미팅이 존재하지 않을 때' })
  @ApiResponse({ status: 403.2, description: '최대 인원수일 떄' })
  @ApiResponse({ status: 401, description: '로그인 없을 시'})
  @ApiResponse({ status: 200, description: '이 외 정상적 응답' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('token')
  async joinMeeting(@Req() req: Request, @Body() meetingIdDto: MeetingIdDto) {
    const meeting_id = meetingIdDto.meeting_id;
    const { user }:any = req;
    return await this.meetingService.joinMeeting(user, meeting_id);
  }

  @Patch('/like')
  @ApiOperation({ summary: '모임 찜하기' })
  @ApiResponse({ status: 404, description: '미팅이 존재하지 않을 떄' })
  @ApiResponse({ status: 401, description: '로그인 없을 시'})
  @ApiResponse({ status: 200, description: '이 외 정상적 응답' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('token')
  async likeMeeting(@Req() req: Request, @Body() meetingIdDto: MeetingIdDto) {
    const meeting_id = meetingIdDto.meeting_id;
    const { user }:any = req;
    return await this.meetingService.likeMeeting(user, meeting_id);
  }

  @Patch('/leave')
  @ApiOperation({ summary: '모임 나가기' })
  @ApiResponse({ status: 404, description: '미팅이 존재하지 않을 떄' })
  @ApiResponse({ status: 403.1, description: '모임을 만든 사용자일 때' })
  @ApiResponse({ status: 403.2, description: '모임에 참가하지 않은 사용자일 때' })
  @ApiResponse({ status: 401, description: '로그인 없을 시'})
  @ApiResponse({ status: 200, description: '이 외 정상적 응답' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('token')
  async leaveMeeting(@Req() req: Request, @Body() meetingIdDto: MeetingIdDto) {
    const meeting_id = meetingIdDto.meeting_id;
    const { user }:any = req;
    return await this.meetingService.leaveMeeting(user, meeting_id);
  }
  
  /*
  @Patch('/unlike')
  @ApiOperation({ summary: '모임 찜 취소' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('token')
  async unlikeMeeting(@Req() req: Request, @Body() meetingIdDto: MeetingIdDto) {
    const meeting_id = meetingIdDto.meeting_id;
    const { user }:any = req;
    return await this.meetingService.unlikeMeeting(user, meeting_id);
  }
  */

  @Patch('/edit')
  @ApiOperation({ summary: '모임 수정(만든 사람만 가능)' })
  @ApiResponse({ status: 404, description: '미팅이 존재하지 않을 떄' })
  @ApiResponse({ status: 401.2, description: '모임을 만든 사용자가 아닐 때' })
  @ApiResponse({ status: 401.1, description: '로그인 없을 시'})
  @ApiResponse({ status: 403, description: '날짜가 올바르지 않을 때' })
  @ApiResponse({ status: 200, description: '이 외 정상적 응답' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('token')
  async edit(@Req() req: Request, @Body() updateMeetingDto: UpdateMeetingDto) {
    const { user }:any = req;
    return await this.meetingService.edit(user, updateMeetingDto);
  }


  @Delete('/delete')
  @ApiOperation({ summary: '모임 삭제(만든 사람만 가능)' })
  @ApiResponse({ status: 404, description: '미팅이 존재하지 않을 떄' })
  @ApiResponse({ status: 401.2, description: '모임을 만든 사용자가 아닐 때' })
  @ApiResponse({ status: 403.2, description: '모임에 참가한 사용자가 최소 인원 이상일 때' })
  @ApiResponse({ status: 401.1, description: '로그인 없을 시'})
  @ApiResponse({ status: 200, description: '이 외 정상적 응답' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('token')
  remove(@Req() req: Request, @Body() meetingIdDto: MeetingIdDto) {
    const meeting_id = meetingIdDto.meeting_id;
    const { user }:any = req;
    return this.meetingService.remove(user, meeting_id);
  }

  
  @Get('/my/comingmeeting')
  @ApiResponse({ status: 401, description: '로그인 없을 시'})
  @ApiResponse({ status: 200, description: '로그인 시' })
  @ApiOperation({ summary: '다가오는 모임 조회//type은 all, mine, joined 중 하나' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('token')
  findComingMeetings(@Req() req: Request, @Query('type') type: string) {
    const { user }:any = req;
    return this.meetingService.findComingMeetings(user, type);
  }

  @Get('/my/pastmeeting')
  @ApiOperation({ summary: '내가 가입한 모임 조회//type은 all, mine, joined 중 하나' })
  @ApiResponse({ status: 401, description: '로그인 없을 시'})
  @ApiResponse({ status: 200, description: '로그인 시' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('token')
  findPastMeetings(@Req() req: Request, @Query('type') type: string) {
    const { user }:any = req;
    return this.meetingService.findPastMeetings(user, type);
  }

  @Get('/my/likedmeeting')
  @ApiOperation({ summary: '내가 찜한 모임 조회//type은 all만 존재' })
  @ApiResponse({ status: 401, description: '로그인 없을 시'})
  @ApiResponse({ status: 200, description: '로그인 시' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('token')
  findLikedMeetings(@Req() req: Request, @Query('type') type: string) {
    const { user }:any = req;
    return this.meetingService.findLikedMeetings(user, type);
  }
}
