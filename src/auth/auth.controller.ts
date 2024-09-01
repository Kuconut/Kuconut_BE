import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './security/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthDto } from './dto/auth.dto';
import { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('Signin')
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 401, description: '아이디 또는 비밀번호 틀림' })
  @ApiResponse({ status: 200, description: '그 외 정상적 응답' })
  signin(@Body() signinDto: AuthDto.SignIn) {
    return this.authService.signin(signinDto);
  }

  @Post('Signup')
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 401, description: '존재하는 아이디 혹은 닉네임' })
  @ApiResponse({ status: 200, description: '그 외 정상적 응답' })
  signup(@Body() signupDto: AuthDto.SignUp) {
    return this.authService.signup(signupDto);
  }

  @Post('Signout')
  @ApiOperation({ summary: '로그아웃' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('token')
  async signout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { user }:any = req;
    await this.authService.signout(user);
//    res.clearCookie('refreshToken');
    return res.send({ message: 'logout success' });
  }

  @Post('Refresh')
  @ApiOperation({ summary: '토큰 재발급' })
  @ApiResponse({ status: 401, description: '리프레시 토큰이 유효하지 않음' })
  @ApiResponse({ status: 200, description: '그 외 정상적 응답' })
  refresh(@Body() refresh: AuthDto.Refresh) {
    return this.authService.refreshToAccessToken(refresh.refreshToken);
  }

  @Get('Checkid:chk_user_id')
  @ApiOperation({ summary: '아이디 중복확인' })
  @ApiResponse({ status: 403, description: '존재하는 아이디' })
  @ApiResponse({ status: 200, description: '사용 가능한 아이디' })
  chkid(@Param('chk_user_id') chk_user_id: string) {
    return this.authService.chkid(chk_user_id);
  }

  @Get('Checknickname:chk_nickname')
  @ApiOperation({ summary: '닉네임 중복확인' })
  @ApiResponse({ status: 403, description: '존재하는 닉네임' })
  @ApiResponse({ status: 200, description: '사용 가능한 닉네임' })
  chknickname(@Param('chk_nickname') chk_nickname: string) {
    return this.authService.chknickname(chk_nickname);
  }

  @Get('Checktoken')
  @ApiOperation({ summary: '토큰 확인' })
  @ApiResponse({ status: 401, description: '토큰이 유효하지 않음' })
  @ApiResponse({ status: 200, description: '토큰이 유효함' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth('token')
  checkToken(@Req() req: Request) {
    return "인증된 토큰입니다.";
  }

  @Post('SendemailVerify')
  @ApiOperation({ summary: '이메일 인증번호 전송' })
  @ApiResponse({ status: 403, description: '이미 가입된 이메일' })
  @ApiResponse({ status: 200, description: '이메일 전송 성공' })
  sendEmailVerify(@Body() emailDto: AuthDto.email) {
    return this.authService.sendEmailVerify(emailDto.email);
  }

  @Post('SendemailForgotId')
  @ApiOperation({ summary: '아이디 찾기 이메일 전송' })
  @ApiResponse({ status: 403, description: '가입되지 않은 이메일' })
  @ApiResponse({ status: 200, description: '이메일 전송 성공' })
  sendEmailForgotId(@Body() emailDto: AuthDto.email) {
    return this.authService.sendEmailForgotId(emailDto.email);
  }

  @Post('SendemailForgotPassword')
  @ApiOperation({ summary: '비밀번호 찾기 이메일 전송' })
  @ApiResponse({ status: 403.1, description: '가입되지 않은 이메일' })
  @ApiResponse({ status: 403.2, description: '일치하지 않는 아이디' })
  @ApiResponse({ status: 200, description: '이메일 전송 성공' })
  sendEmailForgotPassword(@Body() emailDto: AuthDto.forgotPassword) {
    return this.authService.sendEmailForgotPassword(emailDto.user_id, emailDto.email);
  }

  @Post('Verify')
  @ApiOperation({ summary: '이메일 인증번호 확인' })
  @ApiResponse({ status: 404, description: '만료되었거나 입력되지 않은 이메일' })
  @ApiResponse({ status: 401, description: '인증번호 불일치' })
  @ApiResponse({ status: 200, description: '인증 성공' })
  verify(@Body() verifyDto: AuthDto.checkEmail) {
    return this.authService.verifyEmail(verifyDto.email, verifyDto.verifynumber);
  }

  @Post('ForgotId')
  @ApiOperation({ summary: '아이디 찾기' })
  @ApiResponse({ status: 404, description: '만료되었거나 입력되지 않은 이메일' })
  @ApiResponse({ status: 401, description: '인증번호 불일치' })
  @ApiResponse({ status: 200, description: '인증 성공' })
  forgotId(@Body() forgotIdDto: AuthDto.checkEmail) {
    return this.authService.verifyForgotId(forgotIdDto.email, forgotIdDto.verifynumber);
  }

  @Patch('ForgotPassword')
  @ApiOperation({ summary: '비밀번호 찾기' })
  @ApiResponse({ status: 404, description: '만료되었거나 입력되지 않은 이메일' })
  @ApiResponse({ status: 401.1, description: '아이디 불일치' })
  @ApiResponse({ status: 401.2, description: '인증번호 불일치' })
  @ApiResponse({ status: 200, description: '인증 성공' })
  forgotPassword(@Body() forgotPasswordDto: AuthDto.checkForgotPassword) {
    return this.authService.verifyForgotPassword(forgotPasswordDto.user_id, forgotPasswordDto.email, forgotPasswordDto.verifynumber);
  }
}
