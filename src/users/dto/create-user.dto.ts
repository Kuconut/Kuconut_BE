import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Length, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
    @ApiProperty({
        example: 'honggildong',
        description: 'user id',
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
