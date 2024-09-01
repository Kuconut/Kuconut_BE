import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Length, Matches, MaxLength } from "class-validator";

export namespace AuthDto {
    export class checkID {
        @ApiProperty({
            example: 'honggildong',
            description: 'user_id',
        })
        @IsNotEmpty()
        @IsString()
        @Length(4, 20)
        @Matches(/^[a-zA-Z0-9!@#$^*?_%]+$/, { message: '아이디는 영문자, 숫자, 그리고 !@#$^*?_% 만 포함할 수 있습니다.' })
        user_id: string;
    }

    export class checkPassword {
        @ApiProperty({
            example: '12345678!',
            description: 'user_password',
        })
        @IsNotEmpty()
        @IsString()
        @Length(8, 20)
        @Matches(/^[a-zA-Z0-9!@#$^*?_%]+$/, { message: '비밀번호는 영문자, 숫자, 그리고 !@#$^*?_% 만 포함할 수 있습니다.' })
        user_password: string;
    }

    export class email {
        @ApiProperty({
            example: "wintery39@korea.ac.kr",
            description: 'user_email',
        })
        email: string;
    }
    export class checkEmail {
        @ApiProperty({
            example: "wintery39@korea.ac.kr",
            description: 'user_email',
        })
        email: string;
        @ApiProperty({
            example: '524372',
            description: 'verify number',
        })
        @IsString()
        verifynumber: string;
    }

    export class forgotPassword {
        @ApiProperty({
            example: "honggildong",
            description: 'user_id',
        })
        @IsNotEmpty()
        @IsString()
        @Length(4, 20)
        @Matches(/^[a-zA-Z0-9!@#$^*?_%]+$/, { message: '아이디는 영문자, 숫자, 그리고 !@#$^*?_% 만 포함할 수 있습니다.' })
        user_id: string;

        @ApiProperty({
            example: "wintery39@korea.ac.kr",
            description: 'user_email',
        })
        email: string;
    }

    export class checkForgotPassword {
        @ApiProperty({
            example: "honggildong",
            description: 'user_id',
        })
        @IsNotEmpty()
        @IsString()
        @Length(4, 20)
        @Matches(/^[a-zA-Z0-9!@#$^*?_%]+$/, { message: '아이디는 영문자, 숫자, 그리고 !@#$^*?_% 만 포함할 수 있습니다.' })
        user_id: string;

        @ApiProperty({
            example: "wintery39@korea.ac.kr",
            description: 'user_email',
        })
        email: string;
        @ApiProperty({
            example: '524372',
            description: 'verify number',
        })
        @IsString()
        verifynumber: string;
    }


    export class SignUp {
        @ApiProperty({
            example: 'honggildong',
            description: 'user_id',
        })
        @IsNotEmpty()
        @IsString()
        @Length(4, 20)
        @Matches(/^[a-zA-Z0-9!@#$^*?_%]+$/, { message: '아이디는 영문자, 숫자, 그리고 !@#$^*?_% 만 포함할 수 있습니다.' })
        user_id: string;

        @ApiProperty({
            example: '1q2w3e4r',
            description: 'password',
        })
        @IsNotEmpty()
        @IsString()
        @Length(8, 20)
        @Matches(/^[a-zA-Z0-9!@#$^*?_%]+$/, { message: '비밀번호는 영문자, 숫자, 그리고 !@#$^*?_% 만 포함할 수 있습니다.' })
        password: string;

        @ApiProperty({
            example: 'thisisemail@email.co.kr',
            description: 'email',
        })
        @IsNotEmpty()
        @IsString()
        @MaxLength(100)
        email: string;

        @ApiProperty({
            example: '홍길동123',
            description: 'nickname',
        })
        @IsNotEmpty()
        @IsString()
        @Length(2, 10)
        @Matches(/^[a-zA-Z0-9가-힣!@#$^*?_%]+$/, { message: '닉네임은 영문자, 숫자, 한글, 그리고 !@#$^*?_% 만 포함할 수 있습니다.' })
        nickname: string;
    }

    export class SignIn {
        @ApiProperty({
            example: 'honggildong',
            description: 'user_id',
        })
        @IsNotEmpty()
        @IsString()
        @Length(4, 20)
        @Matches(/^[a-zA-Z0-9!@#$^*?_%]+$/, { message: '아이디는 영문자, 숫자, 그리고 !@#$^*?_% 만 포함할 수 있습니다.' })
        user_id: string;

        @ApiProperty({
            example: '1q2w3e4r',
            description: 'password',
        })
        @IsNotEmpty()
        @IsString()
        @Length(8, 20)
        @Matches(/^[a-zA-Z0-9!@#$^*?_%]+$/, { message: '비밀번호는 영문자, 숫자, 그리고 !@#$^*?_% 만 포함할 수 있습니다.' })
        password: string;
    }

    export class Refresh {
        @ApiProperty({
            example: 'refreshToken',
            description: 'refreshToken',
        })
        @IsString()
        refreshToken: string;
    }
}