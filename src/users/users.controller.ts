import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile, UnsupportedMediaTypeException, ForbiddenException, InternalServerErrorException, UnauthorizedException, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateUserPwdDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/security/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, FileFilterCallback } from 'multer';
import { UpdateUserNickDto } from './dto/update-nickname.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: '모든 유저 조회(개발용으로 사용)' })
  findAll() {
    return this.usersService.findAll();
  }

  @Post('/photo')
  @UseInterceptors(FileInterceptor('image',{
    fileFilter: (req: Request, file, cb: FileFilterCallback) => {
      if(!file.mimetype.match(/\/(jpg)/)){
        return cb(new UnsupportedMediaTypeException(
          'jpg형식의 파일만 업로드 가능합니다.'
        ),);
      }
      cb(null, true);
  },
  storage: diskStorage({
    destination: './images',
    filename: (req, file, cb) => {
      const extArray = file.mimetype.split('/');

      const date_now = `${Date.now()}`;
      cb(null, date_now + '.' + extArray[extArray.length - 1]);
    },
  }),
  //limits: { fileSize: 5 * 1024 * 1024 },
  }))
  @ApiOperation({ summary: '이미지 업로드//개발중' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('token')
  uploadImage(@Req() req: Request, @UploadedFile() image: Express.Multer.File){
    if(image === undefined){
      throw new InternalServerErrorException('이미지를 업로드해주세요.');
    }
    return image.filename;
  }

  @Get('/comingmeeting')
  @ApiResponse({ status: 401, description: '로그인 없을 시'})
  @ApiResponse({ status: 200, description: '로그인 시' })
  @ApiOperation({ summary: '다가오는 모임 조회//type은 all, mine, joined 중 하나 (일단은 Meeting에 있는걸 사용해주세요)' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('token')
  findComingMeetings(@Req() req: Request, @Query('type') type: string) {
    const { user }:any = req;
    return this.usersService.findComingMeetings(user, type);
  }


  @Get('/pastmeeting')
  @ApiOperation({ summary: '내가 가입한 모임 조회//type은 all, mine, joined 중 하나 (일단은 Meeting에 있는걸 사용해주세요)' })
  @ApiResponse({ status: 401, description: '로그인 없을 시'})
  @ApiResponse({ status: 200, description: '로그인 시' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('token')
  findPastMeetings(@Req() req: Request, @Query('type') type: string) {
    const { user }:any = req;
    return this.usersService.findPastMeetings(user, type);
  }

  @Get('/likedmeeting')
  @ApiOperation({ summary: '내가 찜한 모임 조회//type은 all만 존재 (일단은 Meeting에 있는걸 사용해주세요)' })
  @ApiResponse({ status: 401, description: '로그인 없을 시'})
  @ApiResponse({ status: 200, description: '로그인 시' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('token')
  findLikedMeetings(@Req() req: Request, @Query('type') type: string) {
    const { user }:any = req;
    return this.usersService.findLikedMeetings(user, type);
  }

  @Get('/mycomments')
  @ApiOperation({ summary: '내가 작성한 모든 댓글 조회' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('token')
  findAllMyComments(@Req() req: Request) {
    const { user }:any = req;
    return this.usersService.findAllMyComments(user);
  }

  @Patch('/changepwd')
  @ApiOperation({ summary: '비밀번호 변경' })
  @ApiResponse({ status: 401.1, description: '로그인 없을 시'})
  @ApiResponse({ status: 401.2, description: '기존 비밀번호가 틀릴 때' })
  @ApiResponse({ status: 403, description: '기존 비밀번호와 새로운 비밀번호가 같을 때' })
  @ApiResponse({ status: 500, description: 'body형식을 지키지 않았을 때' })
  @ApiResponse({ status: 200, description: '그 외 정상적인 응답' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('token')
  updatePwd(@Req() req: Request, @Body() updateUserDto: UpdateUserPwdDto) {
    const { user }:any = req;
    return this.usersService.updatePwd(user, updateUserDto);
  }

  @Patch('/updatenick')
  @ApiOperation({ summary: '닉네임 변경' })
  @ApiResponse({ status: 401, description: '로그인 없을 시'})
  @ApiResponse({ status: 500, description: 'body형식을 지키지 않았을 때' })
  @ApiResponse({ status: 200, description: '그 외 정상적인 응답' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('token')
  updateNick(@Req() req: Request, @Body() updateUserNickDto: UpdateUserNickDto) {
    const { user }:any = req;
    return this.usersService.updateNick(user, updateUserNickDto);
  }

  @Delete('/delete')
  @ApiOperation({ summary: '유저 탈퇴' })
  @ApiResponse({ status: 401, description: '로그인 없을 시'})
  @ApiResponse({ status: 200, description: '그 외 정상적인 응답' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('token')
  remove(@Req() req: Request) {
    const { user }:any = req;
    return this.usersService.remove(user);
  }
}
