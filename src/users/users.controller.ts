import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile, UnsupportedMediaTypeException, ForbiddenException, InternalServerErrorException, UnauthorizedException, Query, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateUserPwdDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/security/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, FileFilterCallback } from 'multer';
import { UpdateUserNickDto } from './dto/update-nickname.dto';
import { extname } from 'path';
import { Storage } from '@google-cloud/storage';
import {v4 as uuidv4} from 'uuid';

const storage = new Storage(

);

const bucket = storage.bucket();
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: '모든 유저 조회(개발용으로 사용)' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('/profile')
  @ApiOperation({ summary: '프로필 정보 불러오기'})
  @UseGuards(AuthGuard)
  @ApiBearerAuth('token')
  getProfile(@Req() req) {
    const {user} = req;
    delete user.password;
    delete user.refreshtoken;
    delete user.refreshTokenExpiresIn;
    delete user.isSocialAccount;
    delete user.externalId;
    return user;
  }

  @Post('/photo')
  @ApiResponse({ status: 401, description: '로그인 없을 시'})
  @ApiResponse({ status: 201, description: '로그인+image가 정상적일 시' })
  @ApiOperation({ summary: '프로필 사진 업로드 // key는 profile // 가능한 형식은 jpg|jpeg|png' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('token')
  @UseInterceptors(
    FileInterceptor('profile', {
      storage: {
        _handleFile(req, file, callback) {
          const uniqueSuffix = uuidv4();
          const blob = bucket.file(`${uniqueSuffix}-${file.originalname}`);
          const blobStream = blob.createWriteStream({
            resumable: false,
            contentType: file.mimetype,
          });

          blobStream.on('finish', () => {
            callback(null, {
              filename: blob.name,
              path: `https://storage.googleapis.com/${bucket.name}/${blob.name}`,
            });
          });

          blobStream.on('error', (err) => {
            callback(new BadRequestException('파일 업로드 실패'), false);
          });

          file.stream.pipe(blobStream);
        },
        _removeFile(req, file, callback) {
          const blob = bucket.file(file.filename);
          blob.delete(callback);
        },
      },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(
            new BadRequestException('이미지 파일만 업로드할 수 있습니다.'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  uploadProfileImage(@Req() req, @UploadedFile() file) {
    const {user} = req;
    if(user.profile_image !== 'https://storage.googleapis.com/onboard_bucket/basic_image.png') {
      try {
        const filename = user.profile_image.split('onboard_bucket/')[1];
        const blob = bucket.file(filename);
        blob.delete();
      } catch (error) {
        throw new InternalServerErrorException('기존 이미지 삭제 실패');
      }
    }
    return this.usersService.uploadProfileImage(user, file.path);
  }

  // @Get('/comingmeeting')
  // @ApiResponse({ status: 401, description: '로그인 없을 시'})
  // @ApiResponse({ status: 200, description: '로그인 시' })
  // @ApiOperation({ summary: '다가오는 모임 조회//type은 all, mine, joined 중 하나 (일단은 Meeting에 있는걸 사용해주세요)' })
  // @UseGuards(AuthGuard)
  // @ApiBearerAuth('token')
  // findComingMeetings(@Req() req: Request, @Query('type') type: string) {
  //   const { user }:any = req;
  //   return this.usersService.findComingMeetings(user, type);
  // }


  // @Get('/pastmeeting')
  // @ApiOperation({ summary: '내가 가입한 모임 조회//type은 all, mine, joined 중 하나 (일단은 Meeting에 있는걸 사용해주세요)' })
  // @ApiResponse({ status: 401, description: '로그인 없을 시'})
  // @ApiResponse({ status: 200, description: '로그인 시' })
  // @UseGuards(AuthGuard)
  // @ApiBearerAuth('token')
  // findPastMeetings(@Req() req: Request, @Query('type') type: string) {
  //   const { user }:any = req;
  //   return this.usersService.findPastMeetings(user, type);
  // }

  // @Get('/likedmeeting')
  // @ApiOperation({ summary: '내가 찜한 모임 조회//type은 all만 존재 (일단은 Meeting에 있는걸 사용해주세요)' })
  // @ApiResponse({ status: 401, description: '로그인 없을 시'})
  // @ApiResponse({ status: 200, description: '로그인 시' })
  // @UseGuards(AuthGuard)
  // @ApiBearerAuth('token')
  // findLikedMeetings(@Req() req: Request, @Query('type') type: string) {
  //   const { user }:any = req;
  //   return this.usersService.findLikedMeetings(user, type);
  // }

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
