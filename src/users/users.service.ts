import { ForbiddenException, forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';
import { UpdateUserPwdDto } from './dto/update-user.dto';
import { query } from 'express';
import { MeetingRepository } from 'src/meeting/meeting.repository';
import { DataSource } from 'typeorm';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { SocialSignupDto } from 'src/auth/dto/social.signup.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserNickDto } from './dto/update-nickname.dto';
import { MeetingService } from 'src/meeting/meeting.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UsersRepository,
  ) {}

  async signup(signupDto: AuthDto.SignUp) {
    const user = new User();
    user.user_id = signupDto.user_id;
    user.password = signupDto.password; 
    user.email = signupDto.email;
    user.nickname = signupDto.nickname;
    user.profile_image = 'https://storage.googleapis.com/onboard_bucket/basic_image.png';

    return await this.userRepository.save(user);
  }

  async signout(user: User) {
    user.refreshtoken = null;
    user.refreshTokenExpiresIn = null;
    return await this.userRepository.save(user);
  }

  async socialSignup(socialSignupDto: SocialSignupDto) {
    const user = new User();
    
    user.email = socialSignupDto.email;
    user.nickname = socialSignupDto.nickname;
    user.isSocialAccount = true;
    user.externalId = socialSignupDto.externalId;

    return await this.userRepository.save(user);
  }

  async updatePwd(user: User, updateUserDto: UpdateUserPwdDto) {
    if(!bcrypt.compareSync(updateUserDto.nowpassword, user.password)){
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }
    if(updateUserDto.nowpassword === updateUserDto.newpassword) {
      throw new ForbiddenException('새로운 비밀번호가 기존 비밀번호와 동일합니다.');
    }
    return await this.updatepassword(user, updateUserDto.newpassword);
  }

  async updatepassword(user: User, password: string) {
    user.password = await bcrypt.hashSync(password, 10);
    return await this.userRepository.save(user);
  }

  async updateNick(user: User, updateUserNickDto: UpdateUserNickDto) {
    user.nickname = updateUserNickDto.nickname;
    return await this.userRepository.save(user);
  }

  async updateRefresh(user: User, refreshToken: string, changeexpired: boolean) {
    user.refreshtoken = refreshToken;
    if(changeexpired) {
      const now = new Date();
      const expires = new Date(now.getTime() + 24*60*60*1000*180);
      user.refreshTokenExpiresIn = expires;
    }
    return await this.userRepository.save(user);
  }

  async uploadProfileImage(user: User, profile: string) {
    user.profile_image = profile;
    return await this.userRepository.save(user);
  }

  findAll() {
    return this.userRepository.find();
  }

  findOne(id: number) {
    return this.userRepository.findById(id);
  }

  findByUserId(user_id: string) {
    return this.userRepository.findByUserId(user_id);
  }

  findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  findByNickname(nickname: string) {
    return this.userRepository.findByNickname(nickname);
  }

  findByRefreshToken(refreshToken: string) {
    return this.userRepository.findByRefreshToken(refreshToken);
  }

  findComingMeetings(user: User, type: string) {
    const possible_type = ["all", "mine", "joined"];
    if(!type) {
      type = "all";
    }
    if(!possible_type.includes(type)) {
      throw new ForbiddenException('잘못된 타입입니다.');
    }
    return this.userRepository.findComingMeetings(user, type);
  }

  findPastMeetings(user: User, type: string) {
    const possible_type = ["all", "mine", "joined"];
    if(!type) {
      type = "all";
    }
    if(!possible_type.includes(type)) {
      throw new ForbiddenException('잘못된 타입입니다.');
    }
    return this.userRepository.findPastMeetings(user, type);
  }

  findLikedMeetings(user: User, type: string) {
    const possible_type = ["all"];
    if(!type) {
      type = "all";
    }
    if(!possible_type.includes(type)) {
      throw new ForbiddenException('잘못된 타입입니다.');
    }
    return this.userRepository.findLikedMeetings(user, type);
  }

  findAllMyComments(user: User) {
    return this.userRepository.findAllMyComments(user);
  }

  async remove(user: User) {
    return this.userRepository.delete(user.id);
  }
}
