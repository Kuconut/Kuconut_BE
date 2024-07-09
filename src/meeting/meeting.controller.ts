import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MeetingService } from './meeting.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { AuthGuard } from 'src/auth/security/auth.guard';
import { MeetingIdDto } from './dto/meeting_id.dto';

@ApiTags('Meeting')
@Controller('meeting')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @Post('make_meeting')
  @ApiOperation({ summary: '모임 만들기' })
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
  @ApiOperation({ summary: "타입으로 모임 조회 ['all', 'play', 'eat', 'extra', 'study']" })
  findByType(@Param('type') type: string) {
    return this.meetingService.findByType(type);
  }

  @Patch('/join')
  @ApiOperation({ summary: '모임 참가' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('token')
  async joinMeeting(@Req() req: Request, @Body() meetingIdDto: MeetingIdDto) {
    const meeting_id = meetingIdDto.meeting_id;
    const { user }:any = req;
    return await this.meetingService.joinMeeting(user, meeting_id);
  }

  @Patch('/leave')
  @ApiOperation({ summary: '모임 나가기' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('token')
  async leaveMeeting(@Req() req: Request, @Body() meetingIdDto: MeetingIdDto) {
    const meeting_id = meetingIdDto.meeting_id;
    const { user }:any = req;
    return await this.meetingService.leaveMeeting(user, meeting_id);
  }


  @Delete('/delete')
  @ApiOperation({ summary: '모임 삭제(만든 사람만 가능)' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('token')
  remove(@Req() req: Request, @Body() meetingIdDto: MeetingIdDto) {
    const meeting_id = meetingIdDto.meeting_id;
    const { user }:any = req;
    return this.meetingService.remove(user, meeting_id);
  }
}
